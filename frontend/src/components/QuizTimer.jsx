import { useEffect, useRef, useState } from 'react';

const QuizTimer = ({ durationMinutes = 15, onTimeout, isRunning = true }) => {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const hasTimedOut = useRef(false);

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60);
    hasTimedOut.current = false;
  }, [durationMinutes]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0 && !hasTimedOut.current) {
      hasTimedOut.current = true;
      onTimeout?.();
      return;
    }
    const id = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft, onTimeout, isRunning]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return <div className="timer">Assessment Timer: {minutes}:{seconds}</div>;
};

export default QuizTimer;
