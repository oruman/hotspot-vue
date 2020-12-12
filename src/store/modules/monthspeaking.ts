import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

@Module({ namespaced: true })
export class MonthSpeaking extends VuexModule {
  private cacheTime = 0;
  private _files: SimpleObject[] = [];

  get files() {
    return this._files;
  }

  @Mutation
  setCacheTime(time: number) {
    this.cacheTime = time;
  }

  @Mutation
  clearCache() {
    this._files = [];
    this.cacheTime = 0;
  }

  @Mutation
  setFiles(data: SimpleObject[]) {
    const newData: SimpleObject[] = [];
    for (const item of data) {
      const newItem: SimpleObject = {
        id: item.id,
        name: item.name,
        date: item.date
      };
      if (
        Object.prototype.hasOwnProperty.call(item, "metadata") &&
        Object.prototype.hasOwnProperty.call(item.metadata, "duration")
      )
        newItem.duration = item.metadata.duration;
      newData.push(newItem);
    }
    this._files = newData;
  }

  @Action
  async GET_DATA() {
    if (Date.now() < this.cacheTime) return;
    this.context.commit("setCacheTime", Date.now() + 3000);
    const promise = new Promise(resolve => {
      const tm = setInterval(() => {
        const tmp = this.context.rootGetters["state/studentId"];
        if (tmp) {
          clearInterval(tm);
          resolve(tmp);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(tm);
      }, 2000);
    });
    const studentId = await promise;
    this.context
      .dispatch(
        "network/GET_DATA",
        "homework/monspeaking/student/" + studentId,
        { root: true }
      )
      .then(response => {
        if (Object.prototype.hasOwnProperty.call(response, "files"))
          this.context.commit("setFiles", response.files);
      })
      .catch(() => {
        console.log("Month Speaking ERROR");
      });
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("clearCache");
  }
}
