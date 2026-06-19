import React, { useEffect } from 'react';

export default function SplashLoader({ onComplete }) {
  useEffect(() => {
    if (onComplete) onComplete();
  }, [onComplete]);

  return null;
}
