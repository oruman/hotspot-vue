import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { Vue } from "vue-property-decorator";

@Module({ namespaced: true })
export class Students extends VuexModule {
  private _list: SimpleObject = {};
  private cacheTime = 0;

  @Mutation
  setCacheTime(time: number) {
    this.cacheTime = time;
  }

  @Mutation
  clearCache() {
    this._list = {};
    this.cacheTime = 0;
  }

  @Mutation
  setList(data: SimpleObject[]) {
    for (const item of data) {
      if (
        Object.prototype.hasOwnProperty.call(item, "id") &&
        Object.prototype.hasOwnProperty.call(item, "name")
      )
        Vue.set(this._list, item.id, item.name);
    }
  }

  get list() {
    return this._list;
  }

  @Action
  GET_DATA() {
    if (Date.now() < this.cacheTime) return;
    this.context.commit("setCacheTime", Date.now() + 500);
    this.context
      .dispatch("network/GET_DATA", "students", { root: true })
      .then(response => {
        this.context.commit("setList", response);
        const item = response.find((el: SimpleObject) => {
          return (
            Object.prototype.hasOwnProperty.call(el, "hhw") &&
            Object.prototype.hasOwnProperty.call(el.hhw, "answers")
          );
        });
        if (item)
          this.context.dispatch("holidays/SET_ANSWERS", item.hhw.answers, {
            root: true
          });
        this.context.commit("setCacheTime", Date.now() + 12 * 60 * 60 * 1000);
      })
      .catch(() => {
        console.log("Students ERROR");
      });
  }

  @Action
  GET_DATA_WITHOUT_CACHE() {
    this.context.commit("setCacheTime", 0);
    return this.context.dispatch("GET_DATA");
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("clearCache");
  }
}
