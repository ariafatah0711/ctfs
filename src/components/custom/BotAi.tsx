"use client"
import { useEffect } from 'react'

interface BotAiProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  dataId?: string
}

export default function BotAi({ dataId = 'cmjuh1zfq0001ie04t5e6zu7d', height = 680, width = '100%', style, ...iframeProps }: BotAiProps) {
  useEffect(() => {
    const existing = document.querySelector(`script[data-id="${dataId}"]`)
    if (existing) return

    const s = document.createElement('script')
    s.src = 'https://app.livechatai.com/embed.js'
    s.async = true
    s.defer = true
    s.setAttribute('data-id', dataId)
    document.body.appendChild(s)

    return () => {
      try {
        document.body.removeChild(s)
      } catch (e) {
        // ignore
      }
    }
  }, [dataId])

  return (
    null
  )
}
