"use client";

import { useState, useEffect, useRef } from "react";

export function usePersistentTimer(durationMs) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./timerWorker.js", import.meta.url)
    );

    workerRef.current.onmessage = (e) => {
      if (e.data.type === "update") {
        setElapsedTime(e.data.elapsed);
      } else if (e.data.type === "done") {
        setIsRunning(false);
      }
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const start = () => {
    workerRef.current.postMessage({
      action: "start",
      duration: durationMs,
      elapsed: elapsedTime,
    });
    setIsRunning(true);
  };

  const pause = () => {
    workerRef.current.postMessage({ action: "pause" });
    setIsRunning(false);
  };

  const reset = () => {
    workerRef.current.postMessage({ action: "reset" });
    setElapsedTime(0);
    setIsRunning(false);
  };

  return { elapsedTime, isRunning, start, pause, reset };
}
