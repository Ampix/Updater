var element = document.getElementById("updateinfo")
var progress_bar = document.getElementById("progressparent")
var progress = document.getElementById("progress")
const ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on("updateinfo", (event,lol ,type, args) => {
      if(type === "search"){
            element.innerHTML = "Frissités keresése..."
      }
      if(type === "found"){
            element.innerHTML = "Frissités találva"
      }
      if(type === "noupdate"){
            element.innerHTML = ""
      }
      if(type === "error"){
            element.innerHTML = "Hiba: " + args
      }
      if(type === "downloading"){
            element.innerHTML = "Frissités letöltése"
            progress_bar.classList.remove("hide")
            progress.style.width = args
      }
})

function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
}