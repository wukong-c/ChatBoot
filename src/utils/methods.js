//一些全局方法
import html2canvas from "html2canvas";

//加载图片
export function loadImage(path) {
  const glob = import.meta.glob("/src/assets/images/**/*", {
    query: "?url",
    eager: true,
  });
  let find = glob[`/src/assets/images/${path}`];
  if (find) {
    return find.default;
  }
  return "";
}
// 简单深拷贝
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
// html 转图片 并下载
export function htmlToCanvasDownload(dom, fileName, noTime = false) {
  html2canvas(document.querySelector(dom)).then(function (canvas) {
    var imgUri = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); // 获取生成的图片的url
    let aLink = document.createElement("a");
    let time = new Date().getTime();
    if (noTime) {
      fileName = fileName + ".jpg";
    } else {
      fileName = time + "-" + fileName + ".jpg";
    }
    aLink.download = fileName;
    aLink.href = imgUri;
    aLink.click();
  });
}
