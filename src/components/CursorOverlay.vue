<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSessionId } from '../utils/collaboration'
import { supabase } from '../utils/supabase'

interface Cursor {
  id: string
  user_id: string
  x: number
  y: number
  color: string
}

const cursors = ref<Cursor[]>([])
const channel = ref<any>(null)
const route = useRoute()
const currentUserId = getSessionId()

// Get random color for cursor
function getRandomColor(): string {
  const colors = [
    '#EF4444', // Red
    '#F59E0B', // Yellow
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

onMounted(() => {
  const magazineId = route.params.id as string
  if (!magazineId)
    return

  // Subscribe to cursor updates
  const cursorChannel = supabase.channel(`cursors-${magazineId}`)

  cursorChannel
    .on('presence', { event: 'sync' }, () => {
      const state = cursorChannel.presenceState()
      const cursorState = Object.values(state).flat().map((presence: any) => presence.cursor)
      cursors.value = cursorState
    })
    .on('presence', { event: 'join' }, ({ newPresences }: { key: string, newPresences: any[] }) => {
      cursors.value = [...cursors.value, ...newPresences.map((p: any) => p.cursor)]
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }: { key: string, leftPresences: any[] }) => {
      cursors.value = cursors.value.filter(c => !leftPresences.some((p: any) => p.cursor.id === c.id))
    })
    .subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        await cursorChannel.track({
          cursor: {
            id: currentUserId,
            user_id: currentUserId,
            x: 0,
            y: 0,
            color: getRandomColor(),
          },
        })
      }
    })

  channel.value = cursorChannel

  // Handle mouse movement
  const handleMouseMove = (e: MouseEvent) => {
    if (!channel.value || !currentUserId)
      return

    const cursor = {
      id: currentUserId,
      user_id: currentUserId,
      x: e.clientX,
      y: e.clientY,
      color: cursors.value.find(c => c.id === currentUserId)?.color || getRandomColor(),
    }

    channel.value.track({ cursor })
  }

  window.addEventListener('mousemove', handleMouseMove)

  // Cleanup function
  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    if (channel.value) {
      channel.value.unsubscribe()
    }
  })
})

// Filter out current user's cursor
const otherCursors = computed(() =>
  cursors.value.filter(cursor => cursor.user_id !== currentUserId),
)
</script>

<template>
  <div class="fixed inset-0 pointer-events-none z-50">
    <div
      v-for="cursor in otherCursors"
      :key="cursor.id"
      class="absolute"
      :style="{
        left: `${cursor.x}px`,
        top: `${cursor.y}px`,
        transform: 'translate(-50%, -50%)',
      }"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        :style="{ color: cursor.color }"
      >
        <path
          d="M1 1l7 14 2-6 6-2L1 1z"
          fill="currentColor"
          stroke="white"
          stroke-width="1.5"
        />
      </svg>
    </div>
  </div>
</template>
