export function SetLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getLocalstorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
