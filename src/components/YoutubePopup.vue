<template>
  <v-dialog v-model="dialog" max-width="1004" dark>
    <v-card>
      <v-card-actions class="justify-end">
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
      <v-card-text
        ref="container"
        class="ps-0 pb-0 align-content-center youtubeplayer-wrapper"
      >
        <div ref="wrapper"></div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import player from "youtube-player";
import { YouTubePlayer } from "youtube-player/dist/types";

@Component
export default class YoutubePopup extends Vue {
  private player: YouTubePlayer | null = null;
  private aspectRatio = 16 / 9;
  private tm: number | null = null;
  private width = 400;
  private height = 300;

  mounted() {
    this.getSize();
    window.addEventListener("resize", this.onResize);
  }

  beforeDestroy() {
    if (this.player) {
      this.player.destroy();
    }
    window.removeEventListener("resize", this.onResize);
  }

  private get YoutubeID() {
    return this.$store ? this.$store.getters["youtube/id"] : "";
  }

  private get dialog() {
    const ret = this.YoutubeID.length > 0;
    if (ret) {
      this.$nextTick(() => {
        this.setPlayer();
      });
    }
    return ret;
  }

  private set dialog(flag: boolean) {
    if (flag) {
      return;
    }
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    this.$store.dispatch("youtube/SET_ID", "");
  }

  private setPlayer() {
    const el = this.$refs.wrapper as HTMLElement;
    if (!el) {
      this.$nextTick(() => {
        this.setPlayer();
        return;
      });
    }
    this.getSize();
    const options: SimpleObject = {
      videoId: this.YoutubeID,
      width: this.width + "px",
      height: this.height + "px",
      playerVars: {
        autoplay: 1
      }
    };
    this.player = player(el, options);
    setTimeout(() => {
      this.getSize();
      if (this.player) {
        this.player.setSize(this.width, this.height);
      }
    }, 500);
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
    const el = this.$refs.container as HTMLElement;
    if (!el) {
      return;
    }
    this.width = Math.min(Math.max(el.offsetWidth, 400), window.innerWidth);
    this.height = this.width / this.aspectRatio;
  }
}
</script>

<style scoped lang="scss">
.youtubeplayer-wrapper {
  line-height: 0;
}
</style>
