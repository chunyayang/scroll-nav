# scroll-nav-panels

A Vue 3 component package for syncing a tab bar with vertically stacked content panels — no Vuetify required.

The package provides two components:
- `ScrollNavTabs`: a lightweight tab bar
- `ScrollNavPanels`: a vertical panel container that syncs with the tab bar

Together they support:
- click-to-scroll: smooth scrolling to the selected tab panel
- scroll-to-highlight: automatic active tab switching while the user scrolls through panels
- shared `v-model` support between the tab bar and the panel container

## Install

```bash
npm install scroll-nav-panels
```

## Peer Dependencies

- `vue` ^3.3.0

## Usage

1. Place `ScrollNavTabs` as a sibling of `ScrollNavPanels`.
2. Bind both components to the same `v-model` ref holding the active tab index.
3. Add the same number of panel blocks inside `ScrollNavPanels` as there are tabs, each carrying the `panelClass` (default `tab-panel`).

### Example

```vue
<template>
  <div>
    <ScrollNavTabs v-model="activeTab" :tabs="['Tab 1', 'Tab 2', 'Tab 3']" />

    <ScrollNavPanels v-model="activeTab">
      <section class="tab-panel">Content 1</section>
      <section class="tab-panel">Content 2</section>
      <section class="tab-panel">Content 3</section>
    </ScrollNavPanels>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ScrollNavTabs, ScrollNavPanels } from 'scroll-nav-panels';
import 'scroll-nav-panels/style.css';

const activeTab = ref(0);
</script>
```

You can also register both components globally as a plugin:

```js
import { createApp } from 'vue';
import ScrollNav from 'scroll-nav-panels';
import 'scroll-nav-panels/style.css';

createApp(App).use(ScrollNav).mount('#app');
```

## ScrollNavTabs Props

- `tabs` (Array, default `[]`)
  - List of tab labels to render.

- `modelValue` (Number, default `0`)
  - `v-model` value for the active tab index.

## ScrollNavPanels Props

- `modelValue` (Number, default `0`)
  - Shared `v-model` value for the active tab index.

- `barOffsetTop` (Number, default `0`)
  - Offset top value for the sticky tab bar.

- `barHeight` (Number, default `52`)
  - Height of the tab bar used for scroll position calculations.

- `panelClass` (String, default `tab-panel`)
  - CSS class used to identify each panel block.

- `scrollDuration` (Number, default `400`)
  - Duration of the smooth scroll animation, in milliseconds.

- `scrollOffset` (Number, default `30`)
  - Scroll offset from the top when navigating to a panel.

## Notes

- Each panel block should use the `panelClass` value (default `tab-panel`) so the component can detect panel positions.
- `ScrollNavPanels` updates `modelValue` automatically while the user scrolls, and scrolls to the matching panel whenever `modelValue` changes externally (e.g. from clicking a tab).
- Panel positions are re-measured automatically when the content inside `ScrollNavPanels` changes size, so dynamic content such as lazy-loaded images or expanding sections is handled correctly without any manual intervention.
- Panel detection is scoped to the `ScrollNavPanels` container — elements with the `panelClass` outside the component are ignored.

## License

MIT

## Screenshot

![Screenshot](https://github.com/user-attachments/assets/2c7ffc97-32e4-44cc-af3d-d9ac16ba67a1)
