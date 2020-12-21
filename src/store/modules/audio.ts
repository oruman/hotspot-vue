import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { Vue } from "vue-property-decorator";

@Module({ namespaced: true })
export class Audio extends VuexModule {
  private _audioData: SimpleObject = {};
  private _recordData: SimpleObject = {};

  get data() {
    return this._audioData;
  }

  get recordData() {
    return this._recordData;
  }

  @Mutation
  setData(payloads: SimpleObject) {
    this._audioData = payloads;
  }

  @Mutation
  setDuration(payloads: number) {
    Vue.set(this._audioData, "duration", payloads);
  }

  @Mutation
  setRecordData(payloads: SimpleObject) {
    this._recordData = payloads;
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
  SET_RECORD(payloads: SimpleObject) {
    this.context.commit("setRecordData", payloads);
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("setData", {});
    this.context.commit("setRecordData", {});
  }
}
