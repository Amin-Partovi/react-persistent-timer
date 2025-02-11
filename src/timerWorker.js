"use client";

let startTime = null;
let duration = 0; // Timer duration in milliseconds
let running = false;

self.onmessage = function (e) {
  if (e.data.action === "start") {
    if (!running) {
      startTime = Date.now() - (e.data.elapsed || 0);
      duration = e.data.duration;
      running = true;
      tick();
    }
  } else if (e.data.action === "pause") {
    running = false;
  } else if (e.data.action === "reset") {
    startTime = null;
    running = false;
    self.postMessage({ type: "update", elapsed: 0 });
  }
};

function tick() {
  if (!running) return;
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(duration - elapsed, 0);

  self.postMessage({ type: "update", elapsed });

  if (remaining > 0) {
    setTimeout(tick, 1000);
  } else {
    running = false;
    self.postMessage({ type: "done" });
  }
}
