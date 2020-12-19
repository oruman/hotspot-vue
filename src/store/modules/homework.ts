import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

@Module({ namespaced: true })
export class Homework extends VuexModule {
  private _data: SimpleObject[] = [];
  private cacheTime = 0;

  get speaking() {
    return this._data.filter(item => item.hwkind == 2);
  }

  get listening() {
    return this._data.filter(item => item.hwkind == 3);
  }

  @Mutation
  setCacheTime(time: number) {
    this.cacheTime = time;
  }

  @Mutation
  clearCache() {
    this._data = [];
    this.cacheTime = 0;
  }

  @Mutation
  setData(payloads: SimpleObject[]) {
    this._data = payloads.sort((a, b) => a.date_index - b.date_index);
  }

  @Mutation
  updateData(payloads: SimpleObject) {
    if (!Object.prototype.hasOwnProperty.call(payloads, "id")) return;
    const id = payloads.id;
    const index = this._data.findIndex(item => item.id == id);
    if (index >= 0) this._data[0] = payloads;
    else this._data.push(payloads);
  }

  @Action
  GET_DATA() {
    if (Date.now() < this.cacheTime) return;
    this.context.commit("setCacheTime", Date.now() + 500);
    this.context
      .dispatch("network/GET_DATA", "homework/speaking", { root: true })
      .then(response => {
        this.context.commit("setData", response);
      })
      .catch(() => {
        console.log("HomeWork ERROR");
      });
  }

  @Action
  UPDATE_DATA(payloads: SimpleObject) {
    this.context.commit("updateData", payloads);
    this.context.dispatch("GET_DATA_WITHOUT_CACHE");
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
