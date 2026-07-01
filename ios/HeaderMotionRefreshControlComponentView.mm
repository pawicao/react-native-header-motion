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
static const CFTimeInterval HeaderMotionRefreshSettleDuration = 0.18;

@interface HeaderMotionRefreshControlComponentView () <RCTHeaderMotionRefreshControlViewProtocol>
@end

@implementation HeaderMotionRefreshControlComponentView {
  __weak RCTScrollViewComponentView *_scrollViewComponentView;
  __weak UIScrollView *_scrollView;
  BOOL _observingContentOffset;
  BOOL _enabled;
  BOOL _refreshing;
  CGFloat _progressViewOffset;
  CGFloat _triggerDistance;
  CGFloat _pullDistance;
  NSInteger _phase;
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
    static const auto defaultProps = std::make_shared<const HeaderMotionRefreshControlProps>();
    _props = defaultProps;
    self.hidden = YES;
    _enabled = YES;
    _triggerDistance = HeaderMotionRefreshDefaultTriggerDistance;
    _phase = HeaderMotionRefreshPhaseIdle;
  }

  return self;
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [self detachFromScrollView];
  [self stopSettlingAnimation];
  _enabled = YES;
  _refreshing = NO;
  _progressViewOffset = 0;
  _triggerDistance = HeaderMotionRefreshDefaultTriggerDistance;
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

  [super updateProps:props oldProps:oldProps];

  _progressViewOffset = newRefreshProps.progressViewOffset;
  _triggerDistance = MAX(1, (CGFloat)newRefreshProps.triggerDistance);

  if (newRefreshProps.enabled != oldRefreshProps.enabled) {
    _enabled = newRefreshProps.enabled;
    if (!_enabled) {
      [self stopSettlingAnimation];
      _pullDistance = 0;
      [self emitProgress:HeaderMotionRefreshPhaseDisabled];
      return;
    }

    if (_phase == HeaderMotionRefreshPhaseDisabled) {
      [self emitProgress:HeaderMotionRefreshPhaseIdle];
    }
  }

  if (newRefreshProps.refreshing != oldRefreshProps.refreshing) {
    _refreshing = newRefreshProps.refreshing;
    if (_refreshing) {
      [self stopSettlingAnimation];
      _pullDistance = MAX(_pullDistance, _triggerDistance);
      [self emitProgress:HeaderMotionRefreshPhaseRefreshing];
    } else {
      [self animateToIdle:HeaderMotionRefreshPhaseFinishing];
    }
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

- (void)detachFromScrollView
{
  if (_scrollView && _observingContentOffset) {
    [_scrollView removeObserver:self forKeyPath:@"contentOffset" context:HeaderMotionRefreshContentOffsetContext];
    [_scrollView.panGestureRecognizer removeTarget:self action:@selector(handlePanGesture:)];
  }

  _observingContentOffset = NO;
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
  if (!_enabled || _refreshing) {
    return;
  }

  switch (panGestureRecognizer.state) {
    case UIGestureRecognizerStateBegan:
      [self stopSettlingAnimation];
      break;

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
  if (!_scrollView || !_enabled || _refreshing) {
    return;
  }

  const CGFloat topInset = _scrollView.adjustedContentInset.top;
  const CGFloat distance = MAX(0, -(_scrollView.contentOffset.y + topInset));
  _pullDistance = distance;

  if (_scrollView.panGestureRecognizer.state == UIGestureRecognizerStateChanged && distance > 0) {
    [self emitProgress:distance >= _triggerDistance ? HeaderMotionRefreshPhaseReady : HeaderMotionRefreshPhasePulling];
  } else if (distance == 0 && _phase != HeaderMotionRefreshPhaseIdle) {
    [self emitProgress:HeaderMotionRefreshPhaseIdle];
  }
}

- (void)finishPullGesture
{
  if (!_enabled || _refreshing) {
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

- (void)scheduleControlledRefreshFallback
{
  __weak HeaderMotionRefreshControlComponentView *weakSelf = self;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    HeaderMotionRefreshControlComponentView *strongSelf = weakSelf;
    if (!strongSelf || strongSelf->_refreshing) {
      return;
    }

    [strongSelf animateToIdle:HeaderMotionRefreshPhaseFinishing];
  });
}

- (void)animateToIdle:(NSInteger)settlingPhase
{
  [self stopSettlingAnimation];

  if (_pullDistance <= 0) {
    _pullDistance = 0;
    [self emitProgress:_enabled ? HeaderMotionRefreshPhaseIdle : HeaderMotionRefreshPhaseDisabled];
    return;
  }

  _settlePhase = settlingPhase;
  _settleStartDistance = _pullDistance;
  _settleStartTime = CACurrentMediaTime();
  _settleDisplayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(handleSettleFrame:)];
  [_settleDisplayLink addToRunLoop:NSRunLoop.mainRunLoop forMode:NSRunLoopCommonModes];
}

- (void)handleSettleFrame:(CADisplayLink *)displayLink
{
  const CFTimeInterval elapsed = CACurrentMediaTime() - _settleStartTime;
  const CGFloat t = MIN(1, elapsed / HeaderMotionRefreshSettleDuration);
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
