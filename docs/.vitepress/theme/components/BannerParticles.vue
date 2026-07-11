<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { inBrowser } from "vitepress";

const canvasRef = ref<HTMLCanvasElement>();

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

let particles: Particle[] = [];
let rafId = 0;
let ctx: CanvasRenderingContext2D | null = null;
let dpr = 1;
let width = 0;
let height = 0;
const mouse = { x: -9999, y: -9999, active: false };

const colors = {
  point: [0, 255, 255] as [number, number, number],
  lineA: [0, 255, 255] as [number, number, number],
  lineB: [167, 139, 250] as [number, number, number],
};

const LINK_DIST = 140;
const MOUSE_RADIUS = 180;

function parseCssColor(input: string): [number, number, number] | null {
  const s = input.trim();
  if (!s) return null;
  if (s.startsWith("#")) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    if (hex.length !== 6) return null;
    const n = parseInt(hex, 16);
    if (Number.isNaN(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const parts = m[1].split(",").map((p) => parseFloat(p));
    if (parts.length >= 3) return [parts[0], parts[1], parts[2]];
  }
  return null;
}

function refreshColors() {
  const styles = getComputedStyle(document.documentElement);
  const cyan = parseCssColor(styles.getPropertyValue("--tp-cyan"));
  const purple = parseCssColor(styles.getPropertyValue("--tp-purple"));
  if (cyan) {
    colors.point = cyan;
    colors.lineA = cyan;
  }
  if (purple) colors.lineB = purple;
}

function targetCount(): number {
  const w = window.innerWidth;
  if (w < 640) return 30;
  if (w < 1200) return 50;
  return 75;
}

function seedParticles() {
  const count = targetCount();
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
  }));
}

function resize() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx = canvas.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  seedParticles();
}

function drawFrame() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    if (mouse.active) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 1) {
        const d = Math.sqrt(d2);
        const pull = (1 - d / MOUSE_RADIUS) * 0.06;
        p.vx += (dx / d) * pull;
        p.vy += (dy / d) * pull;
      }
    }

    const maxV = 0.9;
    p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
    p.vy = Math.max(-maxV, Math.min(maxV, p.vy));
  }

  for (let i = 0; i < particles.length; i++) {
    const a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > LINK_DIST * LINK_DIST) continue;
      const d = Math.sqrt(d2);
      const t = d / LINK_DIST;
      const alpha = (1 - t) * 0.35;
      const r = colors.lineA[0] * (1 - t) + colors.lineB[0] * t;
      const g = colors.lineA[1] * (1 - t) + colors.lineB[1] * t;
      const bl = colors.lineA[2] * (1 - t) + colors.lineB[2] * t;
      ctx.strokeStyle = `rgba(${r|0},${g|0},${bl|0},${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  const [pr, pg, pb] = colors.point;
  ctx.fillStyle = `rgba(${pr},${pg},${pb},0.85)`;
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function loop() {
  drawFrame();
  rafId = requestAnimationFrame(loop);
}

function onMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.active = true;
}

function onMouseLeave() {
  mouse.active = false;
  mouse.x = -9999;
  mouse.y = -9999;
}

let resizeRaf = 0;
function onResize() {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    resize();
  });
}

let themeObserver: MutationObserver | null = null;
let visibilityObserver: IntersectionObserver | null = null;
let isVisible = true;
let isReduced = false;

onMounted(() => {
  if (!inBrowser) return;
  const canvas = canvasRef.value;
  if (!canvas) return;

  refreshColors();
  resize();

  isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isReduced) {
    drawFrame();
    return;
  }

  const isTouch = window.matchMedia("(hover: none)").matches;
  if (!isTouch) {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseout", onMouseLeave, { passive: true });
  }
  window.addEventListener("resize", onResize, { passive: true });

  themeObserver = new MutationObserver(() => refreshColors());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  visibilityObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafId) {
          rafId = requestAnimationFrame(loop);
        } else if (!isVisible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      }
    },
    { threshold: 0 },
  );
  visibilityObserver.observe(canvas);

  rafId = requestAnimationFrame(loop);
});

onUnmounted(() => {
  if (!inBrowser) return;
  if (rafId) cancelAnimationFrame(rafId);
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseout", onMouseLeave);
  window.removeEventListener("resize", onResize);
  themeObserver?.disconnect();
  visibilityObserver?.disconnect();
});
</script>

<template>
  <canvas ref="canvasRef" class="banner-particles" aria-hidden="true" />
</template>

<style scoped>
.banner-particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
