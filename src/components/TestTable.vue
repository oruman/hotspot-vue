<template>
  <v-sheet outlined dark class="pa-3">
    <v-sheet class="d-flex">
      <h6 class="title text-uppercase grow">Performance</h6>
      <v-btn-toggle v-model="carouselModel">
        <v-btn small>Graph</v-btn>
        <v-btn small>Table</v-btn>
      </v-btn-toggle>
    </v-sheet>
    <v-carousel
      dark
      height="250"
      hide-delimiters
      :show-arrows="false"
      v-model="carouselModel"
    >
      <v-carousel-item>
        <apexchart height="225" :options="chartOptions" :series="dataSeries" />
      </v-carousel-item>
      <v-carousel-item>
        <v-sheet tile>
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="px-2">Test</th>
                  <th
                    v-for="(total, index) in dataForView.Total"
                    :key="index"
                    class="text-center px-1"
                  >
                    {{ index + 1 }} MON
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(value, aspect) of dataForView" :key="aspect">
                  <th class="px-2">{{ aspect }}</th>
                  <td
                    class="text-center px-1"
                    v-for="(item, index) in value"
                    :key="`${aspect}-${index}`"
                    v-html="formatTableCell(item)"
                  ></td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-sheet>
      </v-carousel-item>
    </v-carousel>
  </v-sheet>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {aspectsName, DATE_SHORT} from "@/data/data";
import {DefaultChartOptions} from "@/data/charoptions";
import moment from "moment";

@Component
export default class TestTable extends Vue {
  carouselModel = 0;

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
      newData[aspect].push(item);
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
    const totalArray: SimpleObject[] = [];
    for (let i = 0; i < maxLength; i++) {
      let cnt = 0;
      let total = 0;
      for (const aspect in newData) {
        if (!Object.prototype.hasOwnProperty.call(newData, aspect)) continue;
        if (newData[aspect][i]) {
          cnt++;
          total += newData[aspect][i].score;
        }
      }
      if (cnt > 0) total = total / cnt;
      totalArray.push({
        score: total
      });
    }
    newData["Total"] = totalArray;
    return newData;
  }

  private get dataSeries() {
    const newData: number[] = [];
    newData.push(0);
    const oldData = this.dataForView;
    if (Object.prototype.hasOwnProperty.call(oldData, "Total")) {
      for (const item of this.dataForView["Total"]) newData.push(item.score);
    }
    if (newData.length > 1) newData[0] = newData[1];
    return [
      {
        name: "Average",
        data: newData
      }
    ];
  }

  private get chartOptions() {
    const customOptions = {
      xaxis: {
        categories: ["START", "1 MON", "2 MON", "3 MON", "4 MON"]
      }
    };
    return { ...DefaultChartOptions, ...customOptions };
  }

  private get isGraph() {
    return this.carouselModel === 0;
  }

  protected getNameForAspect(id: number) {
    return Object.prototype.hasOwnProperty.call(aspectsName, id)
      ? aspectsName[id]
      : "";
  }

  protected formatTableCell(item: SimpleObject) {
    const value = item.score.toFixed(1);
    let ret = "";
    if (item.aspect) {
      const date = moment(item.date).format(DATE_SHORT);
      ret += `<span>${date}</span> `;
    }
    ret += `${value}%`;
    return ret;
  }
}
</script>

<style scoped lang="scss">
::v-deep td span {
  display: block;
  color: red;
  text-transform: uppercase;
}
</style>
