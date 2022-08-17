const ipcRenderer = require('electron').ipcRenderer;
let dirs = {
      builders: "nincs",
      red: "nincs"
}

function openDir(type){
      if(type == "builders"){
            ipcRenderer.send('selectdirbuilders');
      }
}

function hide(target){
      document.getElementById(target).classList.add("hide")
}

function show(target){
      document.getElementById(target).classList.remove("hide")
}

ipcRenderer.on("selectdirback", function(tipo, cuccos) {
      if(cuccos.tipo == "builders"){
            updatedirtext(cuccos.tipo,cuccos.folder)
            
      }
})

function updatedirtext(what,to){
      document.getElementById(what).innerHTML = to
}

function load(){
      if(dirs.builders === "nincs"){
            updatedirtext("builders", "Nincs Kiválasztva")
      }
}

load()