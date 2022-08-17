const element = document.getElementById("update")
const ipcRenderer = require('electron').ipcRenderer;
ipcRenderer.on("checkforupdate", function() {
    element.innerHTML = "Frissités keresése..."
})
ipcRenderer.on("hasupdate", function() {
      element.innerHTML = "Frissités találva"
})
ipcRenderer.on("noupdate", function() {
      element.innerHTML = "Nincs új frissités"
})
ipcRenderer.on("error", function(tipo, err) {
      element.innerHTML = "Hiba: " + err
})
ipcRenderer.on("updatedown", function(tipo, log_message) {
      element.innerHTML = "Letöltés... " + log_message
})
ipcRenderer.on("update-downloaded", function() {
      element.innerHTML = "Frissités letöltve, indítsd újra a telepítéshez."
})
