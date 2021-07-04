<template>
  <v-layout>
    <v-flex>
      <v-container fluid>
        <v-btn
          fab
          tile
          dark
          fixed
          small
          @click="toggleMenu"
          class="d-lg-none"
          style="top: 58px; right: 2px;"
        >
          <v-icon>mdi-arrow-expand-left</v-icon>
        </v-btn>
        <h4 class="title text-uppercase">
          Homework
        </h4>
        <template v-for="(week, weekIndex) of dataForView">
          <v-card
            flat
            class="d-flex"
            :key="'week_header_' + weekIndex"
            ref="block-week"
          >
            <strong class="subtitle-1 text-uppercase wrap-header"
              >Week {{ weekIndex + 1 }}</strong
            >
            <v-spacer />
            <Mark :mark="week.mark" class="mb-1" />
            <v-spacer />
            <span class="wrap-header text-right text-uppercase">{{
              week.date
            }}</span>
          </v-card>
          <v-card
            :key="'week_data_' + weekIndex"
            class="mb-3"
            :class="week.mark ? 'marked' : ''"
          >
            <template v-for="(weekItem, weekItemIndex) of week.items">
              <v-card-title
                :key="'week_header_' + weekIndex + '_' + weekItemIndex"
              >
                {{ weekItem.theme }}
              </v-card-title>
              <v-card-text
                v-if="weekItem.tasks.length || weekItem.videos.length"
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
                <ul class="youtube-list">
                  <li
                    v-for="(video, videoIndex) of weekItem.videos"
                    :key="
                      ['week_video', weekIndex, weekItemIndex, videoIndex].join(
                        '_'
                      )
                    "
                  >
                    <a :href="video.link" target="_blank">{{ video.text }}</a>
                    <YoutubePreview :video-id="video.youtube" />
                  </li>
                </ul>
              </v-card-text>
              <v-divider
                v-if="weekItemIndex < week.items.length - 1"
                :key="'week_divider_' + weekIndex + '_' + weekItemIndex"
              />
            </template>
            <ReadOutLoud
              v-if="week.rol"
              v-bind:text="week.rol"
              v-bind:dead-line="week.deadLine"
              v-bind:week-num="weekIndex + 1"
            />
            <template v-if="week.tols">
              <ThinkOutLoud
                v-for="(tolItem, tolIndex) of week.tols"
                :key="['tols', weekIndex, tolIndex].join('_')"
                v-bind:text="tolItem"
                v-bind:week-num="weekIndex + 1"
                v-bind:day-num="tolIndex + 1"
                v-bind:dead-line="week.deadLine"
              />
            </template>
          </v-card>
        </template>
      </v-container>
    </v-flex>
    <v-flex :class="rightClass">
      <RightPanel
        v-bind:aspect="aspect"
        v-bind:keys="keys"
        v-bind:show-menu="isMenu"
      />
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";
import { Aspects, DATE_SHORT } from "@/data/data";
import moment from "moment";
import ReadOutLoud from "@/components/ReadOutLoud.vue";
import ThinkOutLoud from "@/components//ThinkOutLoud.vue";
import RightPanel from "@/components/RightPanel.vue";
import Mark from "@/components/Mark.vue";
import Utils from "@/helpers/util";
import YoutubePreview from "@/components/YoutubePreview.vue";
@Component({
  components: { YoutubePreview, Mark, ReadOutLoud, ThinkOutLoud, RightPanel }
})
export default class AspectView extends Vue {
  @Prop({ default: Aspects.GRAMMAR }) readonly aspect!: number;
  private delayToLesson = -2;
  private showMenu = false;
  private isScrolled = false;

  mounted() {
    this.$store.dispatch("grades/GET_DATA");
    this.$store.dispatch("lessons/GET_DATA");
    this.setScroll();
  }

  private get marks(): SimpleObject[] {
    const data = this.$store ? this.$store.getters["lessons/marks"] : [];
    return data.filter((el: SimpleObject) => el.aspect == this.aspect);
  }

  private get rols() {
    const arr: string[] = [];
    if (this.aspect !== Aspects.LISTENING) return arr;
    const source = this.$store ? this.$store.getters["grades/rols"] : [];
    for (const item of source) {
      if (!item.id || !item.te) continue;
      arr[item.id - 1] = item.te;
    }
    return arr;
  }

  private get tols() {
    const arr: string[][] = [];
    if (this.aspect !== Aspects.SPEAKING) return arr;
    const source = this.$store ? this.$store.getters["grades/tols"] : [];
    for (const item of source) {
      if (!item.id || !item.items) continue;
      arr[item.id] = item.items;
    }
    return arr;
  }

