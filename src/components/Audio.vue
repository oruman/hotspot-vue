<template>
  <v-card
    style="text-align: center"
    :flat="!(flat === undefined || flat === false)"
  >
    <v-card-title v-if="title" v-text="title"></v-card-title>
    <v-card-text>
      <v-btn
        outlined
        icon
        class="ma-2"
        :color="color"
        @click.native="playing ? pause() : play()"
        :disabled="!loaded"
      >
        <v-icon v-if="!playing || paused">mdi-play</v-icon>
        <v-icon v-else>mdi-pause</v-icon>
      </v-btn>
      <v-btn
        outlined
        icon
        class="ma-2"
        :color="color"
        @click.native="stop()"
        :disabled="!loaded"
      >
        <v-icon>mdi-stop</v-icon>
      </v-btn>
      <v-btn
        outlined
        icon
        class="ma-2"
        :color="color"
        @click.native="mute()"
        :disabled="!loaded"
      >
        <v-icon v-if="!isMuted">mdi-volume-high</v-icon>
        <v-icon v-else>mdi-volume-mute</v-icon>
      </v-btn>
      <v-btn
        outlined
        icon
        class="ma-2"
        :color="color"
        @click.native="loaded ? download() : reload()"
        v-if="!loaded"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn
        outlined
        icon
        class="ma-2"
        :color="color"
        @click.native="loaded ? download() : reload()"
        v-if="loaded && downloadable"
      >
        <v-icon>mdi-download</v-icon>
      </v-btn>
      <v-progress-linear
        v-model="percentage"
        height="5"
        style="margin-top: 15px; margin-bottom: 15px;"
        @click.native="setPosition()"
        :disabled="!loaded"
      ></v-progress-linear>
      <p>{{ currentTime }} / {{ duration }}</p>
    </v-card-text>
    <audio
      id="player"
      ref="player"
      v-on:ended="ended"
      v-on:canplay="canPlay"
      :src="file"
    ></audio>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Audio extends Vue {
  @Prop({ type: Boolean, default: false }) private flat!: boolean;
  @Prop({ type: String, default: null }) private title!: string;
  @Prop({ type: String, default: null }) private file!: string;
  @Prop({ type: Boolean, default: false }) private autoPlay!: boolean;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  @Prop({ type: Function, default: () => {} }) private ended!: Function;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  @Prop({ type: Function, default: () => {} }) private canPlay!: Function;
  @Prop({ type: String, default: null }) private color!: string;
  @Prop({ type: Boolean, default: false }) private downloadable!: boolean;

  private firstPlay = true;
  private isMuted = false;
  private loaded = false;
  private playing = false;
  private paused = false;
  private percentage = 0;
  private currentTime = "00:00:00";
  private audio!: HTMLAudioElement;
  private totalDuration = 0;
  private volumeValue = 75;

  constructor() {
    super();
  }

  mounted() {
    this.audio = this.$refs.player as HTMLAudioElement;
    this.init();
  }

  beforeDestroy() {
    this.audio.removeEventListener("timeupdate", this._handlePlayingUI);
    this.audio.removeEventListener("loadeddata", this._handleLoaded);
    this.audio.removeEventListener("pause", this._handlePlayPause);
    this.audio.removeEventListener("play", this._handlePlayPause);
    this.audio.removeEventListener("ended", this._handleEnded);
  }

  private get duration() {
    return this.loaded ? Audio.formatTime(this.totalDuration) : "";
  }

  private setPosition() {
    this.audio.currentTime = (this.audio.duration / 100) * this.percentage;
  }

  private stop() {
    this.paused = true;
    this.playing = false;
    this.audio.pause();
    this.audio.currentTime = 1;
    this.percentage = this.audio.currentTime / this.audio.duration;
  }

  private play() {
    if (this.playing) return;
    this.audio.play().then(() => (this.playing = true));
    this.paused = false;
  }

  private pause() {
    this.paused = !this.paused;
    this.paused ? this.audio.pause() : this.audio.play();
  }

  private download() {
    this.audio.pause();
    window.open(this.file, "download");
  }

  private mute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.volumeValue = this.isMuted ? 0 : 75;
  }

  private reload() {
    this.audio.load();
  }

  private _handleLoaded() {
    if (this.audio.readyState >= 2) {
      if (this.audio.duration === Infinity) {
        // Fix duration for streamed audio source or blob based
        // https://stackoverflow.com/questions/38443084/how-can-i-add-predefined-length-to-audio-recorded-from-mediarecorder-in-chrome/39971175#39971175
        this.audio.currentTime = 1e101;
        this.audio.ontimeupdate = () => {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          this.audio.ontimeupdate = () => {};
          this.totalDuration = this.audio.duration;
          this.audio.currentTime = 1;
          this.loaded = true;
        };
      } else {
        this.totalDuration = this.audio.duration;
        this.loaded = true;
      }
      if (this.autoPlay) this.audio.play();
    } else {
      throw new Error("Failed to load sound file");
    }
  }

  private _handlePlayingUI() {
    this.percentage = (this.audio.currentTime / this.audio.duration) * 100;
    this.currentTime = Audio.formatTime(this.audio.currentTime);
    this.playing = true;
  }

  private _handlePlayPause(e: Event) {
    if (e.type === "play" && this.firstPlay) {
      // in some situations, audio.currentTime is the end one on chrome
      this.audio.currentTime = 0;
      if (this.firstPlay) {
        this.firstPlay = false;
      }
    }
    if (e.type === "pause" && !this.paused && !this.playing) {
      this.currentTime = "00:00:00";
    }
  }

  private _handleEnded() {
    this.paused = this.playing = false;
  }

  private static formatTime(seconds: number) {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
  }

  private init() {
    this.audio.addEventListener("timeupdate", this._handlePlayingUI);
    this.audio.addEventListener("loadeddata", this._handleLoaded);
    this.audio.addEventListener("pause", this._handlePlayPause);
    this.audio.addEventListener("play", this._handlePlayPause);
    this.audio.addEventListener("ended", this._handleEnded);
  }
}
</script>
