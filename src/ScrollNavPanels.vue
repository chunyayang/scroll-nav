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

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  // The offsetTop value of the tab bar in "sticky mode"
  barOffsetTop: {
    type: Number,
    default: 0
  },
  barHeight: {
    type: Number,
    default: 52
  },
  panelClass: {
    type: String,
    default: 'tab-panel'
  },
  // The time it takes for the smooth scrolling effect, in ms
  scrollDuration: {
    type: Number,
    default: 400
  },
  // The distance from the top of the scroll target, in px
  scrollOffset: {
    type: Number,
    default: 30
  }
});

const emit = defineEmits(['update:modelValue']);

const inTransition = ref(false);
const panelOffsetTops = ref([]);

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

let transitionTimer = null;

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
function scrollToPanelAt(index) {
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

<script>
/**
 * Get each tab panel's offsetTop.
 * @param {String} className - the class name shared by all the tab panels
 * @returns {Array} an array of offsetTop numbers
 */
function getPanelOffsetTops(className) {
  if (!className) {
    return [];
  }

  const panels = document.querySelectorAll(`.${className}`);
  const offsetTops = [];

  panels.forEach((panel, i) => {
    offsetTops[i] = panel.offsetTop;
  });

  return offsetTops;
}

/**
 * Get the index of the tab panel inside the viewport.
 *
 * NOTE: The calculation assumes the tab panels are visually
 * connected to each other, without overlaps or gaps.
 *
 * @param {Array} offsetTops - an array of each tab panel's offsetTop
 * @param {Number} scrollOffset - a positive/negative number to
 * adjust the value of window.scrollY
 */
function getCurrentPanelIndex(offsetTops, scrollOffset = 0) {
  const index = offsetTops.findIndex((offsetTop, i) => {
    const scrollY = window.scrollY + scrollOffset;

    if (i === offsetTops.length - 1) {
      return scrollY >= offsetTop;
    }

    return scrollY >= offsetTop && scrollY < offsetTops[i + 1];
  });

  // The first tab stays active when window.scrollY
  // is above the first scroll panel.
  return index < 0 ? 0 : index;
}

/**
 * Smoothly scroll the window to a target Y position over a duration.
 * @param {Number} targetY - the destination scrollY value
 * @param {Number} duration - the time to take, in ms
 */
function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now) {
    const elapsed = Math.min((now - startTime) / duration, 1);
    const eased = easeInOutQuad(elapsed);

    window.scrollTo(0, startY + distance * eased);

    if (elapsed < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
</script>
