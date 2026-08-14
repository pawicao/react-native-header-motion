#import <QuartzCore/QuartzCore.h>

#import "HeaderMotionRefreshControlComponentView.h"

#import <React/RCTComponentViewProtocol.h>
#import <React/RCTConversions.h>
#import <React/RCTScrollViewComponentView.h>

#import <react/renderer/components/rnheadermotion/ComponentDescriptors.h>
#import <react/renderer/components/rnheadermotion/EventEmitters.h>
#import <react/renderer/components/rnheadermotion/Props.h>
#import <react/renderer/components/rnheadermotion/RCTComponentViewHelpers.h>

using namespace facebook::react;

static void *HeaderMotionRefreshContentOffsetContext = &HeaderMotionRefreshContentOffsetContext;

static const NSInteger HeaderMotionRefreshPhaseIdle = 0;
static const NSInteger HeaderMotionRefreshPhasePulling = 1;
static const NSInteger HeaderMotionRefreshPhaseReady = 2;
static const NSInteger HeaderMotionRefreshPhaseRefreshing = 3;
static const NSInteger HeaderMotionRefreshPhaseCancelling = 4;
static const NSInteger HeaderMotionRefreshPhaseFinishing = 5;
static const NSInteger HeaderMotionRefreshPhaseDisabled = 6;
static const CGFloat HeaderMotionRefreshDefaultTriggerDistance = 80.0;
static const NSInteger HeaderMotionRefreshDefaultSettleDurationMs = 180;
static const NSInteger HeaderMotionRefreshDefaultConfirmationTimeoutMs = 200;

static const std::shared_ptr<const HeaderMotionRefreshControlProps> &HeaderMotionRefreshControlDefaultProps()
{
  static const auto defaultProps = std::make_shared<const HeaderMotionRefreshControlProps>();
  return defaultProps;
}

@interface HeaderMotionRefreshControlComponentView () <RCTHeaderMotionRefreshControlViewProtocol>
@end

@implementation HeaderMotionRefreshControlComponentView {
  __weak RCTScrollViewComponentView *_scrollViewComponentView;
  __weak UIScrollView *_scrollView;
  BOOL _observingContentOffset;
  BOOL _enabled;
  BOOL _refreshing;
  BOOL _keepScrollContentPinned;
  CGFloat _progressViewOffset;
  CGFloat _triggerDistance;
  CGFloat _pullDistance;
  NSInteger _refreshConfirmationTimeout;
  NSInteger _progressSettleDuration;
  NSInteger _phase;
  // Invalidates in-flight confirmation-fallback blocks: a block only acts when
  // its captured generation still matches, so a timer scheduled for an earlier
  // refresh cycle can never settle a later one.
  NSInteger _fallbackGeneration;
  CADisplayLink *_settleDisplayLink;
  CFTimeInterval _settleStartTime;
  CGFloat _settleStartDistance;
  NSInteger _settlePhase;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<HeaderMotionRefreshControlComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _props = HeaderMotionRefreshControlDefaultProps();
    self.hidden = YES;
    _enabled = YES;
    _keepScrollContentPinned = YES;
    _triggerDistance = HeaderMotionRefreshDefaultTriggerDistance;
    _refreshConfirmationTimeout = HeaderMotionRefreshDefaultConfirmationTimeoutMs;
    _progressSettleDuration = HeaderMotionRefreshDefaultSettleDurationMs;
    _phase = HeaderMotionRefreshPhaseIdle;
  }

  return self;
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [self detachFromScrollView];
  [self stopSettlingAnimation];
  _fallbackGeneration++;
  // `RCTViewComponentView` keeps the previous mount's props across recycling,
  // and the reuse pass calls `updateProps:` with a null `oldProps`. Without
  // this reset the next mount would diff its props against the *previous*
  // screen's values and emit phantom transitions (a `Finishing` settle for a
  // control that mounts idle, for example). Restoring the defaults keeps the
  // diff aligned with the ivars reset below.
  _props = HeaderMotionRefreshControlDefaultProps();
  _enabled = YES;
  _refreshing = NO;
  _keepScrollContentPinned = YES;
  _progressViewOffset = 0;
  _triggerDistance = HeaderMotionRefreshDefaultTriggerDistance;
  _refreshConfirmationTimeout = HeaderMotionRefreshDefaultConfirmationTimeoutMs;
  _progressSettleDuration = HeaderMotionRefreshDefaultSettleDurationMs;
  _pullDistance = 0;
  _phase = HeaderMotionRefreshPhaseIdle;
}

