package com.headermotion

internal object HeaderMotionRefreshPhase {
  const val IDLE = 0
  const val PULLING = 1
  const val READY = 2
  const val REFRESHING = 3
  const val CANCELLING = 4
  const val FINISHING = 5
  const val DISABLED = 6
}
