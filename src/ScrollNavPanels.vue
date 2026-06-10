<!--
 ScrollNavPanels vertically displays a series of content panels
 that stay in sync with a sibling tab bar (e.g. ScrollNavTabs).

 Smooth scroll to a panel:
 When the active tab changes externally (e.g. the user clicks a tab),
 ScrollNavPanels scrolls to the corresponding panel with an effect.

 Switch tabs on scroll:
 When the user scrolls through the panels, `update:modelValue` is
 emitted with the index of the panel now in view, so a bound tab bar
 stays in sync.

 Setup:
 1. Place ScrollNavPanels as a sibling of the tab bar component.
 2. Put one content block per tab inside the default slot, each
    carrying the class given by `panelClass` (default "tab-panel").
 3. Bind both components to the same `v-model` ref holding the
    active tab index.
-->
<template>
  <div class="scroll-nav-panels">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: number;
  /** The offsetTop value of the tab bar in "sticky mode" */
  barOffsetTop?: number;
  barHeight?: number;
  panelClass?: string;
  /** The time it takes for the smooth scrolling effect, in ms */
  scrollDuration?: number;
  /** The distance from the top of the scroll target, in px */
  scrollOffset?: number;
}>(), {
  modelValue: 0,
  barOffsetTop: 0,
  barHeight: 52,
  panelClass: 'tab-panel',
  scrollDuration: 400,
  scrollOffset: 30
});

const emit = defineEmits<{
  'update:modelValue': [index: number];
}>();

const panelPageTops = ref<number[]>([]);

/**
 * The viewport y-position used as a threshold to determine which panel is
 * active while scrolling. Defaults to the bottom edge of the tab bar.
 *
 * Must stay strictly greater than scrollOffset: if the tab bar sits at or
 * above scrollOffset, the threshold would equal scrollOffset and cause the
 * active tab to flip back to the previous panel incorrectly.
 */
const activePanelThreshold = computed(() => {
  let offset = props.barOffsetTop + props.barHeight;

  if (offset <= props.scrollOffset) {
    offset = props.scrollOffset + 1;
  }

  return offset;
});

// requestAnimationFrame ID for the active smooth-scroll animation
let rafId: number | undefined;

// True when the modelValue change came from onScroll (user-initiated),
// so the watch should not trigger a programmatic scroll back.
let scrollEmitted = false;

watch(
  () => props.modelValue,
  index => {
    if (scrollEmitted) {
      scrollEmitted = false;
      return;
    }
    scrollToPanelAt(index);
  }
);

onMounted(() => {
  panelPageTops.value = getPanelPageTops(props.panelClass);
  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  if (rafId !== undefined) {
    cancelAnimationFrame(rafId);
  }
});

/**
 * Change the active tab on page scrolling.
 */
function onScroll() {
  // Do nothing when the scrolling is not performed by the user.
  if (rafId !== undefined) {
    return;
  }

  const panelIndex = getCurrentPanelIndex(
    panelPageTops.value,
    activePanelThreshold.value
  );

  if (panelIndex !== props.modelValue) {
    scrollEmitted = true;
    emit('update:modelValue', panelIndex);
  }
}

/**
 * Scroll the page to the (index + 1)-th tab panel.
 */
function scrollToPanelAt(index: number): void {
  if (typeof index !== 'number' || index >= panelPageTops.value.length) {
    return;
  }

  const target = document.querySelector(
    `.${props.panelClass}:nth-child(${index + 1})`
  );

  if (!target) {
    return;
  }

  const targetTop =
    target.getBoundingClientRect().top + window.scrollY - props.scrollOffset;

  if (rafId !== undefined) {
    cancelAnimationFrame(rafId);
  }
  smoothScrollTo(targetTop, props.scrollDuration);
}

function smoothScrollTo(targetY: number, duration: number): void {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now: DOMHighResTimeStamp): void {
    const elapsed = Math.min((now - startTime) / duration, 1);

    window.scrollTo(0, startY + distance * easeInOutQuad(elapsed));

    if (elapsed < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      rafId = undefined;
    }
  }

  rafId = requestAnimationFrame(step);
}
</script>

<script lang="ts">
function getPanelPageTops(className: string): number[] {
  if (!className) {
    return [];
  }

  const panels = document.querySelectorAll<HTMLElement>(`.${className}`);
  const offsetTops: number[] = [];

  panels.forEach((panel, i) => {
    offsetTops[i] = panel.getBoundingClientRect().top + window.scrollY;
  });

  return offsetTops;
}

/**
 * NOTE: The calculation assumes the tab panels are visually
 * connected to each other, without overlaps or gaps.
 */
function getCurrentPanelIndex(offsetTops: number[], scrollOffset = 0): number {
  const index = offsetTops.findIndex((offsetTop: number, i: number) => {
    const scrollY = window.scrollY + scrollOffset;

    if (i === offsetTops.length - 1) {
      return scrollY >= offsetTop;
    }

    return scrollY >= offsetTop && scrollY < offsetTops[i + 1];
  });

  // The first tab stays active when window.scrollY is above the first panel.
  return index < 0 ? 0 : index;
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
</script>
