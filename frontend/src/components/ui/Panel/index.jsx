import React from 'react'
import { motion } from 'framer-motion'

/**
 * Panel Component - Reusable glassmorphism panel wrapper
 *
 * Provides consistent styling with backdrop blur, transparency, and smooth animations
 * Supports dark mode and multiple variants
 */
const Panel = ({
  children,
  className = '',
  variant = 'default',
  animate = true,
  ...props
}) => {
  const variants = {
    default: 'backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-white/20 dark:border-white/10',
    floating: 'backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border border-white/30 dark:border-white/15 shadow-2xl',
    sidebar: 'backdrop-blur-md bg-white/85 dark:bg-gray-900/85 border border-white/10 dark:border-white/5',
    modal: 'backdrop-blur-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
  }

  const baseClasses = 'rounded-2xl shadow-xl transition-all duration-300'
  const variantClasses = variants[variant] || variants.default

  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  } : {}

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...animationProps}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Panel
