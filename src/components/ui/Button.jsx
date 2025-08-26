import React from 'react'
import './Button.css'

export function Button({
  children,
  type = 'button',
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  icon,
  iconposition = 'left',
  ...rest
}) {
  const cls = `btn btn--${variant} btn--${size} ${disabled ? 'btn--disabled' : ''} ${className}`
  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {icon && iconposition === 'left' ? icon : null}
      {children}
      {icon && iconposition === 'right' ? icon : null}
    </button>
  )
}

export default Button
