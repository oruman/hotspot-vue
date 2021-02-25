<template>
  <v-navigation-drawer fixed right clipped v-model="isMenu">
    <v-list dense>
      <template v-if="keys">
        <v-list-item-title
          class="text-uppercase text-center text-h5 font-weight-bold"
          >Keys</v-list-item-title
        >
        <v-list-item
          dark
          v-for="(task, taskIndex) in keys"
          :key="'task_' + taskIndex"
        >
          <v-sheet class="pa-2 mb-2 rounded" color="#e0e0e0" width="100%">
            <a :href="task.link" target="_blank">{{ task.text }}</a>
          </v-sheet>
        </v-list-item>
      </template>
      <template v-if="materials.length">
        <v-list-item-title
          class="text-uppercase text-center text-h5 font-weight-bold"
          >Materials</v-list-item-title
        >
        <v-list-item
          dark
          v-for="(material, materialIndex) in materials"
          :key="'material_' + materialIndex"
        >
          <v-sheet class="pa-2 mb-2 rounded" color="#e0e0e0" width="100%">
            <a :href="material.link" target="_blank" v-text="material.name"></a>
          </v-sheet>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Aspects } from "@/data/data";

@Component
export default class RightPanel extends Vue {
  @Prop({ default: Aspects.GRAMMAR }) readonly aspect!: number;
  @Prop({ default: [] }) readonly keys!: SimpleObject[];
  @Prop({ default: false }) readonly showMenu!: boolean;

  private get materials() {
    const data: SimpleObject[] = this.$store
      ? this.$store.getters["network/materials"]
      : [];
    return data.filter(item => item.aspect == this.aspect);
  }

  private get isMenu() {
    return this.showMenu;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private set isMenu(flag: boolean) {}
}
</script>

<style scoped></style>
