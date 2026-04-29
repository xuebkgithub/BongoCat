import { PhysicalPosition } from '@tauri-apps/api/dpi'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { cursorPosition, monitorFromPoint } from '@tauri-apps/api/window'
import { useIntervalFn } from '@vueuse/core'
import { watch } from 'vue'

import { setMultiScreenFollow } from '@/plugins/window'
import { useCatStore } from '@/stores/cat'
import { useGeneralStore } from '@/stores/general'
import { isMac } from '@/utils/platform'

const POLL_INTERVAL_MS = 800

export function useMultiScreenFollow() {
  if (!isMac) return

  const generalStore = useGeneralStore()
  const catStore = useCatStore()
  const appWindow = getCurrentWebviewWindow()

  const tick = async () => {
    if (!catStore.window.visible) return

    const [winPos, winSize, cursor, scaleFactor] = await Promise.all([
      appWindow.outerPosition(),
      appWindow.outerSize(),
      cursorPosition(),
      appWindow.scaleFactor(),
    ])

    const cursorLogical = cursor.toLogical(scaleFactor)
    const winCenterLogical = new PhysicalPosition(
      winPos.x + Math.floor(winSize.width / 2),
      winPos.y + Math.floor(winSize.height / 2),
    ).toLogical(scaleFactor)

    const [cursorMon, winMon] = await Promise.all([
      monitorFromPoint(cursorLogical.x, cursorLogical.y),
      monitorFromPoint(winCenterLogical.x, winCenterLogical.y),
    ])

    if (!cursorMon || !winMon) return

    const sameMonitor
      = winMon.position.x === cursorMon.position.x
        && winMon.position.y === cursorMon.position.y
        && winMon.size.width === cursorMon.size.width
        && winMon.size.height === cursorMon.size.height

    if (sameMonitor) return

    const offsetX = winPos.x - winMon.position.x
    const offsetY = winPos.y - winMon.position.y

    const minX = cursorMon.position.x
    const maxX = cursorMon.position.x + cursorMon.size.width - winSize.width
    const minY = cursorMon.position.y
    const maxY = cursorMon.position.y + cursorMon.size.height - winSize.height

    const targetX = Math.max(minX, Math.min(cursorMon.position.x + offsetX, maxX))
    const targetY = Math.max(minY, Math.min(cursorMon.position.y + offsetY, maxY))

    if (targetX === winPos.x && targetY === winPos.y) return

    await appWindow.setPosition(new PhysicalPosition(targetX, targetY))
  }

  const { pause, resume } = useIntervalFn(tick, POLL_INTERVAL_MS, { immediate: false })

  watch(
    () => generalStore.app.multiScreenFollow,
    async (enabled) => {
      await setMultiScreenFollow(enabled)

      if (enabled) {
        resume()
      } else {
        pause()
      }
    },
    { immediate: true },
  )
}
