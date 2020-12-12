import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import axios, { AxiosResponse } from "axios";
import Vue from "vue";

@Module({ namespaced: true })
export class Network extends VuexModule {
  private _url = process.env.VUE_APP_API_URL;
  private loadingCount = 0;
  private logged = true;
  private _files: SimpleObject = {};

  public get loading() {
    return this.loadingCount > 0;
  }

  public get isLogged() {
    return this.logged;
  }

  public get files() {
    return Object.values(this._files);
  }

  public get url() {
    return this._url;
  }

  @Mutation
  increaseLoadingCount() {
    this.loadingCount++;
  }

  @Mutation
  decreaseLoadingCount() {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
  }

  @Mutation
  setLogged() {
    this.logged = true;
  }

  @Mutation
  setUnLogged() {
    this.logged = false;
  }

  @Mutation
  clearCache() {
    this._files = {};
  }

  @Mutation
  setFiles(files: SimpleObject[]) {
    for (const file of files) {
      if (
        !Object.prototype.hasOwnProperty.call(file, "id") ||
        !Object.prototype.hasOwnProperty.call(file, "aspect")
      )
        continue;
      const newItem: SimpleObject = {
        id: file.id,
        name: file.name,
        aspect: file.aspect
      };
      newItem.link =
        this._url +
        "file/" +
        file.id +
        "/view/" +
        encodeURIComponent(file.name);
      newItem.fileKey = file.metadata?.gradeInfo?.filesKey;
      Vue.set(this._files, file.id, newItem);
    }
  }

  @Action({ rawError: true })
  public async LOGIN(payloads: SimpleObject = {}) {
    this.context.commit("increaseLoadingCount");
    return await axios
      .post(this._url + "login", JSON.stringify(payloads), {
        withCredentials: true,
        headers: {
          "Content-type": "application/json"
        }
      })
      .then((res: AxiosResponse) => {
        if (Object.prototype.hasOwnProperty.call(res, "data")) {
          if (Object.prototype.hasOwnProperty.call(res.data, "user"))
            this.context.dispatch("state/SET_DATA", res.data.user, {
              root: true
            });
          if (
            Object.prototype.hasOwnProperty.call(res.data, "sessionId") &&
            res.data.sessionId
          )
            this.context.commit("setLogged");
        }
        return Promise.resolve(res);
      })
      .finally(() => {
        this.context.commit("decreaseLoadingCount");
      });
  }

  @Action
  public async LOGOUT() {
    this.context.commit("increaseLoadingCount");
    return await axios
      .post(this._url + "logout", {
        withCredentials: true
      })
      .catch(() => {
        return Promise.resolve();
      })
      .finally(() => {
        this.context.commit("decreaseLoadingCount");
        this.context.commit("setUnLogged");
        this.context.dispatch("CLEAR_CACHE", {}, { root: true });
      });
  }

  @Action
  public GET_DATA(payloads: string) {
    this.context.commit("increaseLoadingCount");
    return axios
      .get(this._url + payloads, {
        withCredentials: true
      })
      .then((res: AxiosResponse) => {
        if (Object.prototype.hasOwnProperty.call(res, "data"))
          return Promise.resolve(res.data);
        return Promise.reject("N/A");
      })
      .catch(err => {
        const status = err.response.status;
        if (status == 401) this.context.commit("setUnLogged", {});
        else if (status == 426 && err.response.data)
          return Promise.resolve(err.response.data);
        return Promise.reject(err);
      })
      .finally(() => {
        this.context.commit("decreaseLoadingCount");
      });
  }

  @Action
  async GET_FILES(payloads: SimpleObject) {
    const ids: SimpleObject = {};
    for (const key in payloads) {
      if (!Object.prototype.hasOwnProperty.call(payloads, key)) continue;
      const aspect: string = key[0];
      for (let i = 0; i < payloads[key].length; i++) {
        const fileId = payloads[key][i];
        if (Object.prototype.hasOwnProperty.call(this._files, fileId)) continue;
        ids[fileId] = aspect;
      }
    }
    const valuesIds = Object.keys(ids);
    if (!valuesIds.length) return;
    this.context.commit("increaseLoadingCount");
    return await axios
      .post(
        this._url + "file/ids?ignoreTracking=true",
        JSON.stringify({ ids: valuesIds }),
        {
          withCredentials: true,
          headers: {
            "Content-type": "application/json"
          }
        }
      )
      .then((res: AxiosResponse) => {
        if (!Object.prototype.hasOwnProperty.call(res, "data"))
          return Promise.reject("N/A");
        const data: SimpleObject[] = res.data;
        for (let i = 0; i < data.length; i++) {
          if (
            !Object.prototype.hasOwnProperty.call(data[i], "id") ||
            !Object.prototype.hasOwnProperty.call(ids, data[i].id)
          )
            continue;
          data[i].aspect = ids[data[i].id];
        }
        if (data.length) this.context.commit("setFiles", data);
      })
      .catch(err => {
        if (err.response.status == 401) this.context.commit("setUnLogged", {});
      })
      .finally(() => {
        this.context.commit("decreaseLoadingCount");
      });
  }

  @Action
  GET_LINK(fileId: number) {
    return axios
      .get(this._url + "file/" + fileId + "/link", {
        withCredentials: true
      })
      .catch(err => {
        if (err.response.data && err.response.status == 500)
          return Promise.resolve(err.response);
        else {
          if (err.response.status == 401)
            this.context.commit("setUnLogged", {});
          return Promise.reject(err);
        }
      })
      .then((res: AxiosResponse) => {
        if (
          Object.prototype.hasOwnProperty.call(res.data, "link") &&
          Object.prototype.hasOwnProperty.call(res.data.link, "url")
        )
          return Promise.resolve(res.data.link.url);
        else if (Object.prototype.hasOwnProperty.call(res.data, "url"))
          return Promise.resolve(res.data.url);
        else return Promise.reject("");
      });
  }

  @Action
  GET_LINK_INFO(fileId: number) {
    return axios
      .get(this._url + "file/" + fileId + "/link", {
        withCredentials: true
      })
      .catch(err => {
        if (err.response.data && err.response.status == 500)
          return Promise.resolve(err.response);
        else {
          if (err.response.status == 401)
            this.context.commit("setUnLogged", {});
          return Promise.reject(err);
        }
      })
      .then((res: AxiosResponse) => {
        if (
          Object.prototype.hasOwnProperty.call(res.data, "name") &&
          Object.prototype.hasOwnProperty.call(res.data, "link") &&
          Object.prototype.hasOwnProperty.call(res.data.link, "url")
        )
          return Promise.resolve({
            name: res.data.name,
            link: res.data.link.url
          });
        else if (Object.prototype.hasOwnProperty.call(res.data, "url"))
          return Promise.resolve({
            name: "",
            link: res.data.url
          });
        else return Promise.reject("");
      });
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("clearCache");
  }
}
