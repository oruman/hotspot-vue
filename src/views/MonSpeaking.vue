<template>
  <v-container>
    <v-row>
      <v-col cols="12" v-for="item of files" :key="item.id">
        <v-card>
          <v-card-title>{{ item.name }}</v-card-title>
          <v-card-subtitle class="fix-subtitle">
            {{ formatDate(item.date) }}
            <v-spacer />
            {{ formatDuration(item.duration) }}
          </v-card-subtitle>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import moment from "moment";
import Utils from "@/helpers/util";

@Component
export default class MonSpeaking extends Vue {
  mounted() {
    this.$store.dispatch("monspeaking/GET_DATA");
  }

  private get files() {
    return this.$store ? this.$store.getters["monspeaking/files"] : [];
  }

  private formatDate(date: string) {
    return date ? moment(date).format("YYYY-MM-DD HH:mm") : "N/A";
  }

  private formatDuration(seconds: number) {
    return Utils.formatAudioDuration(seconds);
  }

  private play(item: SimpleObject) {
    const id = item.id || 0;
    if (!id) return;
    this.$store.dispatch("network/GET_LINK_INFO", id).then(info => {
      if (!info.link) return;
      const obj = {
        name: "Monthly Homework: " + item.name,
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
}
</script>

<style scoped lang="scss">
::v-deep .fix-subtitle {
  display: flex;
  padding-bottom: 0;
}
</style>
