<script setup lang="ts">
import { onMounted, ref } from "vue";
import BannerParticles from "./BannerParticles.vue";

const desc1Ref = ref<HTMLElement>();
const desc2Ref = ref<HTMLElement>();
const cursor1Show = ref(true);
const cursor2Show = ref(true);

const typewrite = (
  el: HTMLElement,
  text: string,
  delay: number,
  done: () => void,
) => {
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(tick, delay);
    } else {
      done();
    }
  };
  tick();
};

onMounted(() => {
  const d1 = desc1Ref.value;
  const d2 = desc2Ref.value;
  if (!d1 || !d2) return;
  const t1 = d1.textContent ?? "";
  const t2 = d2.textContent ?? "";
  d1.textContent = "";
  d2.textContent = "";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    d1.textContent = t1;
    d2.textContent = t2;
    cursor1Show.value = false;
    cursor2Show.value = false;
    return;
  }
  setTimeout(() => {
    typewrite(d1, t1, 100, () => {
      cursor1Show.value = false;
      typewrite(d2, t2, 100, () => {
        cursor2Show.value = false;
      });
    });
  }, 300);
});

const scrollDown = () => {
  window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
};
</script>

<template>
  <section class="keep-banner">
    <BannerParticles class="banner-layer-bg" />

    <div class="hud-decor" aria-hidden="true">
      <svg class="hud-corner hud-tl" viewBox="0 0 40 40">
        <path d="M 2 16 L 2 2 L 16 2" />
      </svg>
      <svg class="hud-corner hud-tr" viewBox="0 0 40 40">
        <path d="M 24 2 L 38 2 L 38 16" />
      </svg>
      <svg class="hud-corner hud-bl" viewBox="0 0 40 40">
        <path d="M 2 24 L 2 38 L 16 38" />
      </svg>
      <svg class="hud-corner hud-br" viewBox="0 0 40 40">
        <path d="M 24 38 L 38 38 L 38 24" />
      </svg>

      <div class="hud-grid" />

      <svg class="hud-wave" viewBox="0 0 800 40" preserveAspectRatio="none">
        <path
          class="hud-wave-path"
          d="M0,20 Q25,4 50,20 T100,20 T150,20 T200,20 T250,20 T300,20 T350,20 T400,20 T450,20 T500,20 T550,20 T600,20 T650,20 T700,20 T750,20 T800,20"
        />
      </svg>

      <div class="hud-meta hud-meta-tl">
        <span class="hud-dot" />
        <span class="hud-label">SIGNAL · LIVE</span>
      </div>
      <div class="hud-meta hud-meta-tr">
        <span class="hud-label">BLEACH-X // v1</span>
      </div>
    </div>

    <div class="banner-inner">
      <div class="banner-desc">
        <div class="desc-item">
          <span class="desc-prompt">&gt;</span>
          <span class="desc desc-primary gradient-text" ref="desc1Ref">AI 与前端的每日切片</span>
          <span v-show="cursor1Show" class="cursor">▍</span>
        </div>
        <div class="desc-item">
          <span class="desc-prompt">&gt;</span>
          <span class="desc" ref="desc2Ref">Slices of AI &amp; Frontend, every day.</span>
          <span v-show="cursor2Show" class="cursor">▍</span>
        </div>
      </div>
      <a class="scroll-hint" href="#content" @click.prevent="scrollDown" aria-label="向下滚动">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </a>
    </div>
  </section>
</template>

<style scoped>
.keep-banner {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  animation: kb-fade-in-down 0.8s ease both;
}

.banner-layer-bg {
  z-index: 0;
}

.hud-decor {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.banner-inner {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 24px;
  max-width: 90vw;
}

.hud-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
  opacity: 0.7;
}

.hud-corner {
  position: absolute;
  width: 40px;
  height: 40px;
  fill: none;
  stroke: var(--tp-cyan);
  stroke-width: 1.5;
  filter: drop-shadow(0 0 6px rgba(0, 255, 255, 0.5));
  animation: kb-hud-pulse 3.4s ease-in-out infinite;
}

