<!--
 ScrollNavPanels is used to vertically display 
 the v-tabs component's content panels.
 
 Smooth scroll to a tab panel:
 When the user clicks a tab, ScrollNavPanels will scroll 
 to its corresponding panel with an effect.

 Switch tabs on scroll:
 When the user scrolls through the tab panels, the active tab
 of the v-tabs component will be accordingly changed.
 
Setup:
 1. Declare the ScrollNavPanels component as a sibling of
 the v-tabs component.

 2. Set a series of content blocks (e.g. div or v-card)
 inside <ScrollNavPanels></ScrollNavPanels> as tab panels.
 The number of panels should be the same as the number of tabs.

 3. Inside the v-tabs component's "change" event handler, 
 emit an event named "scrollToPanel" (here we use an event bus), 
 with a tab index value, for example:
   this.$bus.$emit("scrollToPanel", index);

Required Parameter:
 v-model: the v-tabs component and the ScrollNavPanels
 component share the same integer variable as their v-model
 value. The variable represents the index of the active tab.
-->
<template>
  <v-container
    class="scroll-nav-panels pa-0"
    v-scroll="onScroll"
  >
    <slot></slot>
  </v-container>
</template>

<script>
export default {
  model: {
    prop: "tabIndex",
    event: "change"
  },
  props: {
    tabIndex: {
      type: Number,
      default: 0
    },
    // The offsetTop value of the tab bar in the "sticky mode"
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
      default: "tab-panel"
    },
    // The time it takes for the smooth scrolling effect
    // Please refer to $vuetify goTo function.
    goToDuration: {
      type: Number,
      default: 400
    },
    // The distance from the top of the scroll target
    // Please refer to $vuetify goTo function.
    goToOffset: {
      type: Number,
      default: 30
    }
  },
  data() {
    return {
      inTransition: false,
      panelOffsetTops: []
    };
  },
  computed: {
    /**
     * A virtual horizontal line within the viewport for telling when to
     * change the active tab while scrolling the panels through.
     * Here it is the position of the tab bar bottom.
     */
    windowScrollOffset() {
      let offset = this.barOffsetTop + this.barHeight;

      // To prevent the active tab being mistakely altered to the previous one
      if(offset <= this.goToOffset) {
        offset = this.goToOffset + 1;
      }

      return offset;
    }
  },
  mounted() {
    this.$bus.$on("scrollToPanel", index => {
      this.scrollToPanelAt(index);
    });
  },
  updated() {
    this.panelOffsetTops = getPanelOffsetTops(this.panelClass);
  },
  beforeDestroy() {
    this.$bus.$off("scrollToPanel");
  },
  methods: {
    /**
     * Change the active tab on page scrolling.
     */
    onScroll() {
      // Do nothing when the scrolling is not performed by the user.
      if (this.inTransition) {
        return;
      }

      const panelIndex = getCurrentPanelIndex(
        this.panelOffsetTops,
        this.windowScrollOffset
      );

      if (panelIndex !== this.tabIndex) {
        // Update the v-model value shared with the v-tabs component.
        this.$emit("change", panelIndex);
      }
    },
    /**
     * Scroll the page to the (index + 1)-th tab panel.
     */
    scrollToPanelAt(index) {
      if (typeof index != "number" || index >= this.panelOffsetTops.length) {
        return;
      }

      const target = `.${this.panelClass}:nth-child(${index + 1})`;
      const options = {
        duration: this.goToDuration,
        offset: this.goToOffset
      };

      // To distinguish the tab-click triggered scroll effect
      // from the regular user scrolling.
      this.inTransition = true;

      // Smooth scroll to the target
      this.$vuetify.goTo(target, options);

      setTimeout(() => {
        this.inTransition = false;
      }, options.duration);
    }
  }
};

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
  let offsetTops = [];

  panels.forEach(function(panel, i) {
    offsetTops[i] = panel.offsetTop;
  });

  return offsetTops;
}

/**
 * Get the index of the tab panel inside the viewport.
 *
 * NOTE: The calculation assumes the tab panels are visually 
 * connectd to each other, without overlaps or gaps.
 *
 * @param {Array} offsetTops - an array of each tab panel's offsetTop
 * @param {Number} scrollOffset - a positive/negative number to 
 * adjust the value of window.scrollY
 */
function getCurrentPanelIndex(offsetTops, scrollOffset = 0) {
  let index = 0;

  index = offsetTops.findIndex(function(offsetTop, i) {
    let scrollY = window.scrollY + scrollOffset;

    if (i === offsetTops.length - 1) {
      return scrollY >= offsetTop;
    }

    return scrollY >= offsetTop && scrollY < offsetTops[i + 1];
  });

  // The first tab stays active when the window.scrollY
  // is above the first scroll panel.
  return index < 0 ? 0 : index;
}
</script>

