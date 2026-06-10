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

const inTransition = ref<boolean>(false);
const panelOffsetTops = ref<number[]>([]);

/**
 * A virtual horizontal line within the viewport for telling when to
 * change the active tab while scrolling the panels through.
 * Here it is the position of the tab bar bottom.
 */
const windowScrollOffset = computed(() => {
  let offset = props.barOffsetTop + props.barHeight;

  // To prevent the active tab being mistakenly altered to the previous one
  if (offset <= props.scrollOffset) {
    offset = props.scrollOffset + 1;
  }

  return offset;
});

let transitionTimer: ReturnType<typeof setTimeout> | undefined;

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
  panelOffsetTops.value = getPanelOffsetTops(props.panelClass);
  window.addEventListener('scroll', onScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  clearTimeout(transitionTimer);
});

/**
 * Change the active tab on page scrolling.
 */
function onScroll() {
  // Do nothing when the scrolling is not performed by the user.
  if (inTransition.value) {
    return;
  }

  panelOffsetTops.value = getPanelOffsetTops(props.panelClass);

  const panelIndex = getCurrentPanelIndex(
    panelOffsetTops.value,
    windowScrollOffset.value
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
  if (typeof index !== 'number' || index >= panelOffsetTops.value.length) {
    return;
  }

  const target = document.querySelector(
    `.${props.panelClass}:nth-child(${index + 1})`
  );

  if (!target) {
    return;
  }

  // To distinguish the tab-click triggered scroll effect
  // from the regular user scrolling.
  inTransition.value = true;
  clearTimeout(transitionTimer);

  const targetTop =
    target.getBoundingClientRect().top + window.scrollY - props.scrollOffset;

  smoothScrollTo(targetTop, props.scrollDuration);

  transitionTimer = setTimeout(() => {
    inTransition.value = false;
  }, props.scrollDuration);
}
</script>

<script lang="ts">
function getPanelOffsetTops(className: string): number[] {
  if (!className) {
    return [];
  }

  const panels = document.querySelectorAll<HTMLElement>(`.${className}`);
  const offsetTops: number[] = [];

  panels.forEach((panel, i) => {
    offsetTops[i] = panel.offsetTop;
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

function smoothScrollTo(targetY: number, duration: number): void {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now: DOMHighResTimeStamp): void {
    const elapsed = Math.min((now - startTime) / duration, 1);
    const eased = easeInOutQuad(elapsed);

    window.scrollTo(0, startY + distance * eased);

    if (elapsed < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
</script>