- (void)didMoveToSuperview
{
  [super didMoveToSuperview];

  if (self.superview) {
    [self attachToScrollView];
  } else {
    [self detachFromScrollView];
  }
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldRefreshProps = static_cast<const HeaderMotionRefreshControlProps &>(*_props);
  const auto &newRefreshProps = static_cast<const HeaderMotionRefreshControlProps &>(*props);

  // Read the old props before `super` swaps `_props` — the reference above
  // points into the object the current `_props` owns, and nothing here keeps
  // it alive once that pointer is replaced.
  const BOOL enabledChanged = newRefreshProps.enabled != oldRefreshProps.enabled;
  const BOOL refreshingChanged = newRefreshProps.refreshing != oldRefreshProps.refreshing;

  [super updateProps:props oldProps:oldProps];

  _progressViewOffset = newRefreshProps.progressViewOffset;
  _triggerDistance = MAX(1, (CGFloat)newRefreshProps.triggerDistance);
  _keepScrollContentPinned = newRefreshProps.keepScrollContentPinned;
  _refreshConfirmationTimeout = newRefreshProps.refreshConfirmationTimeout;
  _progressSettleDuration = newRefreshProps.progressSettleDuration;
  // Track enabled/refreshing unconditionally so they never go stale when both
  // change within a single commit.
  _enabled = newRefreshProps.enabled;
  _refreshing = newRefreshProps.refreshing;
  [self updatePinnedContentTransformWithDistance:[self scrollViewPullDistance]];

  if (enabledChanged && !_enabled) {
    [self stopSettlingAnimation];
    _pullDistance = 0;
    [self resetPinnedContentTransform];
    [self emitProgress:HeaderMotionRefreshPhaseDisabled];
    return;
  }

  if (!_enabled) {
    return;
  }

  if (enabledChanged && _phase == HeaderMotionRefreshPhaseDisabled && !refreshingChanged) {
    if (_refreshing) {
      _pullDistance = _triggerDistance;
      [self emitProgress:HeaderMotionRefreshPhaseRefreshing];
    } else {
      [self emitProgress:HeaderMotionRefreshPhaseIdle];
    }
  }

  if (refreshingChanged) {
    if (_refreshing) {
      [self stopSettlingAnimation];
      _pullDistance = _triggerDistance;
      [self emitProgress:HeaderMotionRefreshPhaseRefreshing];
    } else {
      _pullDistance = _triggerDistance;
      [self animateToIdle:HeaderMotionRefreshPhaseFinishing];
    }
  }
}

- (void)updateEventEmitter:(const EventEmitter::Shared &)eventEmitter
{
  [super updateEventEmitter:eventEmitter];
  // On the mount path Fabric applies props before installing the event
  // emitter, so a phase emitted from that first updateProps (a control
  // mounting with `refreshing={true}` or `enabled={false}`) was dropped.
  // Replay the current phase once the emitter exists.
  if (_eventEmitter && _phase != HeaderMotionRefreshPhaseIdle) {
    [self emitProgress:_phase];
  }
}

- (void)attachToScrollView
{
  if (_scrollView) {
    [self detachFromScrollView];
  }

  _scrollViewComponentView = [RCTScrollViewComponentView findScrollViewComponentViewForView:self];
  if (!_scrollViewComponentView) {
    return;
  }

  _scrollView = _scrollViewComponentView.scrollView;
  [_scrollView.panGestureRecognizer addTarget:self action:@selector(handlePanGesture:)];
  [_scrollView addObserver:self
                forKeyPath:@"contentOffset"
                   options:NSKeyValueObservingOptionNew
                   context:HeaderMotionRefreshContentOffsetContext];
  _observingContentOffset = YES;
  [self updatePullDistanceFromScrollView];
}

- (void)dealloc
{
  [self detachFromScrollView];
}

