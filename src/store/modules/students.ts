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
        this.context.commit("setCacheTime", Date.now() + 12 * 60 * 60 * 1000);
      })
      .catch(() => {
        console.log("Students ERROR");
      });
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("clearCache");
  }
}
