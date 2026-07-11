<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  current: number;
  total: number;
}>();

const emit = defineEmits<{
  (e: "change", page: number): void;
}>();

const inputValue = ref(String(props.current));

watch(
  () => props.current,
  (v) => {
    inputValue.value = String(v);
  },
);

function commit() {
  const p = parseInt(inputValue.value, 10);
  if (
    !Number.isNaN(p) &&
    p >= 1 &&
    p <= props.total &&
    p !== props.current
  ) {
    emit("change", p);
  } else {
    inputValue.value = String(props.current);
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    (e.target as HTMLInputElement).blur();
  }
}

function first() {
  if (props.current > 1) emit("change", 1);
}
function prev() {
  if (props.current > 1) emit("change", props.current - 1);
}
function next() {
  if (props.current < props.total) emit("change", props.current + 1);
}
function last() {
  if (props.current < props.total) emit("change", props.total);
}
</script>

<template>
  <div class="keep-paginator">
    <button
      class="kp-btn"
      :class="{ 'kp-disabled': current <= 1 }"
      :disabled="current <= 1"
      aria-label="首页"
      @click="first"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="11 17 6 12 11 7" />
        <polyline points="18 17 13 12 18 7" />
      </svg>
    </button>
    <button
      class="kp-btn"
      :class="{ 'kp-disabled': current <= 1 }"
      :disabled="current <= 1"
      aria-label="上一页"
      @click="prev"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <div class="kp-input-box">
      <input
        v-model="inputValue"
        class="kp-input"
        type="number"
        :min="1"
        :max="total"
        @keydown="onKeydown"
        @blur="commit"
      />
      <span class="kp-delimiter">/</span>
      <span class="kp-total">{{ total }}</span>
    </div>

    <button
      class="kp-btn"
      :class="{ 'kp-disabled': current >= total }"
      :disabled="current >= total"
      aria-label="下一页"
      @click="next"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
    <button
      class="kp-btn"
      :class="{ 'kp-disabled': current >= total }"
      :disabled="current >= total"
      aria-label="末页"
      @click="last"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.keep-paginator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 40px;
  user-select: none;
  padding: 0 12px;
  flex-wrap: wrap;
}

.kp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  border: none;
  background: transparent;
  color: var(--keep-text-3);
  cursor: pointer;
  transition: color 0.2s ease;
}

.kp-btn:hover:not(.kp-disabled) {
  color: var(--keep-primary);
}

.kp-btn.kp-disabled {
  color: var(--keep-text-5);
  cursor: not-allowed;
}

.kp-input-box {
  display: inline-flex;
  align-items: center;
  margin: 0 4px;
  font-size: 15px;
  color: var(--keep-text-4);
}

.kp-input {
  width: 2.8rem;
  height: 2rem;
  padding: 0;
  font-size: 15px;
  font-weight: 400;
  text-align: center;
  color: var(--keep-text-2);
  background: transparent;
  border: 1px solid var(--keep-border);
  border-radius: 0.3rem;
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: textfield;
  transition: width 0.2s ease, border-color 0.2s ease;
}

.kp-input::-webkit-outer-spin-button,
.kp-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.kp-input:hover,
.kp-input:focus {
  width: 3.8rem;
  border-color: var(--keep-primary);
}

.kp-delimiter {
  margin: 0 0.6rem;
}

.kp-total {
  color: var(--keep-text-4);
  font-size: 15px;
}

@media (max-width: 640px) {
  .keep-paginator {
    gap: 0.6rem;
  }
  .kp-input-box {
    font-size: 14px;
  }
  .kp-input {
    width: 2.4rem;
    height: 1.8rem;
    font-size: 14px;
  }
  .kp-input:hover,
  .kp-input:focus {
    width: 3.2rem;
  }
  .kp-total {
    font-size: 14px;
  }
}
</style>
