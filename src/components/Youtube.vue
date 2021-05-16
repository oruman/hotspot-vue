<template>
  <div>
    <div ref="wrapper" class="video-placeholder" />
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
  private aspectRatio = 4 / 3;
  private tm: number | null = null;

  mounted() {
    const el = this.$refs.wrapper as HTMLElement;
    const width = el.offsetWidth;
    const height = width / this.aspectRatio;
    const options: SimpleObject = {
      videoId: this.videoId,
      width: width + "px",
      height: height + "px"
    };
    this.player = player(el, options);
    window.addEventListener("resize", this.onResize);
  }

  beforeDestroy() {
    if (this.player) {
      this.player.destroy();
    }
    window.removeEventListener("resize", this.onResize);
  }

  private onResize() {
    if (!this.player) {
      return;
    }
    if (this.tm) {
      clearTimeout(this.tm);
      this.tm = null;
    }
    const el = this.$el as HTMLElement;
    const width = el.offsetWidth;
    const height = width / this.aspectRatio;
    if (width && height) {
      this.tm = setTimeout(() => {
        if (this.player) {
          this.player.setSize(width, height);
        }
      }, 500);
    }
  }
}
</script>

<style scoped lang="scss">
.video-placeholder {
  width: 100%;
  max-width: 400px;
  height: 300px;
}
</style>
