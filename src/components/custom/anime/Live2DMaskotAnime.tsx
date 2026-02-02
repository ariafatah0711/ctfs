"use client"

import React, { useRef, useState, useCallback } from 'react'
import Script from 'next/script'

type Props = {
  modelPath?: string
  width?: number
  height?: number
  enabled?: boolean
  soundFiles?: string[]
}

export default function Live2DMaskotAnime({
  modelPath = 'https://model.hacxy.cn/Pio/model.json',
  width = 350,
  height = 350,
  enabled = true,
  soundFiles = [
    '/sounds/anime/anime1.mp3',
    '/sounds/anime/anime2.mp3',
    '/sounds/anime/anime3.mp3',
    '/sounds/anime/anime4.mp3',
    '/sounds/anime/anime5.mp3',
    '/sounds/anime/anime6.mp3',
  ]
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [soundQueue, setSoundQueue] = useState<string[]>([])
  const soundQueueRef = useRef<string[]>([])
  const [usedSounds, setUsedSounds] = useState<Set<string>>(new Set())

  // Initialize sound queue on mount
  React.useEffect(() => {
    soundQueueRef.current = [...soundFiles].sort(() => Math.random() - 0.5)
  }, [soundFiles])

  const getNextSound = useCallback(() => {
    if (soundQueueRef.current.length === 0) {
      // reset + shuffle ulang
      soundQueueRef.current = [...soundFiles].sort(() => Math.random() - 0.5)
    }

    return soundQueueRef.current.shift() || null
  }, [soundFiles])

  const playRandomSound = useCallback(() => {
    if (isPlaying || !audioRef.current) return

    const nextSound = getNextSound()
    if (!nextSound) return

    setIsPlaying(true)
    audioRef.current.src = nextSound
    audioRef.current.currentTime = 0
    audioRef.current.volume = 0.33

    audioRef.current.play().catch(() => {
      setIsPlaying(false)
    })
  }, [isPlaying, getNextSound])

  const handleAudioEnd = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleCanvasClick = useCallback((e: MouseEvent) => {
    if (isPlaying) return // Gak bisa click kalo sedang playing

    playRandomSound()

    // Trigger L2D native behavior by dispatching custom event
    const w = window as any
    if (w.L2Dwidget) {
      const canvas = e.target as HTMLCanvasElement
      if (canvas) {
        const mouseEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: e.clientX,
          clientY: e.clientY,
        })
        canvas.dispatchEvent(mouseEvent)

        setTimeout(() => {
          const mouseUpEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
          })
          canvas.dispatchEvent(mouseUpEvent)
        }, 100)
      }
    }
  }, [isPlaying, playRandomSound])

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

          // Add click listener to the canvas element
          let attempts = 0
          const attachClickListener = () => {
            const canvas = document.getElementById('live2dcanvas')
            const widget = document.getElementById('live2d-widget')

            if (canvas && widget) {
              // Enable pointer events on the widget container
              widget.style.pointerEvents = 'auto'
              canvas.style.cursor = 'pointer'

              canvas.addEventListener('click', handleCanvasClick)
              console.log('Click listener attached to live2dcanvas')
            } else if (attempts < 15) {
              attempts++
              setTimeout(attachClickListener, 200)
            } else {
              console.warn('Could not find Live2D canvas after retries')
            }
          }

          attachClickListener()
        } catch (e) {
          console.error('Error initializing L2D:', e)
        }
      } else {
        setTimeout(tryInit, 150)
      }
    }

    tryInit()
  }

  if (!enabled) return null

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js"
        strategy="afterInteractive"
        onLoad={initScript}
      />
    </>
  )
}

// https://github.com/EYHN/hexo-helper-live2d/blob/master/README.md
// https://typecast.ai/text-to-speech/697f7bb75f401c7a537d4a5f
