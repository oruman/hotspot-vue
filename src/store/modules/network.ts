import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import axios, { AxiosResponse } from "axios";

@Module({ namespaced: true })
export class Network extends VuexModule {
  private _url = process.env.VUE_APP_API_URL;
  private loadingCount = 0;
  private logged = true;
  private _materials: SimpleObject[] = [];
  private _holidays: SimpleObject[] = [];

  public get loading() {
    return this.loadingCount > 0;
  }

  public get isLogged() {
    return this.logged;
  }

  public get materials() {
    return this._materials;
  }

  public get holidays() {
    return this._holidays;
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
    this._materials = [];
    this._holidays = [];
  }

  @Mutation
  setMaterials(files: SimpleObject[]) {
    const data: SimpleObject[] = [];
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
      data.push(newItem);
    }
    this._materials = data;
  }

  @Mutation
  setHolidays(files: SimpleObject[]) {
    const data: SimpleObject[] = [];
    for (const file of files) {
      if (
        !Object.prototype.hasOwnProperty.call(file, "task") ||
        !Object.prototype.hasOwnProperty.call(file.task, "id") ||
        !Object.prototype.hasOwnProperty.call(file.task, "name")
      )
        continue;
      file.taskLink =
        this._url +
        "file/" +
        file.task.id +
        "/view/" +
        encodeURIComponent(file.task.name);
      file.taskFileId = file.task.metadata?.gradeInfo?.filesKey;
      if (
        Object.prototype.hasOwnProperty.call(file, "key") &&
        Object.prototype.hasOwnProperty.call(file.key, "id") &&
        Object.prototype.hasOwnProperty.call(file.key, "name")
      ) {
        file.keyLink =
          this._url +
          "file/" +
          file.key.id +
          "/view/" +
          encodeURIComponent(file.key.name);
        file.keyFileId = file.key.metadata?.gradeInfo?.filesKey;
      }
      data.push(file);
    }
    this._holidays = data;
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
  GET_FILES(payloads: SimpleObject) {
    const ids: number[] = [];
    const holidays: SimpleObject[] = [];
    const materialsAspect: SimpleObject = {};
    if (Object.prototype.hasOwnProperty.call(payloads, "materials")) {
      for (const key in payloads.materials) {
        if (!Object.prototype.hasOwnProperty.call(payloads.materials, key))
          continue;
        const aspect: string = key[0];
        for (let i = 0; i < payloads.materials[key].length; i++) {
          const fileId = payloads.materials[key][i];
          if (Object.prototype.hasOwnProperty.call(this._materials, fileId))
            continue;
          materialsAspect[fileId] = aspect;
          ids.push(fileId);
        }
      }
    }
    if (Object.prototype.hasOwnProperty.call(payloads, "holidays")) {
      for (let i = 0; i < payloads.holidays.length; i++) {
        if (
          payloads.holidays[i] == null ||
          !Object.prototype.hasOwnProperty.call(
            payloads.holidays[i],
            "byAspects"
          )
        )
          continue;
        for (let j = 0; j < payloads.holidays[i].byAspects.length; j++) {
          if (payloads.holidays[i].byAspects[j] == null) continue;
          const obj: SimpleObject = {
            taskIndex: i,
            aspectId: j
          };
          if (
            Object.prototype.hasOwnProperty.call(
              payloads.holidays[i].byAspects[j],
              "theTask"
            )
          ) {
            ids.push(payloads.holidays[i].byAspects[j]["theTask"]);
            obj.fileIdTask = payloads.holidays[i].byAspects[j]["theTask"];
          }
          if (
            Object.prototype.hasOwnProperty.call(
              payloads.holidays[i].byAspects[j],
              "key"
            )
          ) {
            ids.push(payloads.holidays[i].byAspects[j]["key"]);
            obj.fileIdKey = payloads.holidays[i].byAspects[j]["key"];
          }
          holidays.push(obj);
        }
      }
    }
    if (!ids.length) return;
    this.context.commit("increaseLoadingCount");
    return axios
      .post(
        this._url + "file/ids?ignoreTracking=true",
        JSON.stringify({ ids: ids }),
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
        const files: SimpleObject = {};
        for (let i = 0; i < data.length; i++) {
          if (!Object.prototype.hasOwnProperty.call(data[i], "id")) continue;
          files[data[i].id] = data[i];
        }
        const materials: SimpleObject[] = [];
        for (const fileId in materialsAspect) {
          if (
            !Object.prototype.hasOwnProperty.call(materialsAspect, fileId) ||
            !Object.prototype.hasOwnProperty.call(files, fileId)
          )
            continue;
          const obj = Object.assign({}, files[fileId]);
          obj.aspect = materialsAspect[fileId];
          materials.push(obj);
        }
        if (materials.length) this.context.commit("setMaterials", materials);
        for (let i = 0; i < holidays.length; i++) {
          if (
            Object.prototype.hasOwnProperty.call(holidays[i], "fileIdTask") &&
            Object.prototype.hasOwnProperty.call(files, holidays[i].fileIdTask)
          )
            holidays[i].task = Object.assign({}, files[holidays[i].fileIdTask]);
          if (
            Object.prototype.hasOwnProperty.call(holidays[i], "fileIdKey") &&
            Object.prototype.hasOwnProperty.call(files, holidays[i].fileIdKey)
          )
            holidays[i].key = Object.assign({}, files[holidays[i].fileIdKey]);
        }
        if (holidays.length) this.context.commit("setHolidays", holidays);
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
        const ret: SimpleObject = {
          name: "",
          link: ""
        };
        if (Object.prototype.hasOwnProperty.call(res.data, "name"))
          ret.name = res.data.name;
        if (
          Object.prototype.hasOwnProperty.call(res.data, "link") &&
          Object.prototype.hasOwnProperty.call(res.data.link, "url")
        )
          ret.link = res.data.link.url;
        else if (Object.prototype.hasOwnProperty.call(res.data, "url"))
          ret.link = res.data.url;
        if (
          Object.prototype.hasOwnProperty.call(res.data, "metadata") &&
          Object.prototype.hasOwnProperty.call(res.data.metadata, "duration")
        )
          ret.duration = res.data.metadata.duration;
        if (ret.link) return Promise.resolve(ret);
        return Promise.reject("");
      });
  }

  @Action
  UPLOAD_ROL(payloads: SimpleObject) {
    payloads.kind = 3;
    return this.context.dispatch("UPLOAD_HW_AUDIO", payloads);
  }

  @Action
  UPLOAD_TOL(payloads: SimpleObject) {
    payloads.kind = 2;
    return this.context.dispatch("UPLOAD_HW_AUDIO", payloads);
  }

  @Action
  UPLOAD_HW_AUDIO(payloads: SimpleObject) {
    payloads.studentId = this.context.rootGetters["state/studentId"];
    this.context.commit("increaseLoadingCount");
    return axios
      .post(this._url + "homework/speaking", payloads, {
        withCredentials: true,
        headers: {
          "Content-type": "application/json"
        }
      })
      .then((res: AxiosResponse) => {
        if (Object.prototype.hasOwnProperty.call(res, "data")) {
          this.context.dispatch("homework/UPDATE_DATA", res.data, {
            root: true
          });
          return Promise.resolve(res.data);
        } else return Promise.reject();
      })
      .finally(() => {
        this.context.commit("decreaseLoadingCount");
      });
  }

  @Action
  DELETE_HOMEWORK(fileId: number) {
    return axios
      .delete(this._url + "homework/speaking?id=" + fileId, {
        withCredentials: true
      })
      .then((res: AxiosResponse) => {
        if (Object.prototype.hasOwnProperty.call(res, "data")) {
          this.context.dispatch("homework/GET_DATA_WITHOUT_CACHE", null, {
            root: true
          });
          return Promise.resolve(true);
        } else return Promise.reject();
      });
  }

  @Action
  DELETE_HOLIDAY_HOMEWORK(payloads: SimpleObject) {
    return axios
      .delete(this._url + "students/hhw", {
        withCredentials: true,
        data: payloads,
        headers: {
          "Content-type": "application/json"
        }
      })
      .catch(err => {
        if (err.response.data && err.response.status == 400)
          this.context.dispatch("students/GET_DATA_WITHOUT_CACHE", null, {
            root: true
          });
        return Promise.reject(err);
      })
      .then((res: AxiosResponse) => {
        if (
          Object.prototype.hasOwnProperty.call(res, "data") &&
          Object.prototype.hasOwnProperty.call(res.data, "student") &&
          Object.prototype.hasOwnProperty.call(res.data.student, "hhw") &&
          Object.prototype.hasOwnProperty.call(res.data.student.hhw, "answers")
        ) {
          this.context.dispatch(
            "holidays/SET_ANSWERS",
            res.data.student.hhw.answers,
            { root: true }
          );
          return Promise.resolve(true);
        } else return Promise.reject();
      });
  }

  @Action
  UPDATE_PROFILE(payloads: SimpleObject) {
    payloads.id = this.context.rootGetters["state/id"];
    this.context.commit("increaseLoadingCount");
    return axios
      .post(this._url + "user/update", payloads, {
        withCredentials: true,
        headers: {
          "Content-type": "application/json"
        }
      })
      .then((res: AxiosResponse) => {
        if (Object.prototype.hasOwnProperty.call(res, "data")) {
          this.context.dispatch("state/SET_DATA", res.data, {
            root: true
          });
          return Promise.resolve(res.data);
        } else return Promise.reject();
      })
      .finally(() => {
        this.context.commit("decreaseLoadingCount");
      });
  }

  @Action
  UPDATE_AVATAR(payloads: string) {
    const obj: SimpleObject = {
      userId: this.context.rootGetters["state/id"],
      src: payloads
    };
    this.context.commit("increaseLoadingCount");
    return axios
      .post(this._url + "users/avatar", obj, {
        withCredentials: true,
        headers: {
          "Content-type": "application/json"
        }
      })
      .then((res: AxiosResponse) => {
        if (Object.prototype.hasOwnProperty.call(res, "data")) {
          this.context.dispatch("state/SET_DATA", res.data, {
            root: true
          });
          return Promise.resolve(res.data);
        } else return Promise.reject();
      })
      .finally(() => {
        this.context.commit("decreaseLoadingCount");
      });
  }

  @Action
  UPDATE_PASSWORD(payloads: SimpleObject) {
    this.context.commit("increaseLoadingCount");
    return axios
      .post(this._url + "user/changepass", payloads, {
        withCredentials: true,
        headers: {
          "Content-type": "application/json"
        }
      })
      .then((res: AxiosResponse) => {
        if (
          Object.prototype.hasOwnProperty.call(res, "data") &&
          res.data.toLowerCase() == "ok"
        )
          return Promise.resolve("OK");
        else return Promise.reject("Wrong");
      })
      .finally(() => {
        this.context.commit("decreaseLoadingCount");
      });
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("clearCache");
  }
}
