import { useEffect, useState } from 'react';

/**
 * Provides a smooth animated loading progress value.
 * Progress ramps up until it hits the provided soft max (default 95%),
 * and jumps to 100% shortly after the loading flag becomes false.
 */
export const useLoadingProgress = (active: boolean, softMax = 95) => {
  const [progress, setProgress] = useState(active ? 0 : 100);

  useEffect(() => {
    if (!active) {
      const timeout = setTimeout(() => setProgress(100), 150);
      return () => clearTimeout(timeout);
    }

    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= softMax) return prev;
        const increment = Math.random() * 12;
        return Math.min(prev + increment, softMax);
      });
    }, 180);

    return () => clearInterval(interval);
  }, [active, softMax]);

  return Math.min(progress, 100);
};
