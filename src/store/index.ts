import Vue from "vue";
import Vuex from "vuex";
import { Network } from "@/store/modules/network";
import { Lessons } from "@/store/modules/lessons";
import { State } from "@/store/modules/state";
import { Grades } from "@/store/modules/grades";
import { Groups } from "@/store/modules/groups";
import { Students } from "@/store/modules/students";
import { MonthSpeaking } from "@/store/modules/monthspeaking";
import { Audio } from "@/store/modules/audio";
import { Homework } from "@/store/modules/homework";
import { Holidays } from "@/store/modules/holidays";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {
    CLEAR_CACHE(contex) {
      contex.dispatch("network/CLEAR_CACHE");
      contex.dispatch("lessons/CLEAR_CACHE");
      contex.dispatch("state/CLEAR_CACHE");
      contex.dispatch("grades/CLEAR_CACHE");
      contex.dispatch("groups/CLEAR_CACHE");
      contex.dispatch("students/CLEAR_CACHE");
      contex.dispatch("monspeaking/CLEAR_CACHE");
      contex.dispatch("audio/CLEAR_CACHE");
      contex.dispatch("homework/CLEAR_CACHE");
    }
  },
  getters: {
    isLogged(state, getters) {
      return getters["network/isLogged"];
    },
    isLoading(state, getters) {
      return getters["network/loading"];
    }
  },
  modules: {
    network: Network,
    lessons: Lessons,
    state: State,
    grades: Grades,
    groups: Groups,
    students: Students,
    monspeaking: MonthSpeaking,
    audio: Audio,
    homework: Homework,
    holidays: Holidays
  }
});
