import React from 'react'

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
  }

  return <span className={`${variantClasses[variant]} ${className}`}>{children}</span>
}

export default Badge
