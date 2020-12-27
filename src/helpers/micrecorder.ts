const knownAudioTypes = [
  "audio/mpeg",
  "audio/webm",
  "audio/ogg",
  "audio/ogg; codecs=opus",
  "audio/wave",
  "audio/wav",
  "audio/x-wav",
  "audio/x-pn-wav",
  "audio/aac",
  "audio/m4a",
  "audio/flac"
];

type CallBackDuration = (duration: number) => void;

export default class MicRecorder {
  private stream!: MediaStream;
  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];
  private defaultRecordingType = "";
  private isDisabled = false;
  private isStopped = false;
  private countStart = 0;

  constructor() {
    this.getStream();
  }

  private getStream() {
    if (typeof navigator.mediaDevices.getUserMedia == "undefined") {
      const getUserMedia: NavigatorGetUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
      getUserMedia(
        { audio: true },
        this.setMediaRecorder.bind(this),
        this.error.bind(this)
      );
    } else {
      navigator.mediaDevices
        .getUserMedia({
          audio: true
        })
        .then(this.setMediaRecorder.bind(this))
        .catch(this.error.bind(this));
    }
  }

  private setMediaRecorder(stream: MediaStream) {
    this.defaultRecordingType = MicRecorder.testAudioTypes();
    if (!this.defaultRecordingType)
      throw new Error(
        "Media Recorder API: None of known types are supported for recording :("
      );
    this.stream = stream;
    this.mediaRecorder = new MediaRecorder(stream, {
      audioBitsPerSecond: 128000,
      mimeType: this.defaultRecordingType
    });
    this.mediaRecorder.addEventListener("dataavailable", event => {
      if (this.isDisabled) return;
      this.audioChunks.push(event.data);
    });
    this.mediaRecorder.addEventListener("start", () => {
      if (this.isDisabled) return;
      this.countStart++;
    });
    this.mediaRecorder.addEventListener("resume", () => {
      if (this.isDisabled) return;
      this.countStart++;
    });
    this.mediaRecorder.addEventListener("pause", () => {
      if (this.isDisabled) return;
    });
    this.mediaRecorder.addEventListener("stop", () => {
      if (this.isDisabled) return;
      this.isStopped = true;
      this.isDisabled = true;
    });
  }

  public record() {
    if (!this.mediaRecorder || this.isDisabled) return;
    switch (this.mediaRecorder.state) {
      case "paused":
        this.mediaRecorder.resume();
        break;
      case "inactive":
        this.mediaRecorder.start();
        break;
    }
  }

  public pause() {
    if (this.mediaRecorder) this.mediaRecorder.pause();
  }

  public async stop() {
    if (!this.mediaRecorder || this.isDisabled) return Promise.reject();
    const promiseStop = new Promise(resolve => {
      const tm = setInterval(() => {
        if (this.isStopped) {
          clearInterval(tm);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(tm);
      }, 5000);
    });
    if (this.mediaRecorder.state != "recording") {
      if (!this.countStart) return Promise.reject();
    } else this.mediaRecorder.stop();
    await promiseStop;
    if (!this.isStopped) return Promise.reject();
    const audioBlob = new Blob(this.audioChunks, {
      type: this.defaultRecordingType
    });
    const promiseConvert = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        if (!reader.result || typeof reader.result != "string") reject();
        else resolve(reader.result);
      });
      reader.readAsDataURL(audioBlob);
    });
    const str = await promiseConvert;
    if (!str || typeof str != "string") return Promise.reject();
    const promiseDuration = new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.volume = 0;
      audio.muted = true;
      let fix = false;
      const audioURL = window.URL.createObjectURL(audioBlob);
      audio.addEventListener("durationchange", () => {
        const duration = audio.duration;
        if (audio.duration == Infinity) {
          if (fix) return;
          fix = true;
          audio.currentTime = 24 * 60 * 60;
          audio.play();
        } else {
          resolve(duration);
          audio.remove();
        }
      });
      audio.addEventListener("error", () => {
        audio.remove();
        reject(0);
      });
      audio.src = audioURL;
    });
    const duration = await promiseDuration;
    const regex = /^data:(.*);(.*),(.*)$/gm;
    const mt = Array.from(str.matchAll(regex));
    if (!mt[0] || mt[0].length != 4) return;
    const ret: SimpleObject = {
      contentType: this.defaultRecordingType,
      metadata: {
        name: ""
      }
    };
    ret[mt[0][2]] = mt[0][3];
    if (duration) ret.metadata.duration = duration;
    return Promise.resolve(ret);
  }

  private error(e: MediaStreamError) {
    this.isDisabled = true;
    console.log(e.message);
    throw new Error(
      "Unable to access microphone, please check system settings."
    );
  }

  private static testAudioTypes() {
    for (let i = 0; i < knownAudioTypes.length; i++) {
      if (MediaRecorder.isTypeSupported(knownAudioTypes[i]))
        return knownAudioTypes[i];
    }
    return "";
  }
}