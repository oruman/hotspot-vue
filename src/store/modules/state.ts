import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

@Module({ namespaced: true })
export class State extends VuexModule {
  private cacheTime = 0;
  private _avatar = "";
  private _name = "";
  private _email = "";
  private _studentId = 0;

  get avatar() {
    return this._avatar;
  }

  get name() {
    return this._name;
  }

  get email() {
    return this._email;
  }

  get studentId() {
    return this._studentId;
  }

  @Mutation
  setCacheTime(time: number) {
    this.cacheTime = time;
  }

  @Mutation
  clearCache() {
    this._avatar = "";
    this._name = "";
    this._studentId = 0;
    this.cacheTime = 0;
  }

  @Mutation
  setData(payloads: SimpleObject) {
    if (Object.prototype.hasOwnProperty.call(payloads, "avatar"))
      this._avatar = payloads.avatar;
    if (Object.prototype.hasOwnProperty.call(payloads, "name"))
      this._name = payloads.name;
    if (Object.prototype.hasOwnProperty.call(payloads, "email"))
      this._email = payloads.email;
    if (Object.prototype.hasOwnProperty.call(payloads, "student_id"))
      this._studentId = payloads.student_id;
    this.cacheTime = Date.now() + 10 * 60 * 1000;
  }

  @Action
  GET_DATA() {
    if (Date.now() < this.cacheTime) return;
    this.context.commit("setCacheTime", Date.now() + 500);
    this.context
      .dispatch("network/GET_DATA", "state", { root: true })
      .then(response => {
        if (
          Object.prototype.hasOwnProperty.call(response, "state") &&
          Object.prototype.hasOwnProperty.call(response.state, "user")
        )
          this.context.commit("setData", response.state.user);
        else return Promise.reject("N/A");
      })
      .catch(() => {
        console.log("State ERROR");
      });
  }

  @Action
  SET_DATA(payloads: SimpleObject) {
    this.context.commit("setData", payloads);
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("clearCache");
  }
}
