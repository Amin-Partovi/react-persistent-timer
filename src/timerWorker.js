"use client";

import { Actions } from "./index";

let startTime = null;
let duration = 0; // Timer duration in milliseconds
let running = false;

self.onmessage = function (e) {
  if (e.data.action === Actions.start) {
    if (!running) {
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

  self.postMessage({
    type: Actions.update,
    elapsed: parseInt(elapsed / 1000),
  });

  if (remaining > 0) {
    setTimeout(tick, 1000);
  } else {
    console.log("else");
    running = false;
    self.postMessage({ type: Actions.done });
  }
}
