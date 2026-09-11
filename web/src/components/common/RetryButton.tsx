import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button, ButtonProps } from '../Button';
import { cn } from '../../utils/cn';

export interface RetryButtonProps extends Omit<ButtonProps, 'onClick'> {
  onRetry: () => void | Promise<void>;
  label?: string;
  className?: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  label = 'Try Again',
  variant = 'outline',
  size = 'sm',
  className,
  ...props
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleClick = async () => {
    setIsRetrying(true);
    try {
      await Promise.resolve(onRetry());
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isRetrying || props.disabled}
      leftIcon={
        <RefreshCw
          className={cn('w-3.5 h-3.5', isRetrying && 'animate-spin')}
        />
      }
      className={cn('transition-all', className)}
      {...props}
    >
      {isRetrying ? 'Retrying...' : label}
    </Button>
  );
};
