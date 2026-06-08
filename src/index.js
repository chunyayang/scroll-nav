import ScrollNavPanels from './ScrollNavPanels.vue';
import ScrollNavTabs from './ScrollNavTabs.vue';

export { ScrollNavPanels, ScrollNavTabs };

export default {
  install(app) {
    app.component('ScrollNavPanels', ScrollNavPanels);
    app.component('ScrollNavTabs', ScrollNavTabs);
  }
};
