<template>
  <div>
    <div
      ref="wrapper"
      class="video-placeholder"
      :style="styles"
      @click.prevent="setPlayer"
    >
      <span class="video-start primary">&#9654;</span>
    </div>
  </div>
</template>

<script lang="ts">
// https://github.com/anteriovieira/vue-youtube/blob/master/src/vue-youtube.js
import { Component, Prop, Vue } from "vue-property-decorator";
import player from "youtube-player";
import { YouTubePlayer } from "youtube-player/dist/types";

@Component
export default class Youtube extends Vue {
  @Prop({ type: String, default: "" }) readonly videoId!: string;

  private player: YouTubePlayer | null = null;
  private aspectRatio = 16 / 9;
  private tm: number | null = null;
  private width = 400;
  private height = 300;

  mounted() {
    this.getSize();
    window.addEventListener("resize", this.onResize);
  }

  private get styles() {
    const ret: SimpleObject = {};
    if (this.videoId) {
      ret.backgroundImage = `url("https://img.youtube.com/vi/${this.videoId}/sddefault.jpg")`;
    }
    ret.width = this.width + "px";
    ret.height = this.height + "px";
    return ret;
  }

  private setPlayer() {
    const el = this.$refs.wrapper as HTMLElement;
    const options: SimpleObject = {
      videoId: this.videoId,
      width: this.width + "px",
      height: this.height + "px",
      playerVars: {
        autoplay: 1
      }
    };
    this.player = player(el, options);
  }

  beforeDestroy() {
    if (this.player) {
      this.player.destroy();
    }
    window.removeEventListener("resize", this.onResize);
  }

  private onResize() {
    if (this.tm) {
      clearTimeout(this.tm);
      this.tm = null;
    }
    this.getSize();
    this.tm = setTimeout(() => {
      if (this.player) {
        this.player.setSize(this.width, this.height);
      }
    }, 500);
  }

  private getSize() {
    const el = this.$el as HTMLElement;
    this.width = el.offsetWidth;
    this.height = this.width / this.aspectRatio;
  }
}
</script>

<style scoped lang="scss">
.video-placeholder {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 300px;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
}
.video-start {
  display: block;
  height: 100px;
  width: 100px;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -50px;
  border-radius: 50px;
  line-height: 100px;
  text-align: center;
  font-size: 50px;
  padding-left: 10px;
  opacity: 0.5;
}
</style>
