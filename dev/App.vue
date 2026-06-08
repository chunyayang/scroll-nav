<template>
  <div>
    <div class="bar">
      <ScrollNavTabs v-model="activeTab" :tabs="['Tab 1', 'Tab 2', 'Tab 3']" />
    </div>

    <ScrollNavPanels v-model="activeTab" :bar-height="52">
      <section class="tab-panel panel-a">Panel 1</section>
      <section class="tab-panel panel-b">Panel 2</section>
      <section class="tab-panel panel-c">Panel 3</section>
    </ScrollNavPanels>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ScrollNavTabs from '../src/ScrollNavTabs.vue';
import ScrollNavPanels from '../src/ScrollNavPanels.vue';

const activeTab = ref(0);
</script>

<style>
body {
  margin: 0;
  font-family: sans-serif;
}
.bar {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #ddd;
  z-index: 1;
}
.tab-panel {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}
.panel-a { background: #42b883; }
.panel-b { background: #35495e; }
.panel-c { background: #ff7e67; }
</style>
