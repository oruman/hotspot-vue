<template>
  <v-container>
    <div class="text-center">
      <v-pagination v-model="month" :length="countMonth"></v-pagination>
    </div>
    <v-row v-if="tols.length">
      <v-col cols="12" v-for="(item, index) of tols" :key="item">
        <v-card>
          <v-subheader>
            Day #{{ index + 1 }}
            <v-spacer />
            Deadline: {{ getDate }}
          </v-subheader>
          <v-divider />
          <v-card-subtitle v-html="item"></v-card-subtitle>
          <v-card-actions>
            <v-btn
              text
              small
              v-if="isFileRecord(index)"
              @click.prevent="download(index)"
            >
              <v-icon>mdi-download</v-icon>
              Download
            </v-btn>
            <v-btn
              text
              small
              v-if="isFileRecord(index)"
              @click.prevent="play(item, index)"
            >
              <v-icon>mdi-play</v-icon>
              Play
            </v-btn>
            <v-btn text small v-if="!isFileRecord(index)" :disabled="true">
              <v-icon>mdi-upload</v-icon>
              Upload
            </v-btn>
            <v-btn text small v-if="!isFileRecord(index)" :disabled="true">
              <v-icon>mdi-record-rec</v-icon>
              Record
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      No need to record your think!
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import moment from "moment";
import Utils from "@/helpers/util";

@Component
export default class ThinkOutLoud extends Vue {
  private currentMonth = 0;
  private aspect = 3;

  mounted() {
    this.$store.dispatch("grades/GET_DATA");
    this.$store.dispatch("lessons/GET_DATA");
    this.$store.dispatch("homework/GET_DATA");
  }

  private get month() {
    return this.currentMonth + 1;
  }

  private set month(num: number) {
    this.currentMonth = num - 1;
  }

  private get countMonth() {
    return Math.max(1, this.allTols.length);
  }

  private get allTols() {
    return this.$store ? this.$store.getters["grades/tols"] : [];
  }

  private get tols() {
    return this.allTols[this.currentMonth] || [];
  }

  private get lessonsDate() {
    const marks = this.$store ? this.$store.getters["lessons/marks"] : [];
    const newData = [];
    for (const item of marks) {
      if (item.aspect == this.aspect) newData.push(item.date);
    }
    return newData;
  }

  private get getDate() {
    if (!this.lessonsDate[this.currentMonth]) return "N/A";
    return moment(this.lessonsDate[this.currentMonth])
      .add(-2, "day")
      .format("YYYY-MM-DD HH:mm");
  }

  private get files() {
    const items = this.$store ? this.$store.getters["homework/speaking"] : [];
    const newData: SimpleObject[][] = [];
    for (const item of items) {
      const num = item.date_index - 1;
      const weekNum = Math.floor(num / 5);
      const dayNum = num % 5;
      if (!newData[weekNum]) newData[weekNum] = [];
      newData[weekNum][dayNum] = item;
    }
    return newData;
  }

  private isFileRecord(num: number) {
    return this.files[this.currentMonth] &&
      this.files[this.currentMonth][num] &&
      Object.prototype.hasOwnProperty.call(
        this.files[this.currentMonth][num],
        "file_id"
      ) &&
      this.files[this.currentMonth][num].file_id
      ? this.files[this.currentMonth][num].file_id
      : 0;
  }

  private play(name: string, num: number) {
    const fileId = this.isFileRecord(num);
    if (!fileId) return;
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

  private download(num: number) {
    const fileId = this.isFileRecord(num);
    if (!fileId) return;
    this.$store.dispatch("network/GET_LINK_INFO", fileId).then(info => {
      if (!info.link) return;
      Utils.downloadURL(info.link, info.name);
    });
  }
}
</script>
