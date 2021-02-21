<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th><h6 class="title text-uppercase black--text d-none d-sm-block">Hall of fame</h6></th>
          <th class="text-center" v-for="num in countMonth" :key="num">
            {{ num }} MON
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="studentId of sortedList" :key="studentId">
          <th>{{ studentName(studentId) }}</th>
          <td
            class="text-center"
            v-for="num in countMonth"
            :key="num"
            :class="classForScore(studentId, num)"
          >
            {{ scoreForStudent(studentId, num) }}
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
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
    const studentsIds: number[] = Object.keys(this.studentsList).map(item =>
      parseInt(item, 10)
    );
    studentsIds.sort((a, b) => {
      return this.compareScores(a, b, this.countMonth - 1);
    });
    return studentsIds;
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
    return Object.prototype.hasOwnProperty.call(this.studentsList, studentId)
      ? this.studentsList[studentId]
      : "";
  }

  private scoreForStudent(studentId: number, month: number) {
    const numMonth = month - 1;
    return this.averageMarks[numMonth] && this.averageMarks[numMonth][studentId]
      ? this.averageMarks[numMonth][studentId].toFixed(1)
      : "";
  }

  private classForScore(studentId: number, month: number) {
    const numMonth = month - 1;
    const num =
      this.averageMarks[numMonth] && this.averageMarks[numMonth][studentId]
        ? this.averageMarks[numMonth][studentId]
        : 0;
    if (!num) return "";
    if (num < 55) return "error--text";
    return "";
  }
}
</script>
