import {
  fetchWithTime,
  validateJson,
  validateStatus
} from "@/helpers/fetch-helpers";
import { EventType, GlobalEvents } from "@/services/eventSystem";

class FileService {
  private data: SimpleObject[] = [];

  constructor() {
    this.loadData();
  }

  public get files() {
    return this.data;
  }

  private loadData() {
    // https://my.hotspot.school/a/file/ids?ignoreTracking=true
    fetchWithTime("https://oruman.github.io/hsea/json/files.json")
      .then(validateStatus)
      .then(response => response.json())
      .then(validateJson)
      .then(response => {
        this.data = this.convertData(response as SimpleObject[]);
        GlobalEvents.publish(EventType.FILES_LOAD, null);
      });
  }

  private convertData(data: SimpleObject[]) {
    const newData = [];
    for (const item of data) {
      const newItem: SimpleObject = {
        id: item.id,
        name: item.name
      };
      newItem.link =
        "https://my.hotspot.school/a/file/" +
        item.id +
        "/view/" +
        encodeURIComponent(item.name);
      newItem.fileKey = item.metadata?.gradeInfo?.filesKey;
      newData.push(newItem);
    }
    return newData;
  }
}

export const GlobalFileService = new FileService();
