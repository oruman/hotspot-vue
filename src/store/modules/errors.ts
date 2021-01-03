import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

@Module({ namespaced: true })
export class Errors extends VuexModule {
  private message = "";

  get last() {
    return this.message;
  }

  @Mutation
  setMessage(payloads: string) {
    this.message = payloads;
  }

  @Action
  ADD(payloads: string) {
    this.context.commit("setMessage", payloads);
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("setMessage", "");
  }
}
