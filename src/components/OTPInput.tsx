import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  onChange: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
  loading?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  error = false,
  loading = false
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Allow only one digit
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Call onChange callback
    const otpString = newOtp.join('');
    onChange(otpString);

    // Move to next input if current field is filled
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all fields are filled
    if (newOtp.every(digit => digit !== '') && otpString.length === length) {
      onComplete?.(otpString);
    }
  };

  const handleClick = (index: number) => {
    inputRefs.current[index]?.setSelectionRange(1, 1);

    // Optional: Move to the first empty input
    if (index > 0 && !otp[index - 1]) {
      inputRefs.current[otp.indexOf('')]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      // Move focus to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.slice(0, length).split('');
    
    if (pasteArray.every(char => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pasteArray.forEach((char, index) => {
        if (index < length) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
      inputRefs.current[focusIndex]?.focus();
      
      // Call callbacks
      const otpString = newOtp.join('');
      onChange(otpString);
      if (newOtp.every(digit => digit !== '')) {
        onComplete?.(otpString);
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <motion.input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{1}"
          maxLength={6}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onClick={() => handleClick(index)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled || loading}
          className={`
            w-12 h-12 text-center text-xl font-semibold border-2 rounded-xl
            focus:outline-none focus:ring-2 transition-all duration-200
            ${error 
              ? 'border-red-300 text-red-600 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20'
            }
            ${disabled || loading 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'bg-white hover:border-gray-400'
            }
            dark:bg-gray-800 dark:border-gray-600 dark:text-white
            dark:focus:border-purple-400 dark:hover:border-gray-500
          `}
          whileFocus={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
      ))}
    </div>
  );
};

export default OTPInput;