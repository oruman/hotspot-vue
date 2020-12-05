<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th>Test</th>
          <th
            v-for="(total, index) in dataForView.Total"
            :key="index"
            class="text-center"
          >
            #{{ index + 1 }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(value, aspect) of dataForView" :key="aspect">
          <th>{{ aspect }}</th>
          <td
            class="text-center"
            v-for="(text, index) in value"
            :key="`${aspect}-${index}`"
          >
            {{ formatValue(text) }}
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { aspectsName } from "@/data/data";

@Component
export default class TestTable extends Vue {
  mounted() {
    this.$store.dispatch("lessons/GET_DATA");
  }

  private get tests() {
    if (this.$store) return this.$store.getters["lessons/tests"];
    return [];
  }

  private get aspectsView() {
    return Object.keys(this.dataForView);
  }

  private get dataForView() {
    const newData: SimpleObject = {};
    let maxLength = 0;
    for (const item of this.tests) {
      const aspect = this.getNameForAspect(item.aspect);
      if (!Object.prototype.hasOwnProperty.call(newData, aspect))
        newData[aspect] = [];
      newData[aspect].push(item.score);
    }
    for (const aspect in newData) {
      if (!Object.prototype.hasOwnProperty.call(newData, aspect)) continue;
      maxLength = Math.max(maxLength, newData[aspect].length);
    }
    for (const aspect in newData) {
      if (
        !Object.prototype.hasOwnProperty.call(newData, aspect) ||
        maxLength == newData[aspect].length
      )
        continue;
      const startLength = newData[aspect].length;
      for (let i = startLength; i < maxLength; i++) newData[aspect].push(0);
    }
    const totalArray: number[] = [];
    for (let i = 0; i < maxLength; i++) {
      let cnt = 0;
      let total = 0;
      for (const aspect in newData) {
        if (!Object.prototype.hasOwnProperty.call(newData, aspect)) continue;
        if (newData[aspect][i]) {
          cnt++;
          total += newData[aspect][i];
        }
      }
      if (cnt > 0) total = total / cnt;
      totalArray.push(total);
    }
    newData["Total"] = totalArray;
    return newData;
  }

  protected getNameForAspect(id: number) {
    return Object.prototype.hasOwnProperty.call(aspectsName, id)
      ? aspectsName[id]
      : "";
  }

  protected formatValue(value: number) {
    return value.toFixed(1);
  }
}
</script>
