<template>
  <v-container>
    <v-row>
      <v-col cols="12" v-for="item of rols" :key="item.id">
        <v-card>
          <v-subheader>
            Week #{{ item.id }}
            <v-spacer />
            Deadline: {{ getDate(item.id) }}
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
            <v-btn text small v-if="!isFileRecord(item.id)" :disabled="true">
              <v-icon>mdi-upload</v-icon>
              Upload
            </v-btn>
            <v-btn text small v-if="!isFileRecord(item.id)" :disabled="true">
              <v-icon>mdi-record-rec</v-icon>
              Record
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import moment from "moment";
import Utils from "@/helpers/util";

@Component
export default class ReadOutLoud extends Vue {
  private aspect = 2;

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
    if (!this.lessonsDate[num]) return "N/A";
    return moment(this.lessonsDate[num])
      .add(-2, "day")
      .format("YYYY-MM-DD HH:mm");
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

  private download(item: SimpleObject) {
    const fileId = this.isFileRecord(item.id);
    if (!fileId) return;
    this.$store.dispatch("network/GET_LINK_INFO", fileId).then(info => {
      if (!info.link) return;
      Utils.downloadURL(info.link, info.name);
    });
  }
}
</script>
