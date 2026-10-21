package com.headermotion

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.events.Event

internal class HeaderMotionRefreshProgressEvent(
  surfaceId: Int,
  viewTag: Int,
  private val progress: Float,
  private val pullDistancePx: Float,
  private val triggerDistancePx: Float,
  private val phase: Int,
) : Event<HeaderMotionRefreshProgressEvent>(surfaceId, viewTag) {
  override fun getEventName() = EVENT_NAME

  override fun canCoalesce() = true

  override fun getCoalescingKey() = phase.toShort()

  override fun getEventData(): WritableMap =
    Arguments.createMap().apply {
      putDouble("progress", progress.toDouble())
      putDouble("pullDistance", PixelUtil.toDIPFromPixel(pullDistancePx).toDouble())
      putDouble(
        "triggerDistance",
        PixelUtil.toDIPFromPixel(triggerDistancePx).toDouble()
      )
      putInt("phase", phase)
    }

  companion object {
    const val EVENT_NAME = "topRefreshProgress"
  }
}
