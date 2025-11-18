import React from 'react'
import { motion } from 'framer-motion'

/**
 * IconButton Component - Accessible icon-only button
 *
 * Features:
 * - Multiple size variants
 * - Hover and active states with animations
 * - Focus indicators for accessibility
 * - Support for different styles
 */
const IconButton = ({
  icon: Icon,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
  ariaLabel,
  disabled = false,
  active = false,
  ...props
}) => {
  const variants = {
    default: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  }

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const baseClasses = 'rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
  const variantClasses = variants[variant] || variants.default
  const sizeClasses = sizes[size] || sizes.md
  const activeClasses = active ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${activeClasses} ${disabledClasses} ${className}`}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {Icon && <Icon className={iconSizes[size]} />}
    </motion.button>
  )
}

export default IconButton
