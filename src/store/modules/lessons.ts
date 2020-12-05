import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

@Module({ namespaced: true })
export class Lessons extends VuexModule {
  private _marks: SimpleObject[] = [];
  private _tests: SimpleObject[] = [];
  private _tols: SimpleObject[] = [];
  private cacheTime = 0;

  get marks() {
    return this._marks;
  }

  get tests() {
    return this._tests;
  }

  get tols() {
    return this._tols;
  }

  @Mutation
  setMarks(marks: SimpleObject[]) {
    this._marks = marks;
  }

  @Mutation
  setTests(tests: SimpleObject[]) {
    this._tests = tests;
  }

  @Mutation
  setCacheTime(time: number) {
    this.cacheTime = time;
  }

  @Mutation
  clearCache() {
    this._marks = [];
    this._tests = [];
    this._tols = [];
    this.cacheTime = 0;
  }

  @Action
  GET_DATA() {
    if (Date.now() < this.cacheTime) return;
    this.context.commit("setCacheTime", Date.now() + 500);
    this.context
      .dispatch("network/GET_DATA", "lessons", { root: true })
      .then(response => {
        const marks = [];
        const tests = [];
        response.sort((a: SimpleObject, b: SimpleObject) => a.date - b.date);
        for (const item of response as SimpleObject[]) {
          const dt = parseInt(item.date, 10);
          const tmpMarks = Object.values(item.marks);
          marks.push({
            date: dt,
            aspect: item.aspect,
            mark: tmpMarks.length > 0 ? tmpMarks[0] : ""
          });
          if (item.is_test) {
            const tmpTests = Object.values(item.test_marks);
            tests.push({
              date: dt,
              aspect: item.aspect,
              score: tmpTests.length > 0 ? tmpTests[0] : 0
            });
          }
        }
        this.context.commit("setMarks", marks);
        this.context.commit("setTests", tests);
        this.context.commit("setCacheTime", Date.now() + 10 * 60 * 1000);
      })
      .catch(() => {
        console.log("Lessons ERROR");
      });
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("clearCache");
  }
}
