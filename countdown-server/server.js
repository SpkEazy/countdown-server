const express = require("express");
const { createCanvas } = require("canvas");

const app = express();
const PORT = process.env.PORT || 3000;

// Target: 31 Jan 2026 @ 10:30 SAST (UTC+02:00)
const TARGET_ISO = process.env.TARGET_ISO || "2026-01-31T10:30:00+02:00";
const TARGET = new Date(TARGET_ISO);

// Helpers
const pad2 = (n) => String(n).padStart(2, "0");

function getRemainingParts(now = new Date()) {
  let diffMs = TARGET.getTime() - now.getTime();
  if (diffMs <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, done: true };

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return { days, hours, mins, secs, done: false };
}

function drawCountdownPNG({ width = 640, height = 200 }) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Layout constants (scaled for different widths)
  const border = Math.max(2, Math.round(width * 0.004)); // ~2-3px
  const paddingX = Math.round(width * 0.04);
  const titleH = Math.round(height * 0.35);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = "#222222";
  ctx.lineWidth = border;
  ctx.strokeRect(border / 2, border / 2, width - border, height - border);

  // Title line + divider
  ctx.strokeStyle = "#222222";
  ctx.lineWidth = Math.max(1, border - 1);
  ctx.beginPath();
  ctx.moveTo(0, titleH);
  ctx.lineTo(width, titleH);
  ctx.stroke();

  // Title text
  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.round(height * 0.12)}px Arial`;
  ctx.fillText("TIME TO NEXT AUCTION", width / 2, titleH / 2 + Math.round(height * 0.02));

  // Remaining time
  const { days, hours, mins, secs } = getRemainingParts();
  const values = [pad2(days), pad2(hours), pad2(mins), pad2(secs)];
  const labels = ["DAYS", "HOURS", "MINUTES", "SECONDS"];

  // Digits row area
  const digitsTop = titleH + Math.round(height * 0.10);
  const digitsBottom = height - Math.round(height * 0.15);
  const digitsAreaH = digitsBottom - digitsTop;

  // Column positions
  const colCount = 4;
  const usableW = width - paddingX * 2;
  const colW = usableW / colCount;

  // Big digits
  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const digitFontSize = Math.round(digitsAreaH * 0.65);
  ctx.font = `${digitFontSize}px Arial`;

  for (let i = 0; i < colCount; i++) {
    const cx = paddingX + colW * (i + 0.5);
    // Place digits
    ctx.fillText(values[i], cx, digitsTop + Math.round(digitsAreaH * 0.68));
  }

  // Labels underneath
  const labelFontSize = Math.round(digitsAreaH * 0.16);
  ctx.font = `${labelFontSize}px Arial`;
  ctx.textBaseline = "top";

  for (let i = 0; i < colCount; i++) {
    const cx = paddingX + colW * (i + 0.5);
    ctx.fillText(labels[i], cx, digitsTop + Math.round(digitsAreaH * 0.80));
  }

  return canvas.toBuffer("image/png");
}

// Health check
app.get("/", (req, res) => {
  res.type("text/plain").send("OK - countdown image server running");
});

// Countdown endpoint
// Example: /countdown.png?w=640&h=200
app.get("/countdown.png", (req, res) => {
  const w = Math.min(Math.max(parseInt(req.query.w || "640", 10), 320), 1200);
  const h = Math.min(Math.max(parseInt(req.query.h || "200", 10), 140), 600);

  // Aggressive anti-caching (important for email clients)
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  const buf = drawCountdownPNG({ width: w, height: h });
  res.end(buf);
});

app.listen(PORT, () => {
  console.log(`Countdown image server running on port ${PORT}`);
  console.log(`Target: ${TARGET_ISO}`);
});
