'use client'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid' // Necesitas instalarlo: npm install uuid

export const useAnalytics = () => {
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    // Generar un ID único por navegador si no existe
    let sid = localStorage.getItem('session_id')
    if (!sid) {
      sid = uuidv4()
      localStorage.setItem('session_id', sid as string)
    }
    setSessionId(sid as string)
  }, [])

  const trackEvent = async (type: 'click' | 'view', productId?: string) => {
    if (!sessionId) return

    try {
      await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify({
          type,
          session_id: sessionId,
          product_id: productId
        })
      })
    } catch (e) {
      console.error('Tracking error', e)
    }
  }

  return { sessionId, trackEvent }
}