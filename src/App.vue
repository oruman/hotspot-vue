<template>
  <v-app>
    <TopToolbar v-if="isLogged"></TopToolbar>
    <v-main>
      <router-view></router-view>
    </v-main>
    <BottomNav v-if="isLogged"></BottomNav>
    <AudioPlayer v-if="isLogged"></AudioPlayer>
    <v-footer v-if="!isLogged">
      <v-col cols="12" class="text-center">
        <a href="https://github.com/oruman/" target="_blank">OruMan</a>
        - 2020
      </v-col>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TopToolbar from "./components/TopToolbar.vue";
import BottomNav from "./components/BottomNav.vue";
import AudioPlayer from "@/components/AudioPlayer.vue";
@Component({
  components: {
    AudioPlayer,
    TopToolbar,
    BottomNav
  }
})
export default class extends Vue {
  private get isLogged() {
    return this.$store.getters.isLogged;
  }
}
</script>
