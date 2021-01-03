import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

@Module({ namespaced: true })
export class Holidays extends VuexModule {
  private cacheTime = 0;
  private _deadlines: Date[] = [];
  private _rules = "";
  private _answers: SimpleObject[] = [];

  get deadlines() {
    return this._deadlines;
  }

  get rules() {
    return this._rules;
  }

  get answers() {
    return this._answers;
  }

  @Mutation
  setCacheTime(time: number) {
    this.cacheTime = time;
  }

  @Mutation
  clearCache() {
    this._deadlines = [];
    this._rules = "";
    this._answers = [];
    this.cacheTime = 0;
  }

  @Mutation
  setData(payloads: SimpleObject) {
    const deadlines: Date[] = [];
    if (
      Object.prototype.hasOwnProperty.call(payloads, "holidaysInfo") &&
      Object.prototype.hasOwnProperty.call(payloads.holidaysInfo, "hhw") &&
      Object.prototype.hasOwnProperty.call(payloads.holidaysInfo.hhw, "tasks")
    ) {
      for (const key in payloads.holidaysInfo.hhw.tasks) {
        if (
          Object.prototype.hasOwnProperty.call(
            payloads.holidaysInfo.hhw.tasks,
            key
          ) &&
          Object.prototype.hasOwnProperty.call(
            payloads.holidaysInfo.hhw.tasks[key],
            "deadline"
          )
        ) {
          const dt = new Date(payloads.holidaysInfo.hhw.tasks[key].deadline);
          deadlines.push(dt);
        }
      }
    }
    if (deadlines.length) this._deadlines = deadlines;
    if (
      Object.prototype.hasOwnProperty.call(payloads, "hhwRules") &&
      Object.prototype.hasOwnProperty.call(payloads.hhwRules, "description")
    ) {
      this._rules = payloads.hhwRules.description;
    }
  }

  @Mutation
  setAnswers(payloads: SimpleObject[]) {
    this._answers = payloads;
  }

  @Action
  GET_DATA() {
    if (Date.now() < this.cacheTime) return;
    this.context.commit("setCacheTime", Date.now() + 500);
    this.context
      .dispatch("network/GET_DATA", "settings", { root: true })
      .then(response => {
        this.context.commit("setData", response);
        this.context.commit("setCacheTime", Date.now() + 12 * 60 * 60 * 1000);
      })
      .catch(() => {
        console.log("Holidays ERROR");
      });
  }

  @Action
  SET_ANSWERS(payloads: SimpleObject[]) {
    //console.log(payloads);
    this.context.commit("setAnswers", payloads);
  }
}
