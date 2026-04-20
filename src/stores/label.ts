import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useCatStore } from './cat'

export const LABEL_SIZES = ['small', 'medium', 'large', 'xlarge'] as const

export type LabelSize = typeof LABEL_SIZES[number]

export interface LabelSizeMetrics {
  fontSize: number
  lineHeight: number
  reservedHeight: number
}

export interface LabelMetrics extends LabelSizeMetrics {
  isVisible: boolean
}

export const LABEL_SIZE_MAP: Record<LabelSize, LabelSizeMetrics> = {
  small: {
    fontSize: 18,
    lineHeight: 24,
    reservedHeight: 32,
  },
  medium: {
    fontSize: 24,
    lineHeight: 32,
    reservedHeight: 44,
  },
  large: {
    fontSize: 32,
    lineHeight: 40,
    reservedHeight: 56,
  },
  xlarge: {
    fontSize: 40,
    lineHeight: 48,
    reservedHeight: 68,
  },
}

export function getLabelMetrics(text: string, size: LabelSize, scale: number): LabelMetrics {
  const trimmedText = text.trim()

  if (!trimmedText) {
    return {
      fontSize: 0,
      lineHeight: 0,
      reservedHeight: 0,
      isVisible: false,
    }
  }

  const baseMetrics = LABEL_SIZE_MAP[size]
  const factor = scale / 100

  return {
    fontSize: Math.max(1, Math.round(baseMetrics.fontSize * factor)),
    lineHeight: Math.max(1, Math.round(baseMetrics.lineHeight * factor)),
    reservedHeight: Math.max(1, Math.round(baseMetrics.reservedHeight * factor)),
    isVisible: true,
  }
}

export const useLabelStore = defineStore('label', () => {
  const text = ref('')
  const size = ref<LabelSize>('medium')
  const catStore = useCatStore()
  const hasText = computed(() => text.value.trim().length > 0)
  const metrics = computed(() => getLabelMetrics(text.value, size.value, catStore.window.scale))

  return {
    text,
    size,
    hasText,
    metrics,
  }
})
