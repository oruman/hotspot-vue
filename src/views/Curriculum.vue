<template>
  <v-container fluid grid-list-xl>
    <Tabs v-on:emit-change-tab="changeTab"></Tabs>
    <v-row>
      <v-col
        cols="12"
        v-for="(week_item, week_index) in dataForView"
        :key="week_index"
      >
        <v-card>
          <v-list>
            <v-subheader v-bind:key="week_index">
              Week #{{ week_index + 1 }}
              <v-spacer />
              <v-chip
                :color="colorClassForMark(lessonMark[activeTab][week_index])"
                v-if="lessonMark[activeTab][week_index]"
              >
                {{ lessonMark[activeTab][week_index] }}
              </v-chip>
              <v-spacer />
              {{ getDate(week_index) }}
            </v-subheader>
            <template v-for="(part, part_index) in week_item">
              <v-divider v-bind:key="['d', week_index, part_index].join('_')" />
              <v-list-item v-bind:key="['i', week_index, part_index].join('_')">
                <v-list-item-content>
                  <v-list-item-title
                    v-html="part.title"
                    v-if="part.title"
                  ></v-list-item-title>
                  <template v-for="(item, item_index) in part.items">
                    <v-list-item-subtitle
                      class="wrap-normal"
                      v-if="item.link"
                      v-bind:key="
                        ['l', week_index, part_index, item_index].join('_')
                      "
                    >
                      <a
                        v-bind:href="item.link"
                        target="_blank"
                        v-html="item.text"
                      ></a>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                      class="wrap-normal"
                      v-else
                      v-html="item.text"
                      v-bind:key="
                        ['c', week_index, part_index, item_index].join('_')
                      "
                    ></v-list-item-subtitle>
                  </template>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Tabs from "@/components/Tabs.vue";
import moment from "moment";
import {DATE_SHORT} from "@/data/data";

@Component({
  components: { Tabs }
})
export default class Curriculum extends Vue {
  private activeTab = 1;

  private colors: SimpleObject = {
    "+": "success",
    "+/-": "warning",
    "-": "error",
    H: "info"
  };

  mounted() {
    this.$store.dispatch("grades/GET_DATA");
    this.$store.dispatch("lessons/GET_DATA");
  }

  private get marks() {
    return this.$store ? this.$store.getters["lessons/marks"] : [];
  }

  private get dataForView() {
    const newData = [];
    const data = this.$store ? this.$store.getters["grades/curriculum"] : [];
    for (const items of data) {
      newData.push(
        items.filter((item: SimpleObject) => item.aspect == this.activeTab)
      );
    }
    return newData;
  }

  private changeTab(tabId: number) {
    this.activeTab = tabId;
  }

  private getDate(num: number) {
    if (
      !Object.prototype.hasOwnProperty.call(this.lessonsDate, this.activeTab) ||
      num < 0 ||
      num >= this.lessonsDate[this.activeTab].length ||
      !this.lessonsDate[this.activeTab][num]
    )
      return "";
    return moment(this.lessonsDate[this.activeTab][num]).format(DATE_SHORT);
  }

  private get lessonsDate() {
    const newData: SimpleObject = {};
    for (const item of this.marks) {
      if (!Object.prototype.hasOwnProperty.call(newData, item.aspect))
        newData[item.aspect] = [];
      newData[item.aspect].push(item.date);
    }
    return newData;
  }

  private get lessonMark() {
    const newData: SimpleObject = {};
    for (const item of this.marks) {
      if (!Object.prototype.hasOwnProperty.call(newData, item.aspect))
        newData[item.aspect] = [];
      newData[item.aspect].push(item.mark);
    }
    return newData;
  }

  private colorClassForMark(mark: string) {
    return Object.prototype.hasOwnProperty.call(this.colors, mark)
      ? this.colors[mark]
      : "";
  }
}
</script>

<style scoped lang="scss">
::v-deep .wrap-normal {
  white-space: normal;
}
</style>
