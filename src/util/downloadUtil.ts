export function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  document.body.appendChild(link);
  link.setAttribute("download", filename);
  link.setAttribute("href", url);
  link.click();
  document.body.removeChild(link);
}

export function downloadText(text: string, filename: string) {
  const blob = new Blob([text], {
    type: "text/plain;charset=UTF-8"
  });
  triggerDownload(URL.createObjectURL(blob), filename);
}
