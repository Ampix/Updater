const element = document.getElementById("updateinfo")

const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;
ipcRenderer.send("giveupdateinfo")
let updateinfo
ipcRenderer.on("setupdateinfo", (event, info) => {
      console.log(info)
      ipcRenderer.send("setupdateinfo", info)
})

ipcRenderer.on("updateinfo", function(event, info) {
      updateinfo = info
      refresh(updateinfo)
})

function refresh(stat){
      element.innerHTML = stat
}
