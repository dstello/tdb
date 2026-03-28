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

      es.addEventListener('refresh', () => {
        queryClient.invalidateQueries()
        retryDelay = 1000
      })

      es.addEventListener('ping', () => {
        retryDelay = 1000
      })

      es.onerror = () => {
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
