import {
  fetchWithTime,
  validateJson,
  validateStatus
} from "@/helpers/fetch-helpers";
import { EventType, GlobalEvents } from "@/services/eventSystem";

class GroupsService {
  private data: SimpleObject = {};

  constructor() {
    this.loadData();
  }

  public get averageMarks() {
    const ret: SimpleObject[] = [];
    if (
      !Object.prototype.hasOwnProperty.call(this.data, "average_marks") ||
      !Object.prototype.hasOwnProperty.call(
        this.data["average_marks"],
        "byMonth"
      ) ||
      !Object.prototype.hasOwnProperty.call(
        this.data["average_marks"]["byMonth"],
        "count"
      )
    )
      return ret;
    for (let i = 0; i < this.data["average_marks"]["byMonth"]["count"]; i++) {
      if (
        !Object.prototype.hasOwnProperty.call(
          this.data["average_marks"]["byMonth"],
          i
        )
      )
        continue;
      ret.push(this.data["average_marks"]["byMonth"][i]);
    }
    return ret;
  }

  private loadData() {
    // https://my.hotspot.school/a/groups
    fetchWithTime("https://oruman.github.io/hsea/json/groups.json")
      .then(validateStatus)
      .then(response => response.json())
      .then(validateJson)
      .then(response => {
        this.data = response[0];
        GlobalEvents.publish(EventType.GROUPS_LOAD, null);
      });
  }
}

export const GlobalGroupsService = new GroupsService();
