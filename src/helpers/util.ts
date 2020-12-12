export default class Utils {
  static formatAudioDuration(seconds: number) {
    return seconds > 0
      ? new Date(seconds * 1000).toISOString().substr(14, 5)
      : "00:00";
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
}
