<template>
  <v-container>
    <div class="text-center">
      <v-pagination v-model="month" :length="countMonth"></v-pagination>
    </div>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th width="60">&nbsp;</th>
            <th>Name</th>
            <th class="text-center" width="70">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(scoreStudent, index) of sortedList" :key="index">
            <td>
              <v-icon v-if="iconForPlace(index)">{{
                iconForPlace(index)
              }}</v-icon>
            </td>
            <td>{{ studentName(scoreStudent.id) }}</td>
            <td
              class="text-center"
              v-bind:class="classForScore(scoreStudent.score)"
            >
              {{ scoreStudent.scoreFixed }}
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class HallOfFame extends Vue {
  private currentMonth = 0;

  mounted() {
    this.$store.dispatch("groups/GET_DATA");
    this.$store.dispatch("students/GET_DATA");
  }

  private get month() {
    return this.currentMonth + 1;
  }

  private set month(num: number) {
    this.currentMonth = num - 1;
  }

  private get countMonth() {
    return Math.max(this.averageMarks.length, 1);
  }

  private get averageMarks() {
    return this.$store ? this.$store.getters["groups/averageMarks"] : [];
  }

  private get sortedList() {
    const ret: SimpleObject[] = [];
    if (this.currentMonth >= this.averageMarks.length) return ret;
    for (const studentId in this.averageMarks[this.currentMonth]) {
      if (
        !Object.prototype.hasOwnProperty.call(
          this.averageMarks[this.currentMonth],
          studentId
        )
      )
        continue;
      const item: SimpleObject = {
        id: studentId,
        score: this.averageMarks[this.currentMonth][studentId] || 0
      };
      item.scoreFixed = item.score ? item.score.toFixed(1) : "N/A";
      ret.push(item);
    }
    ret.sort((a, b) => {
      return this.compareScores(a.id, b.id, this.currentMonth);
    });
    return ret;
  }

  private compareScores(
    studentAid: number,
    studentBid: number,
    numMonth: number
  ): number {
    if (numMonth < 0) return studentBid - studentAid;
    const scoreA =
      this.averageMarks[numMonth] && this.averageMarks[numMonth][studentAid]
        ? this.averageMarks[numMonth][studentAid]
        : 0;
    const scoreB =
      this.averageMarks[numMonth] && this.averageMarks[numMonth][studentBid]
        ? this.averageMarks[numMonth][studentBid]
        : 0;
    if (scoreA == scoreB)
      return this.compareScores(studentAid, studentBid, numMonth - 1);
    return scoreB - scoreA;
  }

  private get studentsList() {
    return this.$store ? this.$store.getters["students/list"] : {};
  }

  private studentName(studentId: number) {
    return Object.prototype.hasOwnProperty.call(this.studentsList, studentId) ? this.studentsList[studentId] : "";
  }

  private iconForPlace(index: number) {
    const classes = ["mdi-crown", "mdi-trophy-award", "mdi-seal"];
    return index < classes.length
      ? classes[index]
      : index <= 10
      ? "mdi-numeric-" + (index + 1)
      : "";
  }

  private classForScore(num: number) {
    if (!num) return "";
    if (num < 55) return "error";
    if (num < 75) return "warning";
    return "success";
  }
}
</script>
