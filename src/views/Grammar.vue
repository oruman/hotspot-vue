<template>
  <v-layout>
    <v-flex grow="1">
      <v-container fluid>
        <h4 class="title text-uppercase">Homework</h4>
        <template v-for="(week, weekIndex) of dataForView">
          <v-card flat class="d-flex" :key="'week_header_' + weekIndex">
            <strong class="subtitle-1 text-uppercase"
            >Week {{ weekIndex + 1 }}</strong
            >
            <v-spacer />
            <span>{{ dates[weekIndex] }}</span>
          </v-card>
          <v-card :key="'week_data_' + weekIndex" class="mb-1">
            <template v-for="(weekItem, weekItemIndex) of week">
              <v-card-title :key="'week_header_' + weekIndex + '_' + weekItemIndex">
                {{ weekItem.theme }}
              </v-card-title>
              <v-card-text :key="'week_tasks_' + weekIndex + '_' + weekItemIndex">
                <ul class="task-list">
                  <li
                    v-for="(task, taskIndex) of weekItem.tasks"
                    :key="
                        ['week_task', weekIndex, weekItemIndex, taskIndex].join('_')
                      "
                  >
                    <a :href="task.link" target="_blank">{{ task.text }}</a>
                  </li>
                </ul>
              </v-card-text>
            </template>
          </v-card>
        </template>
      </v-container>
    </v-flex>
    <v-flex style="max-width: 256px; width: 256px;">
      <v-navigation-drawer fixed right clipped style="padding-top: 62px;">
        <v-list dense>
          <template v-if="keys">
            <v-list-item-title class="text-uppercase text-center text-h5 font-weight-bold">Keys</v-list-item-title>
            <v-list-item dark v-for="(task, taskIndex) in keys" :key="'task_' + taskIndex">
              <v-sheet class="pa-2 rounded" color="#e0e0e0" width="100%">
                <a :href="task.link" target="_blank">{{ task.text }}</a>
              </v-sheet>
            </v-list-item>
          </template>
          <template v-if="materials.length">
            <v-list-item-title class="text-uppercase text-center text-h5 font-weight-bold">Materials</v-list-item-title>
            <v-list-item dark v-for="(material, materialIndex) in materials" :key="'material_' + materialIndex">
              <v-sheet class="pa-2 rounded" color="#e0e0e0">
                <a :href="material.link" target="_blank" v-text="material.name"></a>
              </v-sheet>
            </v-list-item>
          </template>
        </v-list>
      </v-navigation-drawer>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Aspects } from "@/data/data";
import moment from "moment";

@Component
export default class Grammar extends Vue {
  private aspect = Aspects.GRAMMAR;

  mounted() {
    this.$store.dispatch("grades/GET_DATA");
    this.$store.dispatch("lessons/GET_DATA");
  }

  private get dates() {
    const arrDates: string[] = [];
    const data = this.$store ? this.$store.getters["lessons/marks"] : [];
    for (const item of data) {
      if (item.aspect != this.aspect) continue;
      const date = moment(item.date).format("YYYY-MM-DD");
      arrDates.push(date);
    }
    return arrDates;
  }

  private get keys() {
    return this.dataForView.length &&
      this.dataForView[0].length &&
      Object.prototype.hasOwnProperty.call(this.dataForView[0][0], "tasks")
      ? this.dataForView[0][0].tasks
      : [];
  }

  private get dataForView() {
    const newData: SimpleObject[][] = [];
    const data = this.$store ? this.$store.getters["grades/curriculum"] : [];
    for (const items of data) {
      const newItem: SimpleObject[] = [];
      for (const elOfItems of items) {
        if (elOfItems.aspect != this.aspect) continue;

        const theme: string[] = [];
        const tasks: SimpleObject[] = [];
        for (const el of elOfItems.items) {
          if (el.link) tasks.push(el);
          else if (el.text) theme.push(el.text);
        }
        newItem.push({
          theme: theme.join(" / "),
          tasks
        });
      }
      newData.push(newItem);
    }
    return newData;
  }

  private get materials() {
    const data: SimpleObject[] = this.$store
      ? this.$store.getters["network/materials"]
      : [];
    return data.filter(item => item.aspect == this.aspect);
  }
}
</script>

<style scoped>
.task-list {
  padding-left: 0;
}
.task-list li {
  display: inline-block;
  position: relative;
  padding-left: 25px;
  margin-right: 15px;
}
.task-list li:before {
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  content: "\26AB";
}
</style>
