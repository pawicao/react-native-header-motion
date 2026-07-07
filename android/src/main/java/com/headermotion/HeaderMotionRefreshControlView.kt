package com.headermotion

import android.animation.ValueAnimator
import android.content.Context
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
        pullDistancePx = 0f
        emitProgress(HeaderMotionRefreshPhase.DISABLED)
      } else if (phase == HeaderMotionRefreshPhase.DISABLED) {
        emitProgress(HeaderMotionRefreshPhase.IDLE)
      }
    }

  var refreshing = false
    set(value) {
      if (field == value) {
        return
      }

      field = value
      if (value) {
        stopAnimation()
        pullDistancePx = max(pullDistancePx, triggerDistancePx)
        emitProgress(HeaderMotionRefreshPhase.REFRESHING)
      } else {
        animateToIdle(HeaderMotionRefreshPhase.FINISHING)
      }
    }

  var progressViewOffsetPx = 0f
  var keepScrollContentPinned = true

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
  private var nativeGestureStarted = false
  private var pullDistancePx = 0f
  private var phase = HeaderMotionRefreshPhase.IDLE
  private var settleAnimator: ValueAnimator? = null

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
    if (!refreshEnabled || refreshing || canChildScrollUp()) {
      return false
    }

    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        initialDownY = event.y
        initialDownX = event.x
        isBeingDragged = false
        stopAnimation()
      }

      MotionEvent.ACTION_MOVE -> {
        val yDiff = event.y - initialDownY
        val xDiff = abs(event.x - initialDownX)
        if (yDiff > touchSlop && yDiff > xDiff) {
          isBeingDragged = true
          parent?.requestDisallowInterceptTouchEvent(true)
          startNativeGesture(event)
          updatePullDistance((yDiff - touchSlop) * dragRate)
          return true
        }
      }
    }

    return false
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    if (!isBeingDragged) {
      return true
    }

    when (event.actionMasked) {
      MotionEvent.ACTION_MOVE -> {
        val distance = max(0f, (event.y - initialDownY - touchSlop) * dragRate)
        updatePullDistance(distance)
      }

      MotionEvent.ACTION_UP,
      MotionEvent.ACTION_CANCEL -> {
        finishNativeGesture(event)
        finishPull()
      }
    }

    return true
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
    parent?.requestDisallowInterceptTouchEvent(false)

    if (pullDistancePx >= triggerDistancePx) {
      pullDistancePx = triggerDistancePx
      emitProgress(HeaderMotionRefreshPhase.REFRESHING)
      dispatchRefresh()
      return
    }

    animateToIdle(HeaderMotionRefreshPhase.CANCELLING)
  }

  private fun animateToIdle(settlingPhase: Int) {
    stopAnimation()
    val startDistance = pullDistancePx

    if (startDistance <= 0f) {
      pullDistancePx = 0f
      emitProgress(if (refreshEnabled) HeaderMotionRefreshPhase.IDLE else HeaderMotionRefreshPhase.DISABLED)
      return
    }

    settleAnimator =
      ValueAnimator.ofFloat(startDistance, 0f).apply {
        duration = SETTLE_DURATION_MS
        interpolator = DecelerateInterpolator()
        addUpdateListener {
          pullDistancePx = it.animatedValue as Float
          emitProgress(settlingPhase)
        }
        doOnEnd {
          pullDistancePx = 0f
          emitProgress(if (refreshEnabled) HeaderMotionRefreshPhase.IDLE else HeaderMotionRefreshPhase.DISABLED)
        }
        start()
      }
  }

  private fun stopAnimation() {
    settleAnimator?.cancel()
    settleAnimator = null
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
    private const val DEFAULT_TRIGGER_DISTANCE = 80f
    private const val SETTLE_DURATION_MS = 180L
  }
}
