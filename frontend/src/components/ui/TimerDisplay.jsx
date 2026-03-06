// src/components/ui/TimerDisplay.jsx
import { useState, useEffect } from 'react';

export default function TimerDisplay({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="text-sm opacity-80">Tempo</div>
      <div className="text-xl font-mono">{formatTime(elapsed)}</div>
    </div>
  );
}