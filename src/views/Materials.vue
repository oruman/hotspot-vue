<template>
  <v-container fluid grid-list-xl>
    <Tabs v-on:emit-change-tab="changeTab"></Tabs>
    <v-row>
      <v-col
        cols="12"
        md="4"
        v-for="(material, material_index) in materials"
        :key="material_index"
      >
        <v-card>
          <v-card-title>
            <a
              v-bind:href="material.link"
              target="_blank"
              v-text="material.name"
            ></a>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Tabs from "@/components/Tabs.vue";

@Component({
  components: { Tabs }
})
export default class Materials extends Vue {
  private activeTab = "1";

  mounted() {
    this.$store.dispatch("grades/GET_DATA");
  }

  private changeTab(tabId: number) {
    this.activeTab = tabId.toString(10);
  }

  private get materials() {
    const data: SimpleObject[] = this.$store
      ? this.$store.getters["network/files"]
      : [];
    return data.filter(item => item.aspect == this.activeTab);
  }
}
</script>
