<template>
  <div>
    <v-divider />
    <v-card-title class="text-break" v-text="text"></v-card-title>
    <v-card-subtitle class="pb-0">
      Deadline: <b class="text-uppercase">{{ deadLine }}</b>
    </v-card-subtitle>
    <v-card-actions>
      <v-btn text small v-if="isFileRecord" @click.prevent="download()">
        <v-icon>mdi-download</v-icon>
        Download
      </v-btn>
      <v-btn text small v-if="isFileRecord" @click.prevent="play()">
        <v-icon>mdi-play</v-icon>
        Play
      </v-btn>
      <v-btn
        text
        small
        v-if="!isFileRecord"
        :disabled="isDisabled"
        @click.prevent="upload()"
      >
        <v-icon>mdi-upload</v-icon>
        Upload
      </v-btn>
      <v-btn
        text
        small
        v-if="!isFileRecord"
        :disabled="isDisabled"
        @click.prevent="record()"
      >
        <v-icon>mdi-record-rec</v-icon>
        Record
      </v-btn>
      <v-spacer />
      <v-btn
        text
        small
        v-if="isFileRecord && !isDisabled"
        @click.prevent="remove()"
      >
        <v-icon>mdi-close-thick</v-icon>
        Delete
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import moment from "moment";
import Utils from "@/helpers/util";
import {DATE_FULL} from "@/data/data";

@Component
export default class ReadOutLoud extends Vue {
  @Prop() readonly text!: string;
  @Prop({ default: -1 }) readonly weekNum!: number;
  @Prop() readonly deadLine!: string;
  private nowString = "";

  mounted() {
    this.$store.dispatch("homework/GET_DATA");
    this.nowString = moment().format(DATE_FULL);
  }

  private get file() {
    if (this.$store) {
      const items: SimpleObject[] = this.$store.getters["homework/listening"];
      for (const item of items) {
        if (item.date_index == this.weekNum) return item;
      }
    }
    return {};
  }

  private get isDisabled() {
    return this.deadLine < this.nowString;
  }

  private get isFileRecord() {
    return Object.prototype.hasOwnProperty.call(this.file, "file_id") &&
      this.file.file_id
      ? this.file.file_id
      : 0;
  }

  private record() {
    const obj = {
      name: this.text,
      dateIndex: this.weekNum,
      kind: 3
    };
    this.$store.dispatch("audio/SET_RECORD", obj);
  }

  private upload() {
    Utils.chooseFile("audio/*").then(result => {
      const data: SimpleObject = {};
      data.file = result;
      data.dateIndex = this.weekNum;
      this.$store.dispatch("network/UPLOAD_ROL", data);
    });
  }

  private download() {
    if (!this.isFileRecord) return;
    this.$store
      .dispatch("network/GET_LINK_INFO", this.isFileRecord)
      .then(info => {
        if (!info.link) return;
        Utils.downloadURL(info.link, info.name);
      });
  }

  private play() {
    if (!this.isFileRecord) return;
    this.$store
      .dispatch("network/GET_LINK_INFO", this.isFileRecord)
      .then(info => {
        if (!info.link) return;
        const obj = {
          name: this.text,
          link: info.link,
          duration: 0
        };
        if (Object.prototype.hasOwnProperty.call(info, "duration"))
          obj.duration = info.duration;
        this.$store.dispatch("audio/SET_DATA", obj);
      });
  }

  private remove() {
    if (
      !Object.prototype.hasOwnProperty.call(this.file, "id") ||
      !confirm("Are you sure you want to delete this file?")
    )
      return;
    this.$store.dispatch("network/DELETE_HOMEWORK", this.file.id);
  }
}
</script>

<style scoped></style>
