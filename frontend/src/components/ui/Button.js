import React, { Children, cloneElement, forwardRef, isValidElement } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Button = forwardRef(
  (
  {
    className,
    variant = 'primary',
    size = 'md',
    asChild = false,
    isLoading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  },
  ref) =>
  {
    const content = (
      <>
        {isLoading &&
        <svg
          className="button__spinner"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          
            <circle
            className="button__spinner-circle"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4">
          </circle>
            <path
            className="button__spinner-path"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
          </svg>
        }
        {!isLoading && leftIcon && <span className="button__icon--left">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="button__icon--right">{rightIcon}</span>}
      </>
    );
    const buttonClassName = cn(
      'button',
      `button--${variant}`,
      `button--${size}`,
      className
    );

    if (asChild && isValidElement(children)) {
      const child = Children.only(children);

      return cloneElement(child, {
        ...props,
        className: cn(buttonClassName, child.props.className),
        'aria-disabled': disabled || isLoading || undefined
      });
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{
          scale: disabled || isLoading ? 1 : 0.98
        }}
        className={buttonClassName}
        disabled={disabled || isLoading}
        {...props}>
        {content}
      </motion.button>);

  }
);
Button.displayName = 'Button';