- (void)detachFromScrollView
{
  // CADisplayLink retains its target — never leave it running past detach.
  [self stopSettlingAnimation];
  _fallbackGeneration++;

  if (_scrollView && _observingContentOffset) {
    [_scrollView removeObserver:self forKeyPath:@"contentOffset" context:HeaderMotionRefreshContentOffsetContext];
    [_scrollView.panGestureRecognizer removeTarget:self action:@selector(handlePanGesture:)];
  }

  _observingContentOffset = NO;
  [self resetPinnedContentTransform];
  _scrollView = nil;
  _scrollViewComponentView = nil;
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey, id> *)change
                       context:(void *)context
{
  if (context == HeaderMotionRefreshContentOffsetContext) {
    [self updatePullDistanceFromScrollView];
    return;
  }

  [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
}

- (void)handlePanGesture:(UIPanGestureRecognizer *)panGestureRecognizer
{
  // Treat the window between dispatching onRefresh and JS committing
  // `refreshing={true}` (phase Refreshing, _refreshing still NO) as
  // refreshing, otherwise a quick second pull double-fires onRefresh.
  if (!_enabled || _refreshing || _phase == HeaderMotionRefreshPhaseRefreshing) {
    return;
  }

  switch (panGestureRecognizer.state) {
    case UIGestureRecognizerStateBegan: {
      const CGFloat overscroll = [self scrollViewPullDistance];
      if (_settleDisplayLink && overscroll <= 0) {
        // A purely presentational settle (e.g. right after a refresh) with no
        // real overscroll — let it finish on its own timeline. The guard in
        // finishPullGesture keeps this gesture's release from reading the
        // decaying settle distance as a pull.
        break;
      }

      [self stopSettlingAnimation];
      // The settle animation eased _pullDistance on its own timeline; re-sync
      // it with the real overscroll so a stale value can neither freeze the
      // phase mid-settle nor pass the trigger check on release and re-fire
      // onRefresh from what was effectively a tap.
      _pullDistance = overscroll;
      if (_pullDistance > 0) {
        [self emitProgress:_pullDistance >= _triggerDistance ? HeaderMotionRefreshPhaseReady
                                                            : HeaderMotionRefreshPhasePulling];
      } else if (_phase != HeaderMotionRefreshPhaseIdle) {
        [self emitProgress:HeaderMotionRefreshPhaseIdle];
      }
      break;
    }

    case UIGestureRecognizerStateEnded:
    case UIGestureRecognizerStateCancelled:
    case UIGestureRecognizerStateFailed:
      [self finishPullGesture];
      break;

    default:
      break;
  }
}

- (void)updatePullDistanceFromScrollView
{
  if (!_scrollView || !_enabled) {
    return;
  }

  const CGFloat distance = [self scrollViewPullDistance];
  [self updatePinnedContentTransformWithDistance:distance];

  if (_refreshing || _phase == HeaderMotionRefreshPhaseRefreshing) {
    return;
  }

  if (_settleDisplayLink) {
    // A settle animation owns pull distance and event emission; letting the
    // scroll view's own bounce-back mutate _pullDistance here races the
    // display link and can emit Idle mid-settle.
    return;
  }

  _pullDistance = distance;

  if (_scrollView.panGestureRecognizer.state == UIGestureRecognizerStateChanged && distance > 0) {
    [self emitProgress:distance >= _triggerDistance ? HeaderMotionRefreshPhaseReady : HeaderMotionRefreshPhasePulling];
  } else if (distance == 0 && _phase != HeaderMotionRefreshPhaseIdle) {
    [self emitProgress:HeaderMotionRefreshPhaseIdle];
  }
}

- (void)finishPullGesture
{
  if (!_enabled || _refreshing || _phase == HeaderMotionRefreshPhaseRefreshing) {
    return;
  }

  if (_settleDisplayLink) {
    // A settle animation owns _pullDistance; this gesture never became a pull,
    // so its release must not read the decaying settle value as one.
    return;
  }

  if (_pullDistance >= _triggerDistance) {
    _pullDistance = _triggerDistance;
    [self emitProgress:HeaderMotionRefreshPhaseRefreshing];
    [self dispatchRefresh];
    [self scheduleControlledRefreshFallback];
    return;
  }

  [self animateToIdle:HeaderMotionRefreshPhaseCancelling];
}

- (CGFloat)scrollViewPullDistance
{
  if (!_scrollView) {
    return 0;
  }

  const CGFloat topInset = _scrollView.adjustedContentInset.top;
  return MAX(0, -(_scrollView.contentOffset.y + topInset));
}

- (void)updatePinnedContentTransformWithDistance:(CGFloat)distance
{
  if (!_scrollViewComponentView) {
    return;
  }

  UIView *containerView = _scrollViewComponentView.containerView;
  if (!_keepScrollContentPinned || !_enabled || distance <= 0) {
    containerView.transform = CGAffineTransformIdentity;
    return;
  }

  containerView.transform = CGAffineTransformMakeTranslation(0, -distance);
}

- (void)resetPinnedContentTransform
{
  _scrollViewComponentView.containerView.transform = CGAffineTransformIdentity;
}

- (void)scheduleControlledRefreshFallback
{
  _fallbackGeneration++;

  if (_refreshConfirmationTimeout <= 0) {
    // Fallback disabled — stay in Refreshing until the `refreshing` prop
    // commits, matching React Native's built-in refresh controls.
    return;
  }

  const NSInteger generation = _fallbackGeneration;
  __weak HeaderMotionRefreshControlComponentView *weakSelf = self;
  dispatch_after(
      dispatch_time(DISPATCH_TIME_NOW, (int64_t)_refreshConfirmationTimeout * (int64_t)NSEC_PER_MSEC),
      dispatch_get_main_queue(),
      ^{
    HeaderMotionRefreshControlComponentView *strongSelf = weakSelf;
    if (!strongSelf || strongSelf->_fallbackGeneration != generation || strongSelf->_refreshing ||
        strongSelf->_phase != HeaderMotionRefreshPhaseRefreshing) {
      return;
    }

    [strongSelf animateToIdle:HeaderMotionRefreshPhaseFinishing];
  });
}

- (void)animateToIdle:(NSInteger)settlingPhase
{
  [self stopSettlingAnimation];

  if (_pullDistance <= 0 || _progressSettleDuration <= 0) {
    _pullDistance = 0;
    [self emitProgress:_enabled ? HeaderMotionRefreshPhaseIdle : HeaderMotionRefreshPhaseDisabled];
    return;
  }

  _settlePhase = settlingPhase;
  _settleStartDistance = _pullDistance;
  _settleStartTime = CACurrentMediaTime();
  // Emit the settling phase synchronously — the display link's first frame
  // lands a frame later, and that frame of lag is enough for the native
  // timeline to reach Idle before the JS presentation animation finishes.
  [self emitProgress:settlingPhase];
  _settleDisplayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(handleSettleFrame:)];
  [_settleDisplayLink addToRunLoop:NSRunLoop.mainRunLoop forMode:NSRunLoopCommonModes];
}

