<template>
  <v-dialog max-width="600" v-model="dialog" :persistent="recording">
    <v-card>
      <v-card-title class="headline">
        Record Audio
      </v-card-title>
      <v-card-text v-html="name"></v-card-text>
      <v-card-subtitle v-if="totalDuration">{{ duration }}</v-card-subtitle>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text v-if="!recording" :disabled="isLoading" @click="record">
          <v-icon>mdi-record-rec</v-icon>
          Record
        </v-btn>
        <v-btn text v-if="recording" :disabled="isLoading" @click="pause">
          <v-icon>mdi-pause</v-icon>
          Pause
        </v-btn>
        <v-btn text :disabled="isLoading" @click="stop">
          <v-icon>mdi-stop</v-icon>
          Stop
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapGetters } from "vuex";
import MicRecorder from "@/helpers/micrecorder";
import Utils from "@/helpers/util";
import {Errors} from "@/store/modules/errors";

@Component({
  computed: mapGetters(["isLoading"])
})
export default class Recorder extends Vue {
  private isDialog = false;
  private recording = false;
  private micRecorder: MicRecorder | null = null;
  private data: SimpleObject = {};
  private tm!: number;
  private last = Date.now();
  private totalDuration = 0;

  mounted() {
    this.isDialog = false;
    this.tm = setInterval(() => {
      const last = this.last;
      this.last = Date.now();
      if (this.recording) this.totalDuration += (this.last - last) / 1000;
    }, 200);
  }

  beforeDestroy() {
    if (this.tm) clearInterval(this.tm);
  }

  updated() {
    if (JSON.stringify(this.data) == JSON.stringify(this.recordData)) return;
    this.data = this.recordData;
    if (Object.prototype.hasOwnProperty.call(this.data, "name"))
      this.setMicRecorder();
  }

  private get dialog() {
    return this.isDialog;
  }

  private set dialog(flag: boolean) {
    if (this.recording) return;
    this.isDialog = flag;
    if (!flag) Vue.delete(this.data, "name");
  }

  private setMicRecorder() {
    try {
      this.micRecorder = new MicRecorder();
      this.micRecorder.onError = (message: string) => {
        this.$store.dispatch("errors/ADD", message);
        this.dialog = false;
      };
      this.totalDuration = 0;
      this.isDialog = true;
      // eslint-disable-next-line no-empty
    } catch (e) {
      console.log(e);
      this.$store.dispatch("errors/ADD", "Recorder is not exist");
      this.$store.dispatch("audio/SET_RECORD", {});
    }
  }

  private get name() {
    return this.recordData.name || "";
  }

  private get recordData() {
    return this.$store ? this.$store.getters["audio/recordData"] : {};
  }

  private record() {
    if (!this.micRecorder) return;
    try {
      this.micRecorder.record();
      this.recording = true;
    } catch (e) {
      const message = e.message || "Error during record";
      this.$store.dispatch("errors/ADD", message);
    }
  }

  private pause() {
    if (!this.micRecorder) return;
    this.recording = false;
    this.micRecorder.pause();
  }

  private stop() {
    if (!this.micRecorder) return;
    this.recording = false;
    const name = this.name;
    this.micRecorder
      .stop()
      .then(file => {
        if (!confirm("Do you want to upload this Audio?")) return;
        const obj = {
          file: file,
          kind: this.data.kind,
          dateIndex: this.data.dateIndex
        };
        this.$store.dispatch("network/UPLOAD_HW_AUDIO", obj).then(res => {
          if (
            !Object.prototype.hasOwnProperty.call(res, "rejected") ||
            res.rejected ||
            !Object.prototype.hasOwnProperty.call(res, "file_id") ||
            !res.file_id
          )
            return;
          this.play(name, res.file_id);
        });
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {})
      .finally(() => {
        this.isDialog = false;
        this.micRecorder = null;
        this.$store.dispatch("audio/SET_RECORD", {});
      });
  }

  private play(name: string, fileId: number) {
    this.$store.dispatch("network/GET_LINK", fileId).then(link => {
      if (!link) return;
      const obj = {
        name: name,
        link: link,
        duration: 0
      };
      this.$store.dispatch("audio/SET_DATA", obj);
    });
  }

  private get duration() {
    return this.totalDuration
      ? Utils.formatAudioDuration(this.totalDuration)
      : "N/A";
  }
}
</script>

<style scoped lang="scss">
::v-deep .wrap-normal {
  white-space: normal;
}
</style>
