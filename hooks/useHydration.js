'use client';

import { useState, useEffect } from 'react';

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Set hydrated to true after component mounts
    setIsHydrated(true);
    
    // Suppress hydration warnings for browser extensions
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('hydration') ||
         message.includes('Warning: Extra attributes from the server') ||
         message.includes('data-new-gr-c-s-check-loaded') ||
         message.includes('data-gr-ext-installed') ||
         message.includes('Warning: Text content did not match'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return isHydrated;
}

