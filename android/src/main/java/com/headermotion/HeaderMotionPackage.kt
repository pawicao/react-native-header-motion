package com.headermotion

import com.facebook.react.BaseReactPackage
import com.facebook.react.ViewManagerOnDemandReactPackage
import com.facebook.react.bridge.ModuleSpec
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModuleList
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

@ReactModuleList(nativeModules = [])
class HeaderMotionPackage :
  BaseReactPackage(),
  ViewManagerOnDemandReactPackage {
  private val viewManagers: Map<String, ModuleSpec> by lazy {
    mapOf(
      HeaderMotionRefreshControlManager.REACT_CLASS to ModuleSpec.viewManagerSpec {
        HeaderMotionRefreshControlManager()
      }
    )
  }

  override fun createViewManagers(reactContext: ReactApplicationContext) =
    listOf<ViewManager<*, *>>(HeaderMotionRefreshControlManager())

  override fun getViewManagerNames(reactContext: ReactApplicationContext) =
    viewManagers.keys.toList()

  override fun getViewManagers(reactContext: ReactApplicationContext): MutableList<ModuleSpec> =
    viewManagers.values.toMutableList()

  override fun createViewManager(
    reactContext: ReactApplicationContext,
    viewManagerName: String,
  ) = viewManagers[viewManagerName]?.provider?.get() as? ViewManager<*, *>

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
    ReactModuleInfoProvider { mutableMapOf() }
}