  private get keys() {
    const ret = [];
    if (
      this.dataForView.length &&
      this.dataForView[0] &&
      Object.prototype.hasOwnProperty.call(this.dataForView[0], "items")
    ) {
      for (const item of this.dataForView[0].items) {
        if (!Object.prototype.hasOwnProperty.call(item, "tasks")) continue;
        for (const task of item.tasks) ret.push(task);
      }
    }
    return ret;
  }

  private get dataForView() {
    const newData: SimpleObject[] = [];
    const data = this.$store ? this.$store.getters["grades/curriculum"] : [];
    let numWeek = 0;
    for (const items of data) {
      const newItem: SimpleObject[] = [];
      const dateNum = this.marks[numWeek]?.date || Date.now();
      const dateMomentum = moment(dateNum);
      for (const elOfItems of items) {
        if (elOfItems.aspect != this.aspect) continue;

        const theme: string[] = [];
        const tasks: SimpleObject[] = [];
        const videos: SimpleObject[] = [];

        for (const el of elOfItems.items) {
          if (el.link) {
            el.youtube = Utils.getYoutubeId(el.link);
            if (el.youtube) {
              videos.push(el);
            } else {
              tasks.push(el);
            }
          } else if (el.text) theme.push(el.text);
        }
        if (!theme.length) theme.push(elOfItems.title);
        newItem.push({
          theme: theme.join(" / "),
          tasks,
          videos
        });
      }
      const week: SimpleObject = {
        mark: this.marks[numWeek]?.mark || "",
        date: dateMomentum.format(DATE_SHORT),
        deadLine: dateMomentum.add(this.delayToLesson, "day").valueOf(),
        items: newItem
      };
      if (this.rols[numWeek]) week.rol = this.rols[numWeek];
      if (this.tols[numWeek]) week.tols = this.tols[numWeek];
      newData.push(week);
      numWeek++;
    }
    return newData;
  }

  @Watch("aspect")
  private updatedAspect(oldValue: number, newValue: number) {
    if (oldValue == 0 || oldValue === newValue) return;
    setTimeout(() => {
      this.isScrolled = false;
      this.setScroll();
    }, 500);
  }

  @Watch("marks")
  private setScroll() {
    if (!this.marks.length || this.isScrolled) return;
    if (!Object.keys(this.$refs).length) {
      setTimeout(this.setScroll.bind(this), 100);
      return;
    }
    this.isScrolled = true;

    let numActiveLesson = 0;
    const now = Date.now();
    for (let i = 0; i < this.marks.length; i++) {
      numActiveLesson = i;
      if (this.marks[i].date > now) break;
    }

    const els: Vue[] = this.$refs["block-week"] as Vue[];
    if (!els[numActiveLesson]) return;
    const el = els[numActiveLesson].$el as HTMLElement;
    if (el.offsetTop < 200 && el.offsetTop < window.innerHeight / 2) return;

    window.scrollTo({
      top: el.offsetTop,
      behavior: "smooth"
    });
  }

  //<editor-fold defaultstate="collapsed" desc="Work with menu">
  private get isRightAppend() {
    return this.$vuetify.breakpoint.lgAndUp;
  }

  private get isMenu() {
    return this.showMenu || this.isRightAppend;
  }

  private set isMenu(flag) {
    if (flag == this.isRightAppend) return;
    this.showMenu = flag;
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
  //</editor-fold>
}
</script>

<style scoped lang="scss">
@import "~vuetify/src/styles/settings/_variables";

.wrap-header {
  min-width: 85px;
}
.marked {
  background-color: #e6e6e6;
}

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

.youtube-list {
  padding-left: 0;
  display: grid;
  gap: 20px;
}
@media screen and (min-width: 960px) and (max-width: 1263px) {
  .youtube-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media screen and (min-width: 1464px) and (max-width: 1903px) {
  .youtube-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media screen and (min-width: 1904px) {
  .youtube-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

.youtube-list li {
  display: block;
  position: relative;
  width: 100%;
}

.right-panel-append {
  width: 256px;
  max-width: 256px;
  min-width: 256px;
}

.right-panel-append ::v-deep > aside {
  /* HACK */
  padding-top: 62px;
  transform: translateX(0%) !important;
  visibility: visible;
}

.right-panel-float {
  max-width: 0;
  min-width: 0;
}
</style>
