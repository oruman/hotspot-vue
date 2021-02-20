<template>
  <v-layout column wrap>
    <v-flex>
      <TestTable />
    </v-flex>
    <v-flex class="pa-3">
      <h6 class="title text-uppercase">Attendance</h6>
      <MarkTable />
      <h6 class="title text-uppercase d-flex d-sm-none">Hall of fame</h6>
      <HallOfFame />
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MarkTable from "@/components/MarkTable.vue";
import TestTable from "@/components/TestTable.vue";
import HallOfFame from "@/components/HallOfFame.vue";

@Component({
  components: { HallOfFame, TestTable, MarkTable }
})
export default class Overview extends Vue {}
</script>

<style scoped lang="scss"></style>
