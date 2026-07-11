<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const visible = ref(false);
let rafId = 0;
let pending = false;

function updateVisible() {
  visible.value = window.scrollY > 400;
  pending = false;
}

function onScroll() {
  if (pending) return;
  pending = true;
  rafId = requestAnimationFrame(updateVisible);
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  updateVisible();
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  cancelAnimationFrame(rafId);
});
</script>

<template>
  <Transition name="kb2t">
    <button
      v-show="visible"
      class="keep-back2top"
      aria-label="返回顶部"
      @click="backToTop"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.keep-back2top {
  position: fixed;
  right: 24px;
  bottom: 32px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--keep-primary);
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
  z-index: 20;
}

.keep-back2top:hover {
  background: var(--keep-primary-dark-1);
  transform: translateY(-2px);
}

.kb2t-enter-active,
.kb2t-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.kb2t-enter-from,
.kb2t-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 640px) {
  .keep-back2top {
    right: 16px;
    bottom: 20px;
  }
}
</style>
