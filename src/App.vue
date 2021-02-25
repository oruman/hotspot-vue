<template>
  <v-app>
    <TopToolbar v-if="isLogged"></TopToolbar>
    <v-main>
      <router-view></router-view>
    </v-main>
    <AudioPlayer v-if="isLogged"></AudioPlayer>
    <Recorder v-if="isLogged"></Recorder>
    <v-footer v-if="!isLogged">
      <v-col cols="12" class="text-center">
        <a href="https://github.com/oruman/" target="_blank">OruMan</a>
        - 2020
      </v-col>
    </v-footer>
    <Notifier />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TopToolbar from "./components/TopToolbar.vue";
import AudioPlayer from "@/components/AudioPlayer.vue";
import Recorder from "@/components/Recorder.vue";
import Notifier from "@/components/Notifier.vue";

@Component({
  components: {
    Notifier,
    Recorder,
    AudioPlayer,
    TopToolbar
  }
})
export default class extends Vue {
  private get isLogged() {
    return this.$store.getters.isLogged;
  }
}
</script>
