import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

@Module({ namespaced: true })
export class Youtube extends VuexModule {
  private _youtubeId = "";

  get id() {
    return this._youtubeId;
  }

  @Mutation
  setId(payloads: string) {
    this._youtubeId = payloads;
  }

  @Action
  SET_ID(payloads: string) {
    if (this._youtubeId !== payloads) {
      this.context.commit("setId", payloads);
    }
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("setId", "");
  }
}
