package com.headermotion

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.HeaderMotionRefreshControlManagerDelegate
import com.facebook.react.viewmanagers.HeaderMotionRefreshControlManagerInterface

@ReactModule(name = HeaderMotionRefreshControlManager.REACT_CLASS)
internal class HeaderMotionRefreshControlManager :
  ViewGroupManager<HeaderMotionRefreshControlView>(),
  HeaderMotionRefreshControlManagerInterface<HeaderMotionRefreshControlView> {
  private val delegate =
    HeaderMotionRefreshControlManagerDelegate<
      HeaderMotionRefreshControlView,
      HeaderMotionRefreshControlManager,
    >(this)

  override fun getName() = REACT_CLASS

  override fun getDelegate(): ViewManagerDelegate<HeaderMotionRefreshControlView> = delegate

  override fun createViewInstance(reactContext: ThemedReactContext) =
    HeaderMotionRefreshControlView(reactContext)

  // The view carries live gesture and phase state (phase, pull distance,
  // pending confirmation fallbacks). Recycling an instance would leak that
  // state into an unrelated mount — e.g. a leftover REFRESHING phase blocks
  // every pull on the next screen. Opt out so each mount starts pristine.
  override fun prepareToRecycleView(
    reactContext: ThemedReactContext,
    view: HeaderMotionRefreshControlView,
  ): HeaderMotionRefreshControlView? = null

  @ReactProp(name = "enabled", defaultBoolean = true)
  override fun setEnabled(view: HeaderMotionRefreshControlView, value: Boolean) {
    view.refreshEnabled = value
  }

  @ReactProp(name = "refreshing", defaultBoolean = false)
  override fun setRefreshing(view: HeaderMotionRefreshControlView, value: Boolean) {
    view.refreshing = value
  }

  @ReactProp(name = "progressViewOffset", defaultFloat = 0f)
  override fun setProgressViewOffset(view: HeaderMotionRefreshControlView, value: Float) {
    view.progressViewOffsetPx = PixelUtil.toPixelFromDIP(value)
  }

  @ReactProp(name = "triggerDistance", defaultFloat = 80f)
  override fun setTriggerDistance(view: HeaderMotionRefreshControlView, value: Float) {
    view.triggerDistancePx = PixelUtil.toPixelFromDIP(value)
  }

  @ReactProp(name = "keepScrollContentPinned", defaultBoolean = true)
  override fun setKeepScrollContentPinned(view: HeaderMotionRefreshControlView, value: Boolean) {
    view.keepScrollContentPinned = value
  }

  @ReactProp(name = "refreshConfirmationTimeout", defaultInt = 200)
  override fun setRefreshConfirmationTimeout(view: HeaderMotionRefreshControlView, value: Int) {
    view.refreshConfirmationTimeoutMs = value.toLong()
  }

  @ReactProp(name = "progressSettleDuration", defaultInt = 180)
  override fun setProgressSettleDuration(view: HeaderMotionRefreshControlView, value: Int) {
    view.settleDurationMs = value.coerceAtLeast(0).toLong()
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> =
    (super.getExportedCustomDirectEventTypeConstants() ?: mutableMapOf<String, Any>()).apply {
      put(
        HeaderMotionRefreshEvent.EVENT_NAME,
        mapOf("registrationName" to "onRefresh")
      )
      put(
        HeaderMotionRefreshProgressEvent.EVENT_NAME,
        mapOf("registrationName" to "onRefreshProgress")
      )
    }

  companion object {
    const val REACT_CLASS = "HeaderMotionRefreshControl"
  }
}
