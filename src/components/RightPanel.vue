<template>
  <v-navigation-drawer fixed right clipped v-model="isMenu">
    <v-list dense>
      <template v-if="keys">
        <v-list-item-title
          class="text-uppercase text-center text-h6 font-weight-bold"
          >Keys</v-list-item-title
        >
        <v-list-item
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
          class="text-uppercase text-center text-h6 font-weight-bold"
          >Materials</v-list-item-title
        >
        <v-list-item
          v-for="(material, materialIndex) in materials"
          :key="'material_' + materialIndex"
        >
          <v-sheet class="pa-2 mb-2 rounded" color="#e0e0e0" width="100%">
            <a :href="material.link" target="_blank" v-text="material.name"></a>
          </v-sheet>
        </v-list-item>
      </template>
      <template v-if="monSpeakingFiles.length">
        <v-list-item-title
          class="text-uppercase text-center text-h6 font-weight-bold"
        >Monthly speaking</v-list-item-title
        >
        <v-list-item v-for="item of monSpeakingFiles" :key="item.id">
          <v-card width="100%" class="mb-3" color="#e0e0e0">
            <v-card-text class="body-1 font-weight-bold text--primary py-1 px-2">{{ item.name }}</v-card-text>
            <v-card-subtitle class="py-0 px-2 text--primary">Date: {{ formatDate(item.date) }}</v-card-subtitle>
            <v-card-actions>
              <v-btn text @click.prevent="download(item)" small>
                <v-icon>mdi-download</v-icon>
                Download
              </v-btn>
              <v-btn text @click.prevent="play(item)" small>
                <v-icon>mdi-play</v-icon>
                Play
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Aspects } from "@/data/data";
import moment from "moment";
import Utils from "@/helpers/util";

@Component
export default class RightPanel extends Vue {
  @Prop({ default: Aspects.GRAMMAR }) readonly aspect!: number;
  @Prop({ default: [] }) readonly keys!: SimpleObject[];
  @Prop({ default: false }) readonly showMenu!: boolean;

  mounted() {
    if (this.aspect === Aspects.SPEAKING)
      this.$store.dispatch("monspeaking/GET_DATA");
  }

  private get materials() {
    const data: SimpleObject[] = this.$store
      ? this.$store.getters["network/materials"]
      : [];
    return data.filter(item => item.aspect == this.aspect);
  }

  private get monSpeakingFiles() {
    return this.aspect === Aspects.SPEAKING && this.$store
      ? this.$store.getters["monspeaking/files"]
      : [];
  }

  private formatDate(date: string) {
    return date ? moment(date).format("YYYY-MM-DD HH:mm") : "N/A";
  }

  private play(item: SimpleObject) {
    const id = item.id || 0;
    if (!id) return;
    this.$store.dispatch("network/GET_LINK_INFO", id).then(info => {
      if (!info.link) return;
      const obj = {
        name: "Monthly Speaking: " + item.name,
        link: info.link,
        duration: item.duration || info.duration || 0
      };
      this.$store.dispatch("audio/SET_DATA", obj);
    });
  }

  private download(item: SimpleObject) {
    const id = item.id || 0;
    if (!id) return;
    this.$store.dispatch("network/GET_LINK", id).then(link => {
      if (!link) return;
      Utils.downloadURL(link, item.name);
    });
  }

  private get isMenu() {
    return this.showMenu;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private set isMenu(flag: boolean) {}
}
</script>

<style scoped></style>
