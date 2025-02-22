"use client";

import { Actions } from "./userPersistentTimer";

let startTime = null;
let duration = 0;
let running = false;
let frequency = "";

self.onmessage = function (e) {
  if (e.data.action === Actions.start && e.data.frequency) {
    if (!running) {
      frequency = e.data.frequency;
      startTime = e.data.startTime;
      duration = e.data.duration * 1000;
      running = true;

      tick();
    }
  } else if (e.data.action === Actions.pause) {
    running = false;
  } else if (e.data.action === Actions.reset) {
    startTime = null;
    running = false;
    self.postMessage({ type: Actions.update, elapsed: 0 });
  }
};

function tick() {
  if (!running) return;
  const elapsed = Date.now() - startTime;
  const remaining = duration - elapsed;

  const frequencyValue = () => {
    if (frequency === "s") {
      return 1000;
    } else if (frequency === "cs") {
      return 10;
    }
    return 1;
  };

  self.postMessage({
    type: Actions.update,
    elapsed: parseInt(elapsed / frequencyValue()),
  });

  if (remaining > 0) {
    setTimeout(tick, frequencyValue());
  } else {
    running = false;
    self.postMessage({ type: Actions.done });
  }
}
