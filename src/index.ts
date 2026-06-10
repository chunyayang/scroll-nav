import type { App } from 'vue';
import ScrollNavPanels from './ScrollNavPanels.vue';
import ScrollNavTabs from './ScrollNavTabs.vue';

export { ScrollNavPanels, ScrollNavTabs };

export default {
  install(app: App): void {
    app.component('ScrollNavPanels', ScrollNavPanels);
    app.component('ScrollNavTabs', ScrollNavTabs);
  }
};
