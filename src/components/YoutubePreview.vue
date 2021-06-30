<template>
  <div>
    <div
      ref="wrapper"
      class="video-placeholder"
      :style="styles"
      @click.prevent="setPlayer"
    >
      <svg
        width="66"
        height="73"
        viewBox="0 0 66 73"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="video-start"
      >
        <g filter="url(#filter0_d)">
          <path d="M2 69V0L64 33.4219L2 69Z" fill="white" />
        </g>
        <defs>
          <filter
            id="filter0_d"
            x="0"
            y="0"
            width="66"
            height="73"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
// https://github.com/anteriovieira/vue-youtube/blob/master/src/vue-youtube.js
import { Component, Prop, Vue } from "vue-property-decorator";
import player from "youtube-player";
import { YouTubePlayer } from "youtube-player/dist/types";

@Component
export default class YoutubePreview extends Vue {
  @Prop({ type: String, default: "" }) readonly videoId!: string;

  private get styles() {
    const ret: SimpleObject = {};
    if (this.videoId) {
      ret.backgroundImage = `url("https://img.youtube.com/vi/${this.videoId}/sddefault.jpg")`;
    }
    return ret;
  }

  private setPlayer() {
    this.$store.dispatch("youtube/SET_ID", this.videoId);
  }
}
</script>

<style scoped lang="scss">
.video-placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 18 / 10;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
}
.video-start {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -36px;
  margin-left: -33px;
}
</style>
