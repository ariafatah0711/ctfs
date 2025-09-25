"use client"

import React from "react"
import { motion } from "framer-motion"

export default function TitlePage({
  children = "Title",
  size = "text-3xl",
  duration = 0.4,
  className = "",
}) {
  return (
    <motion.h1
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration }}
  className={`${size} font-bold text-center text-gray-900 dark:text-white drop-shadow ${className}`}
    >
      {children}
    </motion.h1>
  )
}
