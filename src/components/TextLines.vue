<script setup lang="ts">
import type { LineHeight, SizeRatio, Visual } from '../types'
import { computed, ref } from 'vue'

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

const containerRef = ref<HTMLElement | null>(null)

// Convert LineHeight ratio to percentage
const lineHeightPercent = computed((): number => {
  const [num, den] = props.lineHeight.split('/').map(Number)
  return (num / den) * 100
})

// Get visual dimensions in percentage
function getVisualDimensions(visual: Visual): { width: number, height: number, x: number, y: number } {
  const width = visual.width === 'full' ? 100 : Number.parseInt(visual.width.split('/')[0]) / Number.parseInt(visual.width.split('/')[1]) * 100
  const height = visual.height === 'full' ? 100 : Number.parseInt(visual.height.split('/')[0]) / Number.parseInt(visual.height.split('/')[1]) * 100

  return {
    width,
    height,
    x: visual.x,
    y: visual.y,
  }
}

// Check if a line intersects with any visual
function lineIntersectsVisual(y: number, colStart: number, colEnd: number, visualsInColumn: Visual[]): LineSegment[] {
  // Start with full line
  let segments: LineSegment[] = [{ x: colStart, width: colEnd - colStart }]

  for (const visual of visualsInColumn) {
    // Add a small margin around each visual (0.75% on each side)
    const visualMargin = 1.5
    const { x, y: visualY, width, height } = getVisualDimensions(visual)

    // Apply margin to visual dimensions
    const marginedVisual = {
      x: Math.max(0, x - visualMargin),
      y: Math.max(0, visualY - visualMargin),
      width: width + (visualMargin * 2),
      height: height + (visualMargin * 2),
    }

    // Check if line is within vertical bounds of visual (with margin)
    if (y >= marginedVisual.y && y <= marginedVisual.y + marginedVisual.height) {
      // Visual intersects this line, need to update segments
      const visualStart = marginedVisual.x
      const visualEnd = marginedVisual.x + marginedVisual.width

      // Create new segments by "cutting out" the visual area
      const newSegments: LineSegment[] = []

      for (const segment of segments) {
        // Four cases: no overlap, left overlap, right overlap, or full containment
        if (visualEnd <= segment.x || visualStart >= segment.x + segment.width) {
          // No overlap, keep segment as is
          newSegments.push(segment)
        }
        else if (visualStart <= segment.x && visualEnd >= segment.x + segment.width) {
          // Visual fully contains segment, remove it (add nothing)
          continue
        }
        else if (visualStart <= segment.x && visualEnd < segment.x + segment.width) {
          // Visual overlaps left part of segment
          newSegments.push({
            x: visualEnd,
            width: segment.x + segment.width - visualEnd,
          })
        }
        else if (visualStart > segment.x && visualEnd >= segment.x + segment.width) {
          // Visual overlaps right part of segment
          newSegments.push({
            x: segment.x,
            width: visualStart - segment.x,
          })
        }
        else {
          // Visual is in middle of segment, split into two
          newSegments.push({
            x: segment.x,
            width: visualStart - segment.x,
          })
          newSegments.push({
            x: visualEnd,
            width: segment.x + segment.width - visualEnd,
          })
        }
      }

      segments = newSegments
    }
  }

  return segments
}

// Generate lines based on column layout and visuals
const lines = computed(() => {
  const columnWidth = 100 / props.columns
  const result: Line[] = []

  // Group visuals by their column intersection
  const visualsByColumn: Record<number, Visual[]> = {}

  // Initialize column arrays
  for (let col = 0; col < props.columns; col++) {
    visualsByColumn[col] = []
  }

  // Assign visuals to columns they intersect with
  props.visuals.forEach((visual) => {
    const { x, width } = getVisualDimensions(visual)
    const visualStart = x
    const visualEnd = x + width

    // Determine which columns this visual spans
    for (let col = 0; col < props.columns; col++) {
      const colStart = col * columnWidth
      const colEnd = colStart + columnWidth

      // Check if visual overlaps with this column
      if ((visualStart >= colStart && visualStart < colEnd)
        || (visualEnd > colStart && visualEnd <= colEnd)
        || (visualStart <= colStart && visualEnd >= colEnd)) {
        visualsByColumn[col].push(visual)
      }
    }
  })

  // Calculate total number of lines based on available space and line height
  const lineSpacing = lineHeightPercent.value * 1.2 // Add 20% for spacing between lines
  const totalLines = Math.floor((100 * props.availableSpace / 100) / lineSpacing) // Adjust for available space

  // Generate text lines for each column
  for (let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
    const y = (lineIndex * lineSpacing)

    for (let col = 0; col < props.columns; col++) {
      const colStart = col * columnWidth
      const colEnd = colStart + columnWidth

      // Get line segments that don't intersect with visuals
      const segments = lineIntersectsVisual(y, colStart, colEnd, visualsByColumn[col])

      // Add each valid segment as a line
      segments.forEach((segment) => {
        if (segment.width > 0) {
          result.push({
            y,
            col,
            x: segment.x,
            width: segment.width,
          })
        }
      })
    }
  }

  return result
})

// Generate visual indicators for line length based on typical word count
const lineWidths = computed(() => {
  // Create a map of line index to width percentage (0-100)
  const widths = new Map<number, number>()

  lines.value.forEach((line, index) => {
    // Randomize line width slightly for a more realistic look
    // Last line of paragraph should be shorter
    const isLastLine = (index + 1) % 5 === 0
    const widthModifier = isLastLine ? 0.5 + Math.random() * 0.3 : 0.9 + Math.random() * 0.1

    widths.set(index, line.width * widthModifier)
  })

  return widths
})
</script>

<template>
  <div
    ref="containerRef"
    class="w-full h-full overflow-hidden"
  >
    <div class="h-full w-full relative">
      <!-- Column dividers for visual reference -->
      <div
        v-if="columns > 1"
        class="absolute inset-0 grid h-full w-full"
        :style="{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          pointerEvents: 'none',
        }"
      >
        <div
          v-for="i in columns - 1"
          :key="i"
          class="border-r border-gray-200 h-full"
        />
      </div>

      <!-- Text lines that flow around images -->
      <div
        v-for="(line, index) in lines"
        :key="`line-${index}`"
        class="absolute rounded-sm"
        :class="index % 5 === 4 ? 'bg-gray-200' : 'bg-gray-300'"
        :style="{
          height: `${lineHeightPercent * 0.8}%`,
          width: `${lineWidths.get(index) || line.width}%`,
          left: `${line.x}%`,
          top: `${line.y}%`,
          opacity: 0.7 + (Math.random() * 0.3), // More visible with slight random variation
        }"
      />
    </div>
  </div>
</template>
