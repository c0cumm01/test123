export function unixNow() {
  return Math.floor(Date.now() / 1000);
}

export function unixTimestamp(date: Date) {
  return Math.floor(date.getTime() / 1000);
}
