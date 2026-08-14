package com.headermotion

import android.animation.ValueAnimator
import android.content.Context
import android.os.SystemClock
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.NativeGestureUtil
import kotlin.math.abs
import kotlin.math.max

internal class HeaderMotionRefreshControlView(context: Context) : ViewGroup(context) {
  var refreshEnabled = true
    set(value) {
      field = value
      if (!value) {
        stopAnimation()
        // isBeingDragged is deliberately NOT cleared here: an open touch
        // stream must still reach onTouchEvent's disabled branch, which pairs
        // notifyNativeGestureEnded with the started gesture and releases the
        // parent's intercept lock. Clearing the flag would strand both.
        hasEligibleDown = false
        pullDistancePx = 0f
        emitProgress(HeaderMotionRefreshPhase.DISABLED)
      } else if (phase == HeaderMotionRefreshPhase.DISABLED) {
        if (refreshing) {
          // Match iOS: re-enabling while a controlled refresh is active must
          // come back as REFRESHING, not IDLE.
          pullDistancePx = max(pullDistancePx, triggerDistancePx)
          emitProgress(HeaderMotionRefreshPhase.REFRESHING)
        } else {
          emitProgress(HeaderMotionRefreshPhase.IDLE)
        }
      }
    }

  var refreshing = false
    set(value) {
      if (field == value) {
        return
      }

      field = value
      removeCallbacks(controlledRefreshFallback)
      if (!refreshEnabled) {
        // Fabric applies changed props one setter at a time, so a commit that
        // carries both `enabled={false}` and a `refreshing` change must not
        // emit active phases over DISABLED. Record the value only — the
        // refreshEnabled setter reconciles it on re-enable.
        return
      }
      if (value) {
        stopAnimation()
        pullDistancePx = max(pullDistancePx, triggerDistancePx)
        emitProgress(HeaderMotionRefreshPhase.REFRESHING)
      } else {
        pullDistancePx = max(pullDistancePx, triggerDistancePx)
        animateToIdle(HeaderMotionRefreshPhase.FINISHING)
      }
    }

  var progressViewOffsetPx = 0f
  var keepScrollContentPinned = true

  // How long to wait for the `refreshing` prop to commit after dispatching
  // onRefresh before settling back to idle. Zero or negative disables the
  // fallback (the control then waits indefinitely, like RN's built-in ones).
  var refreshConfirmationTimeoutMs = DEFAULT_CONFIRMATION_TIMEOUT_MS

  // Matches the JS progressSettleDuration so the phase reaches IDLE exactly
  // when the JS presentation progress finishes its own settle animation.
  var settleDurationMs = DEFAULT_SETTLE_DURATION_MS

  var triggerDistancePx = PixelUtil.toPixelFromDIP(DEFAULT_TRIGGER_DISTANCE)
    set(value) {
      field = max(1f, value)
      emitProgress(phase)
    }

  private val touchSlop = ViewConfiguration.get(context).scaledTouchSlop
  private val dragRate = 0.5f
  private var initialDownY = 0f
  private var initialDownX = 0f
  private var isBeingDragged = false
  private var hasEligibleDown = false
  private var activePointerId = INVALID_POINTER
  private var pullStartOffsetPx = 0f
  private var nativeGestureStarted = false
  private var pullDistancePx = 0f
  private var phase = HeaderMotionRefreshPhase.IDLE
  private var settleAnimator: ValueAnimator? = null

  // Mirrors the iOS controlled-refresh fallback: if JS never commits
  // `refreshing={true}` after onRefresh fired, settle back to idle.
  private val controlledRefreshFallback = Runnable {
    if (!refreshing && phase == HeaderMotionRefreshPhase.REFRESHING) {
      animateToIdle(HeaderMotionRefreshPhase.FINISHING)
    }
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    val child = getChildAt(0)
    if (child != null) {
      measureChild(child, widthMeasureSpec, heightMeasureSpec)
      setMeasuredDimension(
        resolveSize(child.measuredWidth, widthMeasureSpec),
        resolveSize(child.measuredHeight, heightMeasureSpec)
      )
    } else {
      setMeasuredDimension(
        MeasureSpec.getSize(widthMeasureSpec),
        MeasureSpec.getSize(heightMeasureSpec)
      )
    }
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    getChildAt(0)?.layout(0, 0, right - left, bottom - top)
  }

