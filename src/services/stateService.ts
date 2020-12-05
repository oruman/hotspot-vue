import {
  fetchWithTime,
  validateJson,
  validateStatus
} from "@/helpers/fetch-helpers";
import { EventType, GlobalEvents } from "@/services/eventSystem";

class StateService {
  private data: SimpleObject = {};

  constructor() {
    this.loadData();
  }

  public get studentId() {
    return this.data.student_id ? this.data.student_id : 0;
  }

  private loadData() {
    // https://my.hotspot.school/a/state
    fetchWithTime("https://oruman.github.io/hsea/json/state.json")
      .then(validateStatus)
      .then(response => response.json())
      .then(validateJson)
      .then(response => {
        if (response.state && response.state.user)
          this.data = response.state.user;
        GlobalEvents.publish(EventType.STATE_LOAD, null);
      });
  }
}

export const GlobalStateService = new StateService();
