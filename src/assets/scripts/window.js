const minus = document.getElementById("minimize");
const close_app = document.getElementById("close-app");
const { ipcRenderer } = require("electron");

minus.addEventListener("click", minimize);
close_app.addEventListener("click", closeapp);

function closeapp() {
  ipcRenderer.send("app/close");
}

function minimize() {
  ipcRenderer.send("app/minimize");
}
