<template>
  <v-container class="block-height">
    <h6 class="title">Exam</h6>
    <TestTable></TestTable>
    <h6 class="title">Attendance</h6>
    <MarkTable class="block-height-child"></MarkTable>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MarkTable from "@/components/MarkTable.vue";
import TestTable from "@/components/TestTable.vue";

@Component({
  components: { TestTable, MarkTable }
})
export default class Overview extends Vue {}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  overflow-y: auto;
}
.block-height-child {
  overflow-y: hidden;
  flex-grow: 1;
  min-height: 200px;
}
</style>
