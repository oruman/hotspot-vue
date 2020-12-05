<template>
  <v-container>
    <div class="text-center">
      <v-pagination v-model="month" :length="countMonth"></v-pagination>
    </div>
    <v-row v-if="rols.length">
      <v-col cols="12" v-for="(item, index) of rols" :key="item.id">
        <v-card>
          <v-subheader>
            Day #{{ index + 1 }}
            <v-spacer />
            Deadline: {{ getDate }}
          </v-subheader>
          <v-divider />
          <v-card-subtitle v-html="item"></v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      No need to record your think!
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import moment from "moment";

@Component
export default class ThinkOutLoud extends Vue {
  private currentMonth = 0;
  private aspect = 3;

  mounted() {
    this.$store.dispatch("grades/GET_DATA");
    this.$store.dispatch("lessons/GET_DATA");
  }

  private get month() {
    return this.currentMonth + 1;
  }

  private set month(num: number) {
    this.currentMonth = num - 1;
  }

  private get countMonth() {
    return Math.max(1, this.allRols.length);
  }

  private get allRols() {
    return this.$store ? this.$store.getters["grades/tols"] : [];
  }

  private get rols() {
    return this.allRols[this.currentMonth] || [];
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
}
</script>
