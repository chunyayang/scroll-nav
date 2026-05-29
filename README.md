# scroll-nav-panels

A Vue 2 + Vuetify 2 helper component for syncing `v-tabs` with vertically stacked content panels.

`ScrollNavPanels` provides:
- click-to-scroll: smooth scrolling to the selected tab panel
- scroll-to-highlight: automatic active tab switching while the user scrolls through panels
- shared `v-model` support between `v-tabs` and the panel container

## Install

```bash
npm install scroll-nav-panels
```

## Peer Dependencies

- `vue` ^2.6.0
- `vuetify` ^2.4.0

## Usage

1. Place `ScrollNavPanels` as a sibling of `v-tabs`.
2. Use the same `v-model` index on both `v-tabs` and `ScrollNavPanels`.
3. Add the same number of panel blocks inside `ScrollNavPanels` as there are tabs.
4. Emit a `scrollToPanel` event from the tab change handler using your event bus.

### Example

```vue
<template>
  <div>
    <v-tabs v-model="tabIndex" @change="onTabChange">
      <v-tab>Tab 1</v-tab>
      <v-tab>Tab 2</v-tab>
      <v-tab>Tab 3</v-tab>
    </v-tabs>

    <ScrollNavPanels v-model="tabIndex">
      <div class="tab-panel">Content 1</div>
      <div class="tab-panel">Content 2</div>
      <div class="tab-panel">Content 3</div>
    </ScrollNavPanels>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabIndex: 0
    };
  },
  methods: {
    onTabChange(index) {
      this.$bus.$emit('scrollToPanel', index);
    }
  }
};
</script>
```

## Props

- `tabIndex` (Number, default `0`)
  - Shared `v-model` value for the active tab index.

- `barOffsetTop` (Number, default `0`)
  - Offset top value for the sticky tab bar.

- `barHeight` (Number, default `52`)
  - Height of the tab bar used for scroll position calculations.

- `panelClass` (String, default `tab-panel`)
  - CSS class used to identify each panel block.

- `goToDuration` (Number, default `400`)
  - Duration of the smooth scroll animation.

- `goToOffset` (Number, default `30`)
  - Scroll offset from the top when navigating to a panel.

## Notes

- Each panel block should use the `panelClass` value (default `tab-panel`) so the component can detect panel positions.
- The component listens for `scrollToPanel` events on the shared event bus.
- `ScrollNavPanels` updates the active tab automatically while the user scrolls.

## License

MIT

## Screenshot

![Screenshot](https://github.com/user-attachments/assets/2c7ffc97-32e4-44cc-af3d-d9ac16ba67a1)