- (void)handleSettleFrame:(CADisplayLink *)displayLink
{
  const CFTimeInterval settleDuration = _progressSettleDuration / 1000.0;
  const CFTimeInterval elapsed = CACurrentMediaTime() - _settleStartTime;
  const CGFloat t = MIN(1, elapsed / settleDuration);
  const CGFloat eased = 1 - pow(1 - t, 2);
  _pullDistance = _settleStartDistance * (1 - eased);

  if (t >= 1) {
    [self stopSettlingAnimation];
    _pullDistance = 0;
    [self emitProgress:_enabled ? HeaderMotionRefreshPhaseIdle : HeaderMotionRefreshPhaseDisabled];
    return;
  }

  [self emitProgress:_settlePhase];
}

- (void)stopSettlingAnimation
{
  [_settleDisplayLink invalidate];
  _settleDisplayLink = nil;
}

- (void)dispatchRefresh
{
  if (!_eventEmitter) {
    return;
  }

  static_cast<const HeaderMotionRefreshControlEventEmitter &>(*_eventEmitter).onRefresh({});
}

- (void)emitProgress:(NSInteger)phase
{
  _phase = phase;

  if (!_eventEmitter) {
    return;
  }

  const CGFloat triggerDistance = MAX(1, _triggerDistance);
  HeaderMotionRefreshControlEventEmitter::OnRefreshProgress event = {
      (Float)(_pullDistance / triggerDistance),
      (Float)_pullDistance,
      (Float)triggerDistance,
      (int)phase,
  };
  static_cast<const HeaderMotionRefreshControlEventEmitter &>(*_eventEmitter).onRefreshProgress(event);
}

@end
