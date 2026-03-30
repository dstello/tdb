import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getEventsUrl } from './api'

export function useSSE() {
  const queryClient = useQueryClient()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    let retryDelay = 1000

    function connect() {
      const es = new EventSource(getEventsUrl())
      esRef.current = es

      const onRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['monitor'] })
        queryClient.invalidateQueries({ queryKey: ['stats'] })
        queryClient.invalidateQueries({ queryKey: ['issues'] })
        queryClient.invalidateQueries({ queryKey: ['boards'] })
        retryDelay = 1000
      }

      const onPing = () => {
        retryDelay = 1000
      }

      es.addEventListener('refresh', onRefresh)
      es.addEventListener('ping', onPing)

      es.onerror = () => {
        es.removeEventListener('refresh', onRefresh)
        es.removeEventListener('ping', onPing)
        es.close()
        setTimeout(connect, retryDelay)
        retryDelay = Math.min(retryDelay * 2, 10000)
      }
    }

    connect()

    return () => {
      esRef.current?.close()
    }
  }, [queryClient])
}
