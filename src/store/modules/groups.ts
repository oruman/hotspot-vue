import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

@Module({ namespaced: true })
export class Groups extends VuexModule {
  private _averageMarks: SimpleObject[] = [];
  private cacheTime = 0;

  @Mutation
  setCacheTime(time: number) {
    this.cacheTime = time;
  }

  @Mutation
  clearCache() {
    this._averageMarks = [];
    this.cacheTime = 0;
  }

  @Mutation
  setAverageMarks(data: SimpleObject) {
    if (!Object.prototype.hasOwnProperty.call(data, "count")) return;
    const newData: SimpleObject[] = [];
    for (let i = 0; i < data.count; i++) {
      if (!Object.prototype.hasOwnProperty.call(data, i)) continue;
      newData.push(data[i]);
    }
    this._averageMarks = newData;
  }

  get averageMarks() {
    return this._averageMarks;
  }

  @Action
  GET_DATA() {
    if (Date.now() < this.cacheTime) return;
    this.context.commit("setCacheTime", Date.now() + 500);
    this.context
      .dispatch("network/GET_DATA", "groups", { root: true })
      .then(response => {
        if (!response || !Array.isArray(response) || !response.length)
          return Promise.reject("N/A");
        const res = response[0];
        if (
          Object.prototype.hasOwnProperty.call(res, "average_marks") &&
          Object.prototype.hasOwnProperty.call(res.average_marks, "byMonth")
        )
          this.context.commit("setAverageMarks", res.average_marks.byMonth);
        this.context.commit("setCacheTime", Date.now() + 30 * 60 * 1000);
      })
      .catch(() => {
        console.log("Groups ERROR");
      });
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("clearCache");
  }
}
