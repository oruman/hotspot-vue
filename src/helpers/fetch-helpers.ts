export function fetchWithTime(url: string) {
  url += url.indexOf("?") > -1 ? "&" : "?";
  url += "tm=" + Date.now();
  return fetch(url);
}

export function validateStatus(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(response);
  }
}

export function validateJson(data: SimpleObject) {
  if (data.error) return Promise.reject(data.eror);
  return Promise.resolve(data);
}
