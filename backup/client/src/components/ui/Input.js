import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({
  className,
  type = 'text',
  error,
  label,
  placeholder,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="relative">
      {/* Floating Label */}
      {label && (
        <motion.label
          className={cn(
            'absolute left-3 text-sm transition-all duration-200 pointer-events-none',
            (isFocused || hasValue || placeholder) 
              ? 'top-2 text-xs text-gray-500' 
              : 'top-1/2 -translate-y-1/2 text-gray-400'
          )}
          animate={{
            y: (isFocused || hasValue || placeholder) ? 0 : 0,
            scale: (isFocused || hasValue || placeholder) ? 0.85 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}

      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}

        {/* Input Field */}
        <motion.input
          ref={ref}
          type={type}
          className={cn(
            'flex h-12 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm',
            'transition-all duration-200',
            'placeholder:text-gray-400',
            'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            Icon && 'pl-10',
            RightIcon && 'pr-10',
            label && !placeholder && 'pt-6 pb-2',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          {...props}
        />

        {/* Right Icon */}
        {RightIcon && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onRightIconClick}
          >
            <RightIcon size={20} />
          </button>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