  override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
    // Phase REFRESHING with `refreshing` still false covers the window between
    // dispatching onRefresh and JS committing `refreshing={true}` — starting a
    // new pull there would double-fire onRefresh.
    val canStartPull =
      refreshEnabled &&
        !refreshing &&
        phase != HeaderMotionRefreshPhase.REFRESHING &&
        !canChildScrollUp()

    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        isBeingDragged = false
        // Only a DOWN that landed while a pull was possible may grow into a
        // pull. Without this, a gesture that started mid-list would reuse
        // coordinates recorded for an earlier gesture once the child scrolls
        // back to its top edge.
        hasEligibleDown = canStartPull
        if (canStartPull) {
          activePointerId = event.getPointerId(0)
          initialDownY = event.y
          initialDownX = event.x
        }
      }

      MotionEvent.ACTION_MOVE -> {
        if (!canStartPull || !hasEligibleDown) {
          return false
        }

        val pointerIndex = event.findPointerIndex(activePointerId)
        if (pointerIndex < 0) {
          return false
        }

        val yDiff = event.getY(pointerIndex) - initialDownY
        val xDiff = abs(event.getX(pointerIndex) - initialDownX)
        if (yDiff > touchSlop && yDiff > xDiff) {
          startDrag(event)
          updatePullDistance(pullStartOffsetPx + (yDiff - touchSlop) * dragRate)
          return true
        }
      }

      MotionEvent.ACTION_POINTER_UP -> onSecondaryPointerUp(event)

      MotionEvent.ACTION_UP,
      MotionEvent.ACTION_CANCEL -> {
        hasEligibleDown = false
      }
    }

    return false
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    if (!isBeingDragged) {
      return true
    }

    if (refreshing || !refreshEnabled) {
      // A controlled refresh started (or the control was disabled) mid-drag;
      // abandon the pull so it neither overrides the current phase nor
      // dispatches onRefresh on release.
      isBeingDragged = false
      finishNativeGesture(event)
      parent?.requestDisallowInterceptTouchEvent(false)
      return true
    }

    when (event.actionMasked) {
      MotionEvent.ACTION_MOVE -> {
        val pointerIndex = event.findPointerIndex(activePointerId)
        if (pointerIndex >= 0) {
          val pulled = (event.getY(pointerIndex) - initialDownY - touchSlop) * dragRate
          updatePullDistance(max(0f, pullStartOffsetPx + pulled))
        }
      }

      MotionEvent.ACTION_POINTER_UP -> onSecondaryPointerUp(event)

      MotionEvent.ACTION_UP,
      MotionEvent.ACTION_CANCEL -> {
        finishNativeGesture(event)
        finishPull()
      }
    }

    return true
  }

  private fun startDrag(event: MotionEvent) {
    isBeingDragged = true
    // Stop the settle animator only when a real drag starts — a plain tap must
    // not freeze a settle mid-flight. Carrying the residual distance over keeps
    // the pull continuous when the user catches a settling refresh UI.
    stopAnimation()
    pullStartOffsetPx = pullDistancePx
    parent?.requestDisallowInterceptTouchEvent(true)
    startNativeGesture(event)
  }

  private fun onSecondaryPointerUp(event: MotionEvent) {
    val pointerIndex = event.actionIndex
    if (event.getPointerId(pointerIndex) != activePointerId) {
      return
    }

    // The tracked pointer went up; hand tracking over to another pointer and
    // shift the reference coordinates so the pull distance stays continuous.
    val newPointerIndex = if (pointerIndex == 0) 1 else 0
    initialDownY += event.getY(newPointerIndex) - event.getY(pointerIndex)
    initialDownX += event.getX(newPointerIndex) - event.getX(pointerIndex)
    activePointerId = event.getPointerId(newPointerIndex)
  }

  override fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) {
    parent?.requestDisallowInterceptTouchEvent(disallowIntercept)
  }

  private fun canChildScrollUp(): Boolean {
    val child = getChildAt(0)
    return child?.canScrollVertically(-1) ?: false
  }

  private fun updatePullDistance(distance: Float) {
    pullDistancePx = distance
    val nextPhase =
      if (pullDistancePx >= triggerDistancePx) {
        HeaderMotionRefreshPhase.READY
      } else {
        HeaderMotionRefreshPhase.PULLING
      }
    emitProgress(nextPhase)
  }

  private fun finishPull() {
    isBeingDragged = false
    hasEligibleDown = false
    parent?.requestDisallowInterceptTouchEvent(false)

    if (pullDistancePx >= triggerDistancePx) {
      pullDistancePx = triggerDistancePx
      emitProgress(HeaderMotionRefreshPhase.REFRESHING)
      dispatchRefresh()
      removeCallbacks(controlledRefreshFallback)
      if (refreshConfirmationTimeoutMs > 0) {
        postDelayed(controlledRefreshFallback, refreshConfirmationTimeoutMs)
      }
      return
    }

    animateToIdle(HeaderMotionRefreshPhase.CANCELLING)
  }

  private fun animateToIdle(settlingPhase: Int) {
    stopAnimation()
    val startDistance = pullDistancePx

    if (startDistance <= 0f || settleDurationMs <= 0L) {
      pullDistancePx = 0f
      emitProgress(if (refreshEnabled) HeaderMotionRefreshPhase.IDLE else HeaderMotionRefreshPhase.DISABLED)
      return
    }

    settleAnimator =
      ValueAnimator.ofFloat(startDistance, 0f).apply {
        duration = settleDurationMs
        interpolator = DecelerateInterpolator()
        addUpdateListener {
          pullDistancePx = it.animatedValue as Float
          emitProgress(settlingPhase)
        }
        doOnEnd {
          pullDistancePx = 0f
          emitProgress(if (refreshEnabled) HeaderMotionRefreshPhase.IDLE else HeaderMotionRefreshPhase.DISABLED)
        }
      }
    // Emit the settling phase synchronously — the animator's first update
    // lands a frame later, and that frame of lag is enough for the native
    // timeline to reach IDLE before the JS presentation animation finishes.
    emitProgress(settlingPhase)
    settleAnimator?.start()
  }

  private fun stopAnimation() {
    settleAnimator?.let {
      // Strip listeners before cancelling — ValueAnimator fires onAnimationEnd
      // on cancel, which would zero pullDistancePx and emit a spurious IDLE.
      it.removeAllUpdateListeners()
      it.removeAllListeners()
      it.cancel()
    }
    settleAnimator = null
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    removeCallbacks(controlledRefreshFallback)
    stopAnimation()
    // If the view goes away mid-drag, the touch stream will never deliver the
    // UP/CANCEL that pairs notifyNativeGestureEnded with the started gesture —
    // close it defensively so future touches are not blocked.
    if (nativeGestureStarted) {
      val now = SystemClock.uptimeMillis()
      val cancelEvent = MotionEvent.obtain(now, now, MotionEvent.ACTION_CANCEL, 0f, 0f, 0)
      finishNativeGesture(cancelEvent)
      cancelEvent.recycle()
    }
    isBeingDragged = false
    hasEligibleDown = false
  }

  private fun emitProgress(nextPhase: Int) {
    phase = nextPhase
    val safeTrigger = max(1f, triggerDistancePx)
    dispatchProgress(pullDistancePx / safeTrigger, pullDistancePx, safeTrigger, nextPhase)
  }

  private fun dispatchRefresh() {
    val reactContext = context as? ReactContext ?: return
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    eventDispatcher?.dispatchEvent(
      HeaderMotionRefreshEvent(UIManagerHelper.getSurfaceId(this), id)
    )
  }

  private fun dispatchProgress(
    progress: Float,
    pullDistancePx: Float,
    triggerDistancePx: Float,
    phase: Int,
  ) {
    val reactContext = context as? ReactContext ?: return
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    eventDispatcher?.dispatchEvent(
      HeaderMotionRefreshProgressEvent(
        UIManagerHelper.getSurfaceId(this),
        id,
        progress,
        pullDistancePx,
        triggerDistancePx,
        phase
      )
    )
  }

  private fun startNativeGesture(event: MotionEvent) {
    if (nativeGestureStarted) {
      return
    }
    NativeGestureUtil.notifyNativeGestureStarted(this, event)
    nativeGestureStarted = true
  }

  private fun finishNativeGesture(event: MotionEvent) {
    if (!nativeGestureStarted) {
      return
    }
    NativeGestureUtil.notifyNativeGestureEnded(this, event)
    nativeGestureStarted = false
  }

  private inline fun ValueAnimator.doOnEnd(crossinline listener: () -> Unit) {
    addListener(
      object : android.animation.AnimatorListenerAdapter() {
        override fun onAnimationEnd(animation: android.animation.Animator) {
          listener()
        }
      }
    )
  }

  companion object {
    private const val INVALID_POINTER = -1
    private const val DEFAULT_TRIGGER_DISTANCE = 80f

    // Keep these in sync with the iOS defaults and the codegen spec defaults.
    private const val DEFAULT_SETTLE_DURATION_MS = 180L
    private const val DEFAULT_CONFIRMATION_TIMEOUT_MS = 200L
  }
}
