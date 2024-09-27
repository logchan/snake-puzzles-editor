export function getInput(id: string) {
  return document.getElementById(id) as HTMLInputElement;
}

export function getJsonBox() {
  return document.getElementById("level-json") as HTMLTextAreaElement;
}
