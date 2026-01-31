"use client"

import React from 'react'
import Script from 'next/script'

type Props = {
  modelPath?: string
  width?: number
  height?: number
  enabled?: boolean
}

export default function Live2DMaskotAnime({
  modelPath = 'https://model.hacxy.cn/Pio/model.json',
  width = 350,
  height = 350,
  enabled = true
}: Props) {
  if (!enabled) return null

  const initScript = () => {
    const tryInit = () => {
      const w = window as any
      if (w.L2Dwidget && typeof w.L2Dwidget.init === 'function') {
        try {
          w.L2Dwidget.init({
            model: {
              jsonPath: modelPath,
            },
            display: {
              position: '',
              width: width,
              height: height,
            },
            mobile: { show: false },
            react: { opacityDefault: 0.7 },
          })
        } catch (e) {
          // ignore
        }
      } else {
        setTimeout(tryInit, 150)
      }
    }

    tryInit()
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js"
        strategy="afterInteractive"
        onLoad={initScript}
      />
    </>
  )
}
