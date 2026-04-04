import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const Card = forwardRef(
  ({ className, hoverable, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={
        hoverable ?
        {
          y: -4,
          transition: {
            duration: 0.2
          }
        } :
        undefined
        }
        className={cn(
          'card',
          hoverable && 'card--hoverable',
          className
        )}
        {...props}>
        
        {children}
      </motion.div>);

  }
);
Card.displayName = 'Card';
export const CardHeader = ({
  className,
  children,
  ...props
}) =>
<div
  className={cn('card__header', className)}
  {...props}>
  
    {children}
  </div>;

export const CardTitle = ({
  className,
  children,
  ...props
}) =>
<h3
  className={cn('card__title', className)}
  {...props}>
  
    {children}
  </h3>;

export const CardContent = ({
  className,
  children,
  ...props
}) =>
<div className={cn('card__content', className)} {...props}>
    {children}
  </div>;

export const CardFooter = ({
  className,
  children,
  ...props
}) =>
<div
  className={cn('card__footer', className)}
  {...props}>
  
    {children}
  </div>;