.hud-tl { top: 24px; left: 24px; }
.hud-tr { top: 24px; right: 24px; }
.hud-bl { bottom: 24px; left: 24px; }
.hud-br { bottom: 24px; right: 24px; }

.hud-wave {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 90px;
  width: 100%;
  height: 44px;
  opacity: 0.75;
}

.hud-wave-path {
  fill: none;
  stroke: var(--tp-cyan);
  stroke-width: 1.4;
  stroke-linecap: round;
  filter: drop-shadow(0 0 6px rgba(0, 255, 255, 0.55));
  stroke-dasharray: 8 6;
  animation: kb-wave-flow 4s linear infinite;
}

.hud-meta {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--tp-cyan);
  opacity: 0.7;
}

.hud-meta-tl { top: 74px; left: 24px; }
.hud-meta-tr { top: 74px; right: 24px; }

.hud-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--tp-cyan);
  box-shadow: 0 0 8px var(--tp-cyan);
  animation: kb-hud-dot 1.2s ease-in-out infinite;
}

.banner-desc {
  font-size: 2rem;
  font-family: var(--keep-base-font-family);
  color: var(--keep-text-3);
  min-height: 6rem;
  line-height: 1.8;
}

.desc-item {
  display: block;
}

.desc-prompt {
  color: var(--tp-cyan);
  margin-right: 0.6rem;
  font-family: var(--vp-font-family-mono);
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.6);
}

.desc {
  color: var(--keep-text-3);
}

.desc-primary {
  font-weight: 600;
  letter-spacing: 0.03em;
}

.cursor {
  color: var(--tp-cyan);
  margin-left: 4px;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.6);
  animation: kb-blink 1.1s infinite steps(1);
}

.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--tp-cyan);
  cursor: pointer;
  animation: kb-bounce 2s ease-in-out infinite;
  transition: color 0.2s ease;
  display: inline-flex;
  padding: 8px;
  z-index: 3;
  filter: drop-shadow(0 0 6px rgba(0, 255, 255, 0.4));
}

.scroll-hint:hover {
  color: var(--tp-purple);
}

@keyframes kb-fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes kb-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes kb-bounce {
  0%,
  100% {
    transform: translate(-50%, 0);
  }
  50% {
    transform: translate(-50%, 8px);
  }
}

@keyframes kb-hud-pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

@keyframes kb-wave-flow {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -56; }
}

@keyframes kb-hud-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.5); opacity: 0.5; }
}

@media (max-width: 640px) {
  .keep-banner { padding-bottom: 96px; }
  .banner-desc {
    font-size: 1.4rem;
    min-height: 5rem;
  }
  .hud-corner { width: 28px; height: 28px; }
  .hud-tl, .hud-tr { top: 14px; }
  .hud-bl, .hud-br { bottom: 14px; }
  .hud-tl, .hud-bl { left: 14px; }
  .hud-tr, .hud-br { right: 14px; }
  .hud-meta { display: none; }
  .hud-wave { bottom: 56px; height: 28px; }
  .scroll-hint { bottom: 20px; }
}

/* 短视口保护（如横屏手机）：与小屏使用同一套安全区 */
@media (max-height: 520px) {
  .keep-banner { padding-bottom: 88px; }
  .banner-desc { font-size: 1.3rem; min-height: auto; line-height: 1.6; }
  .hud-wave { bottom: 52px; height: 26px; }
  .scroll-hint { bottom: 16px; padding: 4px; }
  .scroll-hint svg { width: 22px; height: 22px; }
}

@media (prefers-reduced-motion: reduce) {
  .keep-banner,
  .hud-corner,
  .hud-wave-path,
  .hud-dot,
  .cursor,
  .scroll-hint {
    animation: none !important;
  }
  .hud-wave-path { stroke-dasharray: none; }
}
</style>
