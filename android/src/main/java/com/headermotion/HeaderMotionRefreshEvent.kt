package com.headermotion

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

internal class HeaderMotionRefreshEvent(surfaceId: Int, viewTag: Int) :
  Event<HeaderMotionRefreshEvent>(surfaceId, viewTag) {
  override fun getEventName() = EVENT_NAME

  override fun getEventData(): WritableMap = Arguments.createMap()

  companion object {
    const val EVENT_NAME = "topRefresh"
  }
}
