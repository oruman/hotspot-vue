export default class Utils {
  static formatAudioDuration(seconds: number) {
    return seconds > 0
      ? new Date(seconds * 1000).toISOString().substr(14, 5)
      : "00:00";
  }

  static nl2br(str: string) {
    return str.replace(/(?:\r\n|\r|\n)/g, "<br />");
  }

  static downloadURL(uri: string, name = "") {
    const link = document.createElement("a");
    // If you don't know the name or want to use
    // the webserver default set name = ""
    link.setAttribute("download", name);
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  static b64toBlob(b64Data: string, contentType = "", sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  static chooseFile(accept = ""): Promise<SimpleObject> {
    return new Promise(resolve => {
      const regex = /^data:(.*);(.*),(.*)$/gm;
      let fileName = "";
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        if (!reader.result || typeof reader.result != "string") return;
        const mt = Array.from(reader.result.matchAll(regex));
        if (!mt[0] || mt[0].length != 4) return;
        const ret: SimpleObject = {
          name: fileName,
          extension: Utils.getExtension(fileName),
          contentType: mt[0][1],
          metadata: {}
        };
        ret[mt[0][2]] = mt[0][3];
        resolve(ret);
      });
      const file = document.createElement("input");
      file.type = "file";
      if (accept) file.accept = accept;
      file.addEventListener("change", () => {
        fileName = "";
        if (file.files && file.files[0]) {
          if (file.files[0].name) fileName = file.files[0].name;
          reader.readAsDataURL(file.files[0]);
        }
      });
      file.click();
    });
  }

  static getExtension(fileName: string) {
    const ext = /(?:\.([^.]+))?$/.exec(fileName);
    return ext && ext[1] ? ext[1] : "";
  }

  static getYoutubeId(link: string) {
    const youTubeRegexp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/gi;
    const result = youTubeRegexp.exec(link);
    return result && result.length > 1 ? result[1] : "";
  }
}
