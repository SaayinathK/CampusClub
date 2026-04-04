import React from 'react';
import { cn } from '../../lib/utils';

export const Badge = ({
  className,
  variant = 'default',
  dot,
  leftIcon,
  children,
  ...props
}) => {
  const variantClass = `badge--${variant}`;

  return (
    <span
      className={cn(
        'badge',
        variantClass,
        className
      )}
      {...props}>
      
      {dot &&
      <span
        className="badge__dot" />

      }
      {leftIcon && <span className="badge__icon">{leftIcon}</span>}
      {children}
    </span>);

};
