<template>
  <v-layout>
    <v-flex>
      <v-container fluid>
        <h4 class="title text-uppercase">
          Homework
          <v-icon @click="toggleMenu" style="float: right" class="d-lg-none"
            >mdi-arrow-expand-left</v-icon
          >
        </h4>
        <template v-for="(week, weekIndex) of dataForView">
          <v-card flat class="d-flex" :key="'week_header_' + weekIndex">
            <strong class="subtitle-1 text-uppercase"
              >Week {{ weekIndex + 1 }}</strong
            >
            <v-spacer />
            <span>{{ dates[weekIndex] }}</span>
          </v-card>
          <v-card :key="'week_data_' + weekIndex" class="mb-3">
            <template v-for="(weekItem, weekItemIndex) of week">
              <v-card-title
                :key="'week_header_' + weekIndex + '_' + weekItemIndex"
              >
                {{ weekItem.theme }}
              </v-card-title>
              <v-card-text
                v-if="weekItem.tasks.length"
                :key="'week_tasks_' + weekIndex + '_' + weekItemIndex"
              >
                <ul class="task-list">
                  <li
                    v-for="(task, taskIndex) of weekItem.tasks"
                    :key="
                      ['week_task', weekIndex, weekItemIndex, taskIndex].join(
                        '_'
                      )
                    "
                  >
                    <a :href="task.link" target="_blank">{{ task.text }}</a>
                  </li>
                </ul>
              </v-card-text>
              <v-divider
                v-if="weekItemIndex < week.length - 1"
                :key="'week_divider_' + weekIndex + '_' + weekItemIndex"
              />
            </template>
          </v-card>
        </template>
      </v-container>
    </v-flex>
    <v-flex :class="rightClass">
      <v-navigation-drawer fixed right clipped v-model="isMenu">
        <v-list dense>
          <template v-if="keys">
            <v-list-item-title
              class="text-uppercase text-center text-h5 font-weight-bold"
              >Keys</v-list-item-title
            >
            <v-list-item
              dark
              v-for="(task, taskIndex) in keys"
              :key="'task_' + taskIndex"
            >
              <v-sheet class="pa-2 mb-2 rounded" color="#e0e0e0" width="100%">
                <a :href="task.link" target="_blank">{{ task.text }}</a>
              </v-sheet>
            </v-list-item>
          </template>
          <template v-if="materials.length">
            <v-list-item-title
              class="text-uppercase text-center text-h5 font-weight-bold"
              >Materials</v-list-item-title
            >
            <v-list-item
              dark
              v-for="(material, materialIndex) in materials"
              :key="'material_' + materialIndex"
            >
              <v-sheet class="pa-2 mb-2 rounded" color="#e0e0e0">
                <a
                  :href="material.link"
                  target="_blank"
                  v-text="material.name"
                ></a>
              </v-sheet>
            </v-list-item>
          </template>
        </v-list>
      </v-navigation-drawer>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Aspects } from "@/data/data";
import moment from "moment";

@Component
export default class AspectView extends Vue {
  @Prop({ default: Aspects.GRAMMAR }) readonly aspect!: number;
  private showMenu = false;

  mounted() {
    this.$store.dispatch("grades/GET_DATA");
    this.$store.dispatch("lessons/GET_DATA");
  }

  private get isMenu() {
    return this.showMenu || this.isRightAppend;
  }

  private set isMenu(flag) {
    if (flag == this.isRightAppend) return;
    this.showMenu = flag;
  }

  private get isRightAppend() {
    return this.$vuetify.breakpoint.lgAndUp;
  }

  private get rightClass() {
    return this.isRightAppend ? ["right-panel-append"] : ["right-panel-float"];
  }

  private toggleMenu() {
    // TODO: Fix Hack
    this.showMenu = false;
    setTimeout(() => {
      this.showMenu = true;
    }, 100);
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
    const ret = [];
    if (this.dataForView.length && this.dataForView[0]) {
      for (const item of this.dataForView[0]) {
        if (!Object.prototype.hasOwnProperty.call(item, "tasks")) continue;
        for (const task of item.tasks) ret.push(task);
      }
    }
    return ret;
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
        if (!theme.length) theme.push(elOfItems.title);
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

.right-panel-append {
  width: 256px;
  max-width: 256px;
}

.right-panel-append ::v-deep > aside {
  /* HACK */
  padding-top: 62px;
  transform: translateX(0%) !important;
  visibility: visible;
}

.right-panel-float {
  max-width: 0;
}
</style>
