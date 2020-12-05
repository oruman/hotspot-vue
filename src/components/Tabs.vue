<template>
  <v-tabs fixed-tabs>
    <v-tab
      v-model="activeTab"
      v-for="tab in tabs"
      v-on:click="changeTab(tab.id)"
      :key="tab.id"
      >{{ tab.name }}</v-tab
    >
  </v-tabs>
</template>

<script lang="ts">
import { Component, Emit, Vue } from "vue-property-decorator";
import { aspectsName } from "@/data/data";

@Component
export default class Tabs extends Vue {
  private tabs: SimpleObject[] = [];

  mounted() {
    for (const id in aspectsName) {
      if (!Object.prototype.hasOwnProperty.call(aspectsName, id)) continue;
      this.tabs.push({
        id: id,
        name: aspectsName[id]
      });
    }
  }

  private activeTab = 0;

  private changeTab(id: number) {
    this.activeTab = id;
    this.emitChangeTab();
  }

  @Emit()
  private emitChangeTab() {
    return this.activeTab;
  }
}
</script>

<style scoped lang="scss">
::v-deep .v-slide-group__prev {
  display: none;
}
</style>
