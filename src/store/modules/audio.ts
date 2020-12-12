import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { Vue } from "vue-property-decorator";

@Module({ namespaced: true })
export class Audio extends VuexModule {
  private _audioData:SimpleObject = {};

  get data() {
    return this._audioData;
  }

  @Mutation
  setData(payloads: SimpleObject) {
    this._audioData = payloads;
  }

  @Mutation
  setDuration(payloads: number) {
    Vue.set(this._audioData, "duration", payloads);
  }

  @Action
  SET_DATA(payloads: SimpleObject) {
    this.context.commit("setData", payloads);
  }

  @Action
  SET_DURATION(payloads: number) {
    this.context.commit("setDuration", payloads);
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("setData", {});
  }
}
