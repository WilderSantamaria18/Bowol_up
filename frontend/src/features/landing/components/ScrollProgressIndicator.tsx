import React, { useEffect, useState } from 'react';

export const ScrollProgressIndicator: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 z-[100] transition-all duration-75 ease-out shadow-[0_0_12px_rgba(249,115,22,0.8)]"
      style={{ width: `${progress}%` }}
    />
  );
};
