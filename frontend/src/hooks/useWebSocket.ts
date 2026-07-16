import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useWSStore } from '@/stores/websocket'

type EventHandler = (payload: any) => void

const handlers = new Map<string, Set<EventHandler>>()

export function onEvent(type: string, handler: EventHandler) {
  if (!handlers.has(type)) handlers.set(type, new Set())
  handlers.get(type)!.add(handler)
  return () => handlers.get(type)!.delete(handler)
}

export function useWebSocket() {
  const token = useAuthStore((s) => s.accessToken)
  const setConnected = useWSStore((s) => s.setConnected)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!token) return

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsURL = `${protocol}//${window.location.host}/ws?token=${token}`

      const ws = new WebSocket(wsURL)
      wsRef.current = ws

      ws.onopen = () => setConnected(true)

      ws.onclose = () => {
        setConnected(false)
        reconnectRef.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => ws.close()

      ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data)
          const hs = handlers.get(type)
          if (hs) hs.forEach((h) => h(payload))
        } catch {
          // ignore malformed messages
        }
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [token, setConnected])
}
