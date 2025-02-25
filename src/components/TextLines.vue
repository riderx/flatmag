<script setup lang="ts">
import type { LineHeight, SizeRatio, Visual } from '../types'
import { computed } from 'vue'

interface LineSegment {
  x: number
  width: number
}

interface Line extends LineSegment {
  y: number
  col: number
}

const props = withDefaults(defineProps<{
  wordCount: number
  availableSpace: number
  columns: number
  lineHeight: LineHeight
  visuals: Visual[]
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}>(), {
  margins: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
})

const lineHeightPercent = computed((): number => {
  const [num, den] = props.lineHeight.split('/').map(Number)
  return (num / den) * 100
})

function getVisualWidth(ratio: SizeRatio): number {
  if (ratio === 'full')
    return 100
  const [num, den] = ratio.split('/').map(Number)
  return (num / den) * 100
}

function getLineSegments(columnIndex: number, y: number): LineSegment[] {
  const columnWidth = 100 / props.columns
  const columnStart = columnIndex * columnWidth
  const columnEnd = columnStart + columnWidth

  // Find visuals that intersect with this line
  const intersectingVisuals = props.visuals.filter((visual) => {
    const visualWidth = getVisualWidth(visual.width)
    const visualEnd = visual.x + visualWidth
    const visualHeight = getVisualWidth(visual.height)
    const visualBottom = visual.y + visualHeight

    return (
      y >= visual.y && y <= visualBottom // Vertical intersection
      && ((visual.x >= columnStart && visual.x < columnEnd) // Visual starts in column
        || (visualEnd > columnStart && visualEnd <= columnEnd) // Visual ends in column
        || (visual.x <= columnStart && visualEnd >= columnEnd)) // Visual spans column
    )
  })

  if (intersectingVisuals.length === 0) {
    return [{ x: 0, width: 100 }]
  }

  // Sort visuals by x position
  const sortedVisuals = [...intersectingVisuals].sort((a, b) => a.x - b.x)

  const segments: LineSegment[] = []
  let currentX = 0

  sortedVisuals.forEach((visual) => {
    const visualWidth = getVisualWidth(visual.width)
    const visualStart = (visual.x - columnStart) / columnWidth * 100
    const visualEnd = visualStart + (visualWidth / columnWidth * 100)

    // Add segment before visual if there's space
    if (visualStart > currentX) {
      segments.push({
        x: currentX,
        width: visualStart - currentX,
      })
    }

    currentX = visualEnd
  })

  // Add final segment if there's space after last visual
  if (currentX < 100) {
    segments.push({
      x: currentX,
      width: 100 - currentX,
    })
  }

  return segments
}

const lines = computed(() => {
  const result: Line[] = []
  let y = 0

  while (y < 100) {
    for (let col = 0; col < props.columns; col++) {
      const segments = getLineSegments(col, y)
      segments.forEach((segment) => {
        if (segment.width > 0) {
          result.push({ y, col, ...segment })
        }
      })
    }
    y += lineHeightPercent.value + (lineHeightPercent.value * 0.3) // Add margin between lines
  }

  return result
})
</script>

<template>
  <div
    class="absolute inset-0"
    :style="{
      height: '100%',
      padding: `${margins.top}% ${margins.right}% ${margins.bottom}% ${margins.left}%`,
    }"
  >
    <div
      class="h-full relative"
      :style="{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: columns > 1 ? '2rem' : '0',
        columnRule: columns > 1 ? '1px solid #e5e7eb' : 'none',
        columnGap: columns > 1 ? '2rem' : '0',
      }"
    >
      <div
        v-for="(line, index) in lines"
        :key="`line-${index}`"
        class="bg-gray-300 rounded-sm absolute"
        :style="{
          height: `${lineHeightPercent}%`,
          width: `${line.width}%`,
          left: `${(line.col * (100 / columns)) + line.x}%`,
          top: `${line.y}%`,
        }"
      />
    </div>
  </div>
</template>
