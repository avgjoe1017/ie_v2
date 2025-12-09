'use client';

import { useState, useRef, useEffect } from 'react';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PinInput({
  length = 6,
  onComplete,
  error,
  disabled = false,
}: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const prevErrorRef = useRef<string | undefined>(undefined);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Clear on error - only when error appears (not on every change)
  useEffect(() => {
    // Only reset if error transitions from falsy to truthy
    if (error && !prevErrorRef.current) {
      // Schedule state update to avoid synchronous setState in effect
      setTimeout(() => {
        setValues(Array(length).fill(''));
        inputRefs.current[0]?.focus();
      }, 0);
    }
    prevErrorRef.current = error;
  }, [error, length]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newValues.every((v) => v !== '')) {
      onComplete(newValues.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace moves to previous input
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        const newValues = [...values];
        newValues[index - 1] = '';
        setValues(newValues);
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Arrow keys navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData) {
      const newValues = [...values];
      for (let i = 0; i < Math.min(pastedData.length, length); i++) {
        newValues[i] = pastedData[i];
      }
      setValues(newValues);

      // Focus appropriate input
      const nextEmpty = newValues.findIndex((v) => !v);
      if (nextEmpty === -1) {
        inputRefs.current[length - 1]?.focus();
        if (newValues.every((v) => v !== '')) {
          onComplete(newValues.join(''));
        }
      } else {
        inputRefs.current[nextEmpty]?.focus();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-2">
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={disabled}
            className={`
              w-9 h-11 text-center text-base font-semibold rounded-lg
              border-2 transition-all duration-150
              focus:outline-none focus:ring-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                error
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-500/50'
                  : value
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
              }
              text-gray-900 dark:text-white
            `}
            aria-label={`PIN digit ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-xs text-red-600 dark:text-red-400 animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  );
}
