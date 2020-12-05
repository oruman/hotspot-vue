import {
  fetchWithTime,
  validateJson,
  validateStatus
} from "@/helpers/fetch-helpers";
import { EventType, GlobalEvents } from "@/services/eventSystem";

class GradesService {
  private data: SimpleObject = {};

  constructor() {
    this.loadData();
  }

  public get curriculum() {
    return this.data?.curriculum;
  }

  public get tol() {
    return this.data?.tol;
  }

  public get rol() {
    return this.data?.rol;
  }

  public get rolDelayWeeks() {
    return this.data.rol_delay_weeks || 0;
  }

  private loadData() {
    // https://my.hotspot.school/a/grades
    fetchWithTime("https://oruman.github.io/hsea/json/grades.json")
      .then(validateStatus)
      .then(response => response.json())
      .then(validateJson)
      .then(response => {
        this.data = response[0];
        GlobalEvents.publish(EventType.GRADES_LOAD, null);
      });
  }
}

export const GlobalGradesService = new GradesService();
