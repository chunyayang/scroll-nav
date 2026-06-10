<!--
 ScrollNavTabs is a lightweight tab bar designed to work
 alongside ScrollNavPanels for a "scroll spy" navigation pattern.

 Setup:
 1. Pass a list of tab labels via the `tabs` prop.
 2. Bind `v-model` to the same integer ref shared with
    ScrollNavPanels — it represents the index of the active tab.

 Example:
   <ScrollNavTabs v-model="activeTab" :tabs="['Intro', 'Details', 'FAQ']" />
   <ScrollNavPanels v-model="activeTab">
     <section class="tab-panel">...</section>
     <section class="tab-panel">...</section>
     <section class="tab-panel">...</section>
   </ScrollNavPanels>
-->
<template>
  <div class="scroll-nav-tabs" role="tablist">
    <button
      v-for="(tab, index) in tabs"
      :key="index"
      type="button"
      role="tab"
      class="scroll-nav-tab"
      :class="{ 'scroll-nav-tab--active': index === modelValue }"
      :aria-selected="index === modelValue"
      @click="selectTab(index)"
    >
      {{ tab }}
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tabs?: string[];
  modelValue?: number;
}>(), {
  tabs: () => [],
  modelValue: 0
});

const emit = defineEmits<{
  'update:modelValue': [index: number];
}>();

function selectTab(index: number): void {
  emit('update:modelValue', index);
}
</script>

<style scoped>
.scroll-nav-tabs {
  display: flex;
}

.scroll-nav-tab {
  flex: 1;
  padding: 16px;
  border: none;
  background: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
  opacity: 0.7;
}

.scroll-nav-tab--active {
  opacity: 1;
  font-weight: 600;
}
</style>
