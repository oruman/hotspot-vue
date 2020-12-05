<template>
  <v-simple-table fixed-header>
    <template v-slot:default v-if="$vuetify.breakpoint.mdAndDown">
      <thead>
        <tr>
          <th class="text-center">Week</th>
          <th class="text-center" v-for="aspect in aspectsView" :key="aspect">
            {{ aspect }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(text, index) in weeks" :key="index">
          <td class="text-left">{{ text }}</td>
          <td
            class="text-center"
            v-for="aspect in aspectsView"
            :key="`${aspect}-${index}`"
            v-bind:class="colorClassForMark(dataForView[aspect][index])"
          >
            <b>{{ dataForView[aspect][index] }}</b>
          </td>
        </tr>
      </tbody>
    </template>
    <template v-slot:default v-else>
      <thead>
        <tr>
          <th class="text-left">Week</th>
          <th class="text-center" v-for="(text, index) in weeks" :key="index">
            {{ text }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="aspect in aspectsView" :key="aspect">
          <th>{{ aspect }}</th>
          <td
            class="text-center"
            v-for="(text, index) in weeks"
            :key="`${aspect}-${index}`"
            v-bind:class="colorClassForMark(dataForView[aspect][index])"
          >
            <b>{{ dataForView[aspect][index] }}</b>
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
export default class MarkTable extends Vue {
  private colors: SimpleObject = {
    "+": "success",
    "+/-": "warning",
    "-": "error",
    H: "info"
  };

  mounted() {
    this.$store.dispatch("lessons/GET_DATA");
  }

  private get weeks() {
    const weeks = [];
    const values = Object.values(this.dataForView);
    if (values.length) {
      const maxLength = values[0].length;
      for (let i = 1; i <= maxLength; i++) weeks.push("#" + i);
    }
    return weeks;
  }

  private get aspectsView() {
    return Object.keys(this.dataForView);
  }

  private get marks() {
    if (this.$store) return this.$store.getters["lessons/marks"];
    return [];
  }

  private get dataForView() {
    const newData: SimpleObject = {};
    let maxLength = 0;
    for (const item of this.marks) {
      const aspect = this.getNameForAspect(item.aspect);
      if (!Object.prototype.hasOwnProperty.call(newData, aspect))
        newData[aspect] = [];
      newData[aspect].push(item.mark);
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
      for (let i = startLength; i < maxLength; i++) newData[aspect].push("");
    }
    return newData;
  }

  private colorClassForMark(mark: string) {
    return Object.prototype.hasOwnProperty.call(this.colors, mark)
      ? this.colors[mark]
      : "";
  }

  protected getNameForAspect(id: string) {
    return Object.prototype.hasOwnProperty.call(aspectsName, id)
      ? aspectsName[id]
      : "";
  }
}
</script>

<style scoped lang="scss">
::v-deep div {
  max-height: 100%;
}
</style>
