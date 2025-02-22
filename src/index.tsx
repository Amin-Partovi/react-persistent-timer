"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";

const IS_RUNNING_KEY = "persistent-timer-is-running";
const START_TIME_KEY = "persistent-timer-start-time";

export enum Actions {
  start,
  update,
  done,
  pause,
  reset,
}

interface Props {
  duration: number;
  frequency: "s" | "cs" | "ms";
}

export function usePersistentTimer({ duration, frequency }: Props) {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const workerRef = useRef<Worker>(null);

  useLayoutEffect(() => {
    setIsRunning(localStorage.getItem(IS_RUNNING_KEY) === "true");
  }, []);

  useEffect(() => {
    if (isRunning && frequency) {
      workerRef.current?.postMessage({
        frequency,
        action: Actions.start,
        duration,
        startTime: localStorage.getItem(START_TIME_KEY)
          ? localStorage.getItem(START_TIME_KEY)
          : Date.now(),
      });
    }
  }, [isRunning, frequency]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./timerWorker.js", import.meta.url)
    );

    workerRef.current.onmessage = (e) => {
      if (e.data.type === Actions.update) {
        setElapsedTime(e.data.elapsed);
      } else if (e.data.type === Actions.done) {
        setIsRunning(false);
        localStorage.removeItem(IS_RUNNING_KEY);
        localStorage.removeItem(START_TIME_KEY);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const start = () => {
    const startTime = Date.now();
    localStorage.setItem(IS_RUNNING_KEY, "true");
    localStorage.setItem(START_TIME_KEY, startTime.toString());
    workerRef.current?.postMessage({
      action: Actions.start,
      duration,
      startTime,
    });
    setIsRunning(true);
  };

  const pause = () => {
    workerRef.current?.postMessage({ action: Actions.pause });
    setIsRunning(false);
    localStorage.setItem(IS_RUNNING_KEY, "false");
  };

  const reset = () => {
    workerRef.current?.postMessage({ action: Actions.reset });
    setElapsedTime(0);
    setIsRunning(false);
    localStorage.removeItem(IS_RUNNING_KEY);
    localStorage.removeItem(START_TIME_KEY);
  };

  return { elapsedTime, isRunning, start, pause, reset };
}
