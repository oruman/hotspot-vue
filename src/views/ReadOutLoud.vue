<template>
  <v-container>
    <v-row>
      <v-col cols="12" v-for="item of rols" :key="item.id">
        <v-card>
          <v-subheader>
            Week #{{ item.id }}
            <v-spacer />
            Deadline: {{ getDateFormat(item.id) }}
          </v-subheader>
          <v-divider />
          <v-card-subtitle>{{ item.te }}</v-card-subtitle>
          <v-card-actions>
            <v-btn
              text
              small
              v-if="isFileRecord(item.id)"
              @click.prevent="download(item)"
            >
              <v-icon>mdi-download</v-icon>
              Download
            </v-btn>
            <v-btn
              text
              small
              v-if="isFileRecord(item.id)"
              @click.prevent="play(item)"
            >
              <v-icon>mdi-play</v-icon>
              Play
            </v-btn>
            <v-btn
              text
              small
              v-if="!isFileRecord(item.id)"
              :disabled="isDisabled(item.id)"
              @click.prevent="upload(item.id)"
            >
              <v-icon>mdi-upload</v-icon>
              Upload
            </v-btn>
            <v-btn
              text
              small
              v-if="!isFileRecord(item.id)"
              :disabled="isDisabled(item.id)"
            >
              <v-icon>mdi-record-rec</v-icon>
              Record
            </v-btn>
            <v-spacer />
            <v-btn
              text
              small
              v-if="isFileRecord(item.id) && !isDisabled(item.id)"
              @click.prevent="remove(item.id)"
            >
              <v-icon>mdi-close-thick</v-icon>
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapGetters } from "vuex";
import moment from "moment";
import Utils from "@/helpers/util";

@Component({
  computed: mapGetters(["isLoading"])
})
export default class ReadOutLoud extends Vue {
  private aspect = 2;
  private delayToLesson = -2;

  mounted() {
    this.$store.dispatch("grades/GET_DATA");
    this.$store.dispatch("lessons/GET_DATA");
    this.$store.dispatch("homework/GET_DATA");
  }

  private get rols() {
    return this.$store ? this.$store.getters["grades/rols"] : [];
  }

  private get lessonsDate() {
    const marks = this.$store ? this.$store.getters["lessons/marks"] : [];
    const newData = [];
    for (const item of marks) {
      if (item.aspect == this.aspect) newData.push(item.date);
    }
    return newData;
  }

  private get files() {
    const items = this.$store ? this.$store.getters["homework/listening"] : [];
    const newData = [];
    for (const item of items) {
      newData[item.date_index] = item;
    }
    return newData;
  }

  private getDate(num: number) {
    num--;
    return this.lessonsDate[num]
      ? moment(this.lessonsDate[num]).add(this.delayToLesson, "day")
      : null;
  }

  private getDateFormat(num: number) {
    const lessonDate = this.getDate(num);
    return lessonDate ? lessonDate.format("YYYY-MM-DD HH:mm") : "N/A";
  }

  private isDisabled(num: number) {
    const lessonDate = this.getDate(num);
    return lessonDate ? lessonDate.valueOf() < Date.now() : true;
  }

  private isFileRecord(num: number) {
    return this.files[num] &&
      Object.prototype.hasOwnProperty.call(this.files[num], "file_id") &&
      this.files[num].file_id
      ? this.files[num].file_id
      : 0;
  }

  private play(item: SimpleObject) {
    const fileId = this.isFileRecord(item.id);
    if (!fileId) return;
    this.$store.dispatch("network/GET_LINK", fileId).then(link => {
      if (!link) return;
      const obj = {
        name: item.te,
        link: link,
        duration: 0
      };
      this.$store.dispatch("audio/SET_DATA", obj);
    });
  }

  private remove(num: number) {
    if (
      !this.files[num] ||
      !Object.prototype.hasOwnProperty.call(this.files[num], "id") ||
      !confirm("Are you sure you want to delete this file?")
    )
      return;
    this.$store.dispatch("network/DELETE_HOMEWORK", this.files[num].id);
  }

  private download(item: SimpleObject) {
    const fileId = this.isFileRecord(item.id);
    if (!fileId) return;
    this.$store.dispatch("network/GET_LINK_INFO", fileId).then(info => {
      if (!info.link) return;
      Utils.downloadURL(info.link, info.name);
    });
  }

  private upload(num: number) {
    Utils.chooseFile("audio/*").then(result => {
      const data: SimpleObject = {};
      data.file = result;
      data.dateIndex = num;
      this.$store.dispatch("network/UPLOAD_ROL", data);
    });
  }
}
</script>
