"use client"

// https://github.com/evrstr/live2d-widget-models

import React, { useEffect } from 'react'
import Script from 'next/script'

type Props = {
  modelPath?: string
  position?: 'left' | 'right'
  width?: number
  height?: number
  enabled?: boolean
}

export default function Live2DInteractive({
  modelPath = 'https://cdn.jsdelivr.net/gh/evrstr/live2d-widget-models/live2d_evrstr/xisitina/model.json',
  position = 'left',
  width = 280,
  height = 250,
  enabled = true
}: Props) {
  useEffect(() => {
    if (!enabled) return

    const initLive2D = () => {
      const w = window as any
      if (w.L2Dwidget && typeof w.L2Dwidget.init === 'function') {
        try {
          w.L2Dwidget.init({
            model: {
              jsonPath: modelPath,
              scale: 1,
            },
            display: {
              position: position,
              width: width,
              height: height,
              hOffset: 0,
              vOffset: 20,
            },
            mobile: {
              show: true,
              scale: 0.5,
              motion: true,
            },
            react: {
              opacityDefault: 0.7,
              opacityOnHover: 0.2,
            },
            log: false,
          })

          console.log('Live2D widget initialized successfully')
        } catch (error) {
          console.error('Error initializing Live2D widget:', error)
        }
      }
    }

    // Wait a bit for the script to load
    const timer = setTimeout(initLive2D, 1000)
    return () => clearTimeout(timer)
  }, [enabled, modelPath, position, width, height])

  if (!enabled) return null

  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js"
      strategy="afterInteractive"
    />
  )
}
