import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

@Module({ namespaced: true })
export class Grades extends VuexModule {
  private cacheTime = 0;
  private _curriculum: SimpleObject[] = [];
  private _rols: SimpleObject[] = [];
  private _tols: SimpleObject[] = [];
  private _rolsDelayWeek = 0;
  private _tolsDelayWeek = 0;

  get curriculum() {
    return this._curriculum;
  }

  get rols() {
    return this._rols;
  }

  get tols() {
    return this._tols;
  }

  @Mutation
  setCacheTime(time: number) {
    this.cacheTime = time;
  }

  @Mutation
  clearCache() {
    this._curriculum = [];
    this._rols = [];
    this.cacheTime = 0;
  }

  @Mutation
  setCurriculum(data: SimpleObject) {
    const headerData = [];
    const newData = [];

    for (const id in data.header) {
      if (!Object.prototype.hasOwnProperty.call(data.header, id)) continue;
      for (const tmp in data.header[id]) {
        if (!Object.prototype.hasOwnProperty.call(data.header[id], tmp))
          continue;
        headerData.push({
          aspect: id,
          name: data.header[id][tmp]
        });
      }
    }
    for (const weekNum in data.body) {
      if (!Object.prototype.hasOwnProperty.call(data.body, weekNum)) continue;
      const newWeek: SimpleObject[] = [];
      for (const itemId in data.body[weekNum]) {
        if (!Object.prototype.hasOwnProperty.call(data.body[weekNum], itemId))
          continue;
        const numId = parseInt(itemId, 10);
        if (isNaN(numId)) continue;
        const newItem: SimpleObject = {
          title: headerData[numId].name,
          aspect: headerData[numId].aspect
        };
        const items: SimpleObject[] = [];
        for (const task of data.body[weekNum][itemId]) {
          const newTask: SimpleObject = {
            text: task.title
          };
          if (task.link) newTask.link = task.link;
          else if (!task.title.replace(/_/g, "")) continue; //ReplaceAll not working on iOS12
          items.push(newTask);
        }
        if (items.length) {
          newItem["items"] = items;
          newWeek.push(newItem);
        }
      }
      newData.push(newWeek);
    }
    this._curriculum = newData;
  }

  @Mutation
  setRols(data: SimpleObject[]) {
    if (!data) return;
    this._rols = data
      .filter((item: SimpleObject) => item.id > this._rolsDelayWeek)
      .sort((a, b) => a.id - b.id);
  }

  @Mutation
  setTols(data: SimpleObject[]) {
    if (!data) return;
    const newData: SimpleObject[] = [];
    const srcData = data
      .filter((item: SimpleObject) => item.id > this._tolsDelayWeek)
      .sort((a, b) => a.id - b.id);
    for (const item of srcData) {
      let i = 1;
      const newItems: string[] = [];
      while (Object.prototype.hasOwnProperty.call(item, i)) {
        const text = item[i]
          .trim()
          .replace(
            /(?:(https?:\/\/[^\s]+))/m,
            '<a href="$1" target="_blank">$1</a>'
          );
        if (text) newItems.push(text);
        i++;
      }
      newData.push({
        id: item.id - 1,
        items: newItems
      });
    }
    this._tols = newData;
  }

  @Mutation
  setRolsDelay(weekCount: number) {
    this._rolsDelayWeek = weekCount;
  }

  @Mutation
  setTolsDelay(weekCount: number) {
    this._tolsDelayWeek = weekCount;
  }

  @Action
  GET_DATA() {
    if (Date.now() < this.cacheTime) return;
    this.context.commit("setCacheTime", Date.now() + 500);
    this.context
      .dispatch("network/GET_DATA", "grades", { root: true })
      .then(response => {
        if (!response || !Array.isArray(response) || !response.length)
          return Promise.reject("N/A");
        const res = response[0];
        const reqFiles: SimpleObject = {
          holidays: [],
          materials: {}
        };
        if (Object.prototype.hasOwnProperty.call(res, "curriculum"))
          this.context.commit("setCurriculum", res.curriculum);
        if (Object.prototype.hasOwnProperty.call(res, "files"))
          reqFiles.materials = res.files;
        if (
          Object.prototype.hasOwnProperty.call(res, "hhw") &&
          Object.prototype.hasOwnProperty.call(res.hhw, "tasks")
        )
          reqFiles.holidays = res.hhw.tasks;
        if (
          reqFiles.holidays.length ||
          Object.values(reqFiles.materials).length
        )
          this.context.dispatch("network/GET_FILES", reqFiles, { root: true });
        const rolDelayWeeks = Object.prototype.hasOwnProperty.call(
          res,
          "rol_delay_weeks"
        )
          ? res["rol_delay_weeks"]
          : 0;
        this.context.commit("setRolsDelay", rolDelayWeeks);
        const tolDelayWeeks = Object.prototype.hasOwnProperty.call(
          res,
          "tol_delay_weeks"
        )
          ? res["tol_delay_weeks"]
          : 0;
        this.context.commit("setTolsDelay", tolDelayWeeks);
        if (Object.prototype.hasOwnProperty.call(res, "rol"))
          this.context.commit(
            "setRols",
            res.rol.filter((item: SimpleObject) => item.id > rolDelayWeeks)
          );
        if (Object.prototype.hasOwnProperty.call(res, "tol"))
          this.context.commit("setTols", res.tol);
        this.context.commit("setCacheTime", Date.now() + 10 * 60 * 1000);
      })
      .catch(() => {
        console.log("Grades ERROR");
      });
  }

  @Action
  CLEAR_CACHE() {
    this.context.commit("clearCache");
  }
}
