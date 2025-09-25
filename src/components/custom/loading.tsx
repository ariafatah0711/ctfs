"use client"

import React from "react"

export default function Loader({
  size = 48,
  color = "text-blue-500",
  fullscreen = false,
}) {
  const containerClass = fullscreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-gray-900/70" // overlay transparan
    : "flex items-center justify-center"

  return (
    <div className={containerClass}>
      <svg
        className={`animate-spin ${color}`}
        width={size}
        height={size}
        viewBox="0 0 50 50"
      >
        <circle
          className="opacity-25"
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
        />
        <circle
          className="opacity-75"
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="90 150"
          strokeDashoffset="0"
        />
      </svg>
    </div>
  )
}
