<template>
  <v-container fluid grid-list-xl>
    <v-expansion-panels class="mb-4">
      <v-expansion-panel>
        <v-expansion-panel-header>Rules</v-expansion-panel-header>
        <v-expansion-panel-content>
          <div v-html="rules" class="body-2"></div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <div class="text-center mb-2">
      <v-pagination v-model="step" :length="countStep"></v-pagination>
    </div>
    <v-card v-if="grammar.taskLink" class="mb-4">
      <v-card-title class="subtitle-1">
        Grammar
        <v-spacer />
        {{ getDeadline(step) }}
      </v-card-title>
      <v-divider />
      <v-card-text class="body-1">
        Task:
        <a :href="grammar.taskLink" target="_blank">{{ grammarTaskName }}</a>
        <template v-if="grammar.keyLink">
          <br />
          Key:
          <a :href="grammar.keyLink" target="_blank">{{ grammarKeyName }}</a>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          small
          v-if="grammarAnswer"
          :disabled="isLoading"
          @click.prevent="download(grammarAnswer)"
        >
          <v-icon>mdi-download</v-icon>
          Download
        </v-btn>
        <v-spacer />
        <v-btn
          text
          small
          v-if="grammarAnswer && !isDisabled"
          :disabled="isLoading"
          @click.prevent="remove(grammarAspect)"
        >
          <v-icon>mdi-close-thick</v-icon>
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-if="listening.taskLink" class="mb-4">
      <v-card-title class="subtitle-1">
        Listening
        <v-spacer />
        {{ getDeadline(step) }}
      </v-card-title>
      <v-divider />
      <v-card-text class="body-1">
        Task:
        <a :href="listening.taskLink" target="_blank">{{
          listeningTaskName
        }}</a>
        <template v-if="listening.keyLink">
          <br />
          Key:
          <a :href="listening.keyLink" target="_blank">
            {{ listeningKeyName }}
          </a>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          small
          v-if="listeningAnswer"
          @click.prevent="download(listeningAnswer)"
        >
          <v-icon>mdi-download</v-icon>
          Download
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-if="speaking.taskLink" class="mb-4">
      <v-card-title class="subtitle-1">
        Speaking
        <v-spacer />
        {{ getDeadline(step) }}
      </v-card-title>
      <v-divider />
      <v-card-text class="body-1">
        Task:
        <a :href="speaking.taskLink" target="_blank">{{ speakingTaskName }}</a>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          small
          v-if="speakingAnswer"
          @click.prevent="download(speakingAnswer)"
        >
          <v-icon>mdi-download</v-icon>
          Download
        </v-btn>
        <v-btn
          text
          small
          v-if="speakingAnswer"
          @click.prevent="play(speakingAnswer)"
        >
          <v-icon>mdi-play</v-icon>
          Play
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mapGetters } from "vuex";
import moment from "moment";
import Utils from "@/helpers/util";

@Component({
  computed: mapGetters(["isLoading"])
})
export default class HolidayHomework extends Vue {
  private step = 1;
  private readonly grammarAspect = 1;
  private readonly listeningAspect = 2;
  private readonly speakingAspect = 2;

  mounted() {
    this.$store.dispatch("holidays/GET_DATA");
    this.$store.dispatch("grades/GET_DATA");
    this.$store.dispatch("students/GET_DATA");
  }

  private get deadlines(): Date[] {
    return this.$store ? this.$store.getters["holidays/deadlines"] : [];
  }

  private get rules() {
    if (!this.$store) return "";
    let rules = this.$store.getters["holidays/rules"];
    if (rules) {
      let i = 0;
      rules = rules.replace(/Task \d -.*\n/gm, () => {
        i++;
        return "Task " + i + " - Deadline: " + this.getDeadline(i) + "\n";
      });
    }
    return Utils.nl2br(rules);
  }

  private get tasks(): SimpleObject[] {
    return this.$store ? this.$store.getters["network/holidays"] : [];
  }

  private get answers(): SimpleObject[] {
    return this.$store ? this.$store.getters["holidays/answers"] : [];
  }

  private get countStep() {
    let ret = 1;
    for (let i = 0; i < this.tasks.length; i++)
      ret = Math.max(ret, this.tasks[i].taskIndex);
    return ret;
  }

  private getTaskAspect(aspect: number) {
    const els = this.tasks.find(item => {
      return item.taskIndex == this.step && item.aspectId == aspect;
    });
    return els ? els : {};
  }

  private getAnswerAspect(aspect: number) {
    const els = this.answers.find(item => {
      return item.taskIndex == this.step && item.aspectId == aspect;
    });
    return els && Object.prototype.hasOwnProperty.call(els, "answer")
      ? els.answer
      : 0;
  }

  private get grammar() {
    return this.getTaskAspect(this.grammarAspect);
  }

  private get grammarTaskName() {
    return this.grammar?.task?.name;
  }

  private get grammarKeyName() {
    return this.grammar?.key?.name;
  }

  private get grammarAnswer() {
    return this.getAnswerAspect(this.grammarAspect);
  }

  private get listening() {
    return this.getTaskAspect(this.listeningAspect);
  }

  private get listeningTaskName() {
    return this.listening?.task?.name;
  }

  private get listeningKeyName() {
    return this.listening?.key?.name;
  }

  private get listeningAnswer() {
    return this.getAnswerAspect(this.listeningAspect);
  }

  private get speaking() {
    return this.getTaskAspect(this.speakingAspect);
  }

  private get speakingTaskName() {
    return this.speaking?.task?.name;
  }

  private get speakingAnswer() {
    return this.getAnswerAspect(this.speakingAspect);
  }

  private getDeadline(num: number) {
    num--;
    if (!this.deadlines[num]) return "N/A";
    return moment(this.deadlines[num]).format("YYYY-MM-DD HH:mm");
  }

  private get isDisabled() {
    const num = this.step - 1;
    return this.deadlines[num]
      ? this.deadlines[num].valueOf() < Date.now()
      : true;
  }

  private download(fileId: number) {
    this.$store.dispatch("network/GET_LINK_INFO", fileId).then(info => {
      if (!info.link) return;
      Utils.downloadURL(info.link, info.name);
    });
  }

  private play(fileId: number) {
    const name = "Holiday Homework Speaking - Task #" + this.step;
    this.$store.dispatch("network/GET_LINK_INFO", fileId).then(info => {
      if (!info.link) return;
      const obj = {
        name: name,
        link: info.link,
        duration: 0
      };
      if (Object.prototype.hasOwnProperty.call(info, "duration"))
        obj.duration = info.duration;
      this.$store.dispatch("audio/SET_DATA", obj);
    });
  }

  private upload(aspect: number) {
    /*const accept = aspect == this.speakingAspect ? "audio/*" : "image/*";
    Utils.chooseFile(accept).then(result => {
      const data: SimpleObject = {};
      data.file = result;
      data.aspect = aspect;
      data.index = this.step;
      this.$store.dispatch("network/UPLOAD_TOL", data);
    });*/
    return;
  }

  private remove(aspect: number) {
    if (!confirm("Are you sure you want to delete this file?")) return;
    this.$store.dispatch("network/DELETE_HOLIDAY_HOMEWORK", {
      aspect: aspect,
      index: this.step
    });
  }
}
</script>
