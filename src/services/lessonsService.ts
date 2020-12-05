import {
  fetchWithTime,
  validateJson,
  validateStatus
} from "@/helpers/fetch-helpers";
import { EventType, GlobalEvents } from "@/services/eventSystem";

class LessonsService {
  private _marks: SimpleObject[] = [];
  private _tests: SimpleObject[] = [];
  private _tols: SimpleObject[] = [];

  constructor() {
    this.loadData();
  }

  public get marks() {
    return this._marks;
  }

  public get tests() {
    return this._tests;
  }

  private loadData() {
    // https://my.hotspot.school/a/lessons
    fetchWithTime("https://oruman.github.io/hsea/json/lessons.json")
      .then(validateStatus)
      .then(response => response.json())
      .then(validateJson)
      .then(response => {
        const marks = [];
        const tests = [];
        response.sort((a: SimpleObject, b: SimpleObject) => a.date - b.date);
        for (const item of response as SimpleObject[]) {
          const dt = parseInt(item.date, 10);
          const tmpMarks = Object.values(item.marks);
          marks.push({
            date: dt,
            aspect: item.aspect,
            mark: tmpMarks.length > 0 ? tmpMarks[0] : ""
          });
          if (item.is_test) {
            const tmpTests = Object.values(item.test_marks);
            tests.push({
              date: dt,
              aspect: item.aspect,
              score: tmpTests.length > 0 ? tmpTests[0] : 0
            });
          }
        }
        this._marks = marks;
        this._tests = tests;
        GlobalEvents.publish(EventType.LESSONS_LOAD, null);
      });
  }
}

export const GlobalLessonsService = new LessonsService();
