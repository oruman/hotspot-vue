<template>
  <v-bottom-sheet inset v-model="sheet">
    <v-card tile>
      <v-progress-linear
        v-model="percentage"
        class="my-0"
        height="3"
        :disabled="loading"
      ></v-progress-linear>

      <v-list>
        <v-list-item>
          <v-list-item-icon v-if="loading">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title
              class="wrap-normal"
              v-html="name"
            ></v-list-item-title>
            <v-list-item-subtitle>
              {{ currentTimeFormated }} / {{ duration }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-icon>
            <v-btn icon v-if="playing" @click="pause">
              <v-icon :disabled="loading">mdi-pause</v-icon>
            </v-btn>
            <v-btn icon v-if="playing" @click="stop">
              <v-icon :disabled="loading">mdi-stop</v-icon>
            </v-btn>
            <v-btn icon v-if="!playing" @click="play">
              <v-icon :disabled="loading">mdi-play</v-icon>
            </v-btn>
          </v-list-item-icon>
        </v-list-item>
      </v-list>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Utils from "@/helpers/util";

@Component
export default class AudioPlayer extends Vue {
  private loading = true;
  private playing = false;
  private currentTime = 0;
  private staticLink = "";
  private audio!: HTMLAudioElement;

  mounted() {
    // Hack for develop
    this.sheet = false;
  }

  updated() {
    if (this.staticLink == this.link) return;
    this.staticLink = this.link;
    if (this.staticLink) this.init();
    else this.destroy();
  }

  beforeDestroy() {
    this.destroy();
  }

  private get duration() {
    return this.totalDuration
      ? Utils.formatAudioDuration(this.totalDuration)
      : "N/A";
  }

  private get currentTimeFormated() {
    return Utils.formatAudioDuration(this.currentTime);
  }

  private get audioData() {
    return this.$store ? this.$store.getters["audio/data"] : {};
  }

  private get totalDuration() {
    const duration = this.audioData.duration;
    return duration && duration != Infinity ? duration : 0;
  }

  private set totalDuration(seconds: number) {
    this.$store.dispatch("audio/SET_DURATION", seconds);
  }

  private get name() {
    return this.audioData.name || "";
  }

  private get link() {
    return this.audioData.link || "";
  }

  private get sheet() {
    return (
      Object.prototype.hasOwnProperty.call(this.audioData, "link") &&
      this.audioData.link
    );
  }

  private set sheet(flag: boolean) {
    if (!flag && this.$store) this.$store.dispatch("audio/SET_DATA", {});
  }

  private get percentage() {
    return this.totalDuration > 0
      ? (this.currentTime / this.totalDuration) * 100
      : 0;
  }

  private set percentage(value: number) {
    if (this.loading || !this.totalDuration || !this.audio) return;
    this.audio.currentTime = (this.totalDuration * value) / 100;
    if (value < 100 && !this.playing) this.play();
  }

  private init() {
    this.audio = new Audio();
    this.audio.loop = false;
    this.audio.volume = 1;
    this.audio.addEventListener("timeupdate", this._handleTimeUpdate, false);
    this.audio.addEventListener("loadeddata", this._handleLoaded, false);
    this.audio.addEventListener("playing", this._handlePlayerStatus, false);
    this.audio.addEventListener("pause", this._handlePlayerStatus, false);
    this.audio.addEventListener("ended", this._handlePlayerStatus, false);
    this.loading = true;
    this.playing = false;
    this.audio.src = this.staticLink;
  }

  private destroy() {
    if (!this.audio) return;
    this.audio.removeEventListener("timeupdate", this._handleTimeUpdate);
    this.audio.removeEventListener("loadeddata", this._handleLoaded);
    this.audio.removeEventListener("playing", this._handlePlayerStatus);
    this.audio.removeEventListener("pause", this._handlePlayerStatus);
    this.audio.removeEventListener("ended", this._handlePlayerStatus);
    this.audio.pause();
    this.currentTime = 0;
  }

  private play() {
    if (this.loading || !this.audio) return;
    this.audio.play();
  }

  private pause() {
    if (this.loading || !this.audio) return;
    this.audio.pause();
  }

  private stop() {
    if (this.loading || !this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
    this._handleTimeUpdate();
  }

  private _handleTimeUpdate() {
    if (this.loading) {
      console.log("Test");
    } else this.currentTime = this.audio.currentTime;
  }

  private _handleLoaded() {
    // Fix duration for streamed audio source or blob based
    // https://stackoverflow.com/questions/38443084/how-can-i-add-predefined-length-to-audio-recorded-from-mediarecorder-in-chrome/39971175#39971175
    if (!this.totalDuration) {
      this.totalDuration = this.audio.duration;
      this.endLoaded();
    }
    this.endLoaded();
  }

  private endLoaded() {
    this.loading = false;
    this.audio.play();
  }

  private _handlePlayerStatus(evt: Event) {
    switch (evt.type) {
      case "playing":
        this.playing = true;
        break;
      case "pause":
        this.playing = false;
        break;
      case "ended":
        this.stop();
        break;
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .wrap-normal {
  white-space: normal;
}
</style>
