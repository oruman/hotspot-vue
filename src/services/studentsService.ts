import {
  fetchWithTime,
  validateJson,
  validateStatus
} from "@/helpers/fetch-helpers";
import { EventType, GlobalEvents } from "@/services/eventSystem";

class StudentsService {
  private data: SimpleObject = {};

  constructor() {
    this.loadData();
  }

  public get list() {
    return this.data;
  }

  private loadData() {
    // https://my.hotspot.school/a/students
    fetchWithTime("https://oruman.github.io/hsea/json/students.json")
      .then(validateStatus)
      .then(response => response.json())
      .then(validateJson)
      .then(response => {
        const data: SimpleObject = {};
        for (let i = 0; i < response.length; i++) {
          if (
            !response[i] ||
            !Object.prototype.hasOwnProperty.call(response[i], "id") ||
            !Object.prototype.hasOwnProperty.call(response[i], "name")
          )
            continue;
          data[response[i].id] = response[i].name;
        }
        this.data = data;
        GlobalEvents.publish(EventType.STUDENTS_LOAD, null);
      });
  }
}

export const GlobalStudentsService = new StudentsService();
