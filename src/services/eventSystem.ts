/** Usage example */
// Subscribe
// const cb = GlobalEvents.subscribe(EventType.INFO_UPDATED, (data) => {
//  console.log(data); // {data} already inferred as string
// });

// Publish
// GlobalEvents.publish(EventType.INFO_UPDATED, 'February 1st');

// Unsubscribe
// GlobalEvents.unsubscribe(EventType.INFO_UPDATED, cb);

export const enum EventType {
  GRADES_LOAD,
  FILES_LOAD,
  STATE_LOAD,
  LESSONS_LOAD,
  STUDENTS_LOAD,
  GROUPS_LOAD
}

type IEventCallback<T> = (data: T) => void;

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IEventSubscribers {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [eventType: number]: Array<IEventCallback<any>> | undefined;
}

class EventSystem {
  private subscribers: IEventSubscribers = {};

  //public publish(event: EventType.INFO_UPDATED, data: DATA_INFO_UPDATED): boolean;
  public publish<T>(event: EventType, data: T): boolean {
    const queue = this.subscribers[event];

    if (!queue) {
      return false;
    }

    for (const cb of queue) {
      cb(data);
    }

    return true;
  }

  //public subscribe(event: EventType.INFO_UPDATED, callback: IEventCallback<DATA_INFO_UPDATED>): IEventCallback<DATA_INFO_UPDATED>;
  public subscribe<T>(
    event: EventType,
    callback: IEventCallback<T>
  ): IEventCallback<T> {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }

    this.subscribers[event]?.push(callback);

    // Return the callback so we can unsubscribe from it
    // This way we can pass an arrow function
    return callback;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public unsubscribe(event: EventType, callback?: IEventCallback<any>) {
    const subs = this.subscribers[event];

    if (!subs) {
      return;
    }

    if (!callback) {
      this.subscribers[event] = undefined;
    } else {
      this.subscribers[event] = this.subscribers[event]?.filter(subCb => {
        return subCb !== callback;
      });
    }
  }
}

export const GlobalEvents = new EventSystem();
