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
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import moment from "moment";

@Component
export default class ReadOutLoud extends Vue {
  private aspect = 2;

  mounted() {
    this.$store.dispatch("grades/GET_DATA");
    this.$store.dispatch("lessons/GET_DATA");
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

  private getDate(num: number) {
    num--;
    if (!this.lessonsDate[num]) return "N/A";
    return moment(this.lessonsDate[num])
      .add(-2, "day")
      .format("YYYY-MM-DD HH:mm");
  }
}
</script>
