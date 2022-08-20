var fs = require("fs");
const request = require('request');
const decompress = require("decompress")

var dirs = {
      builders: "nincs",
      red: "nincs"
}

let doneb = false

var stat = {
      builders: "nincs",
      red: "nincs"
}

var vers = {
      builders_local: "nincs",
      builders_online: "nincs",
      red_local: "nincs",
      red_online: "nincs"
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
            dirs.builders = cuccos.folder
            updatetext("dir",cuccos.tipo,cuccos.folder)
            loadup("builders")
      }
})

function updatetext(type, what, to){
      if(type == "dir"){
            document.getElementById(what).innerHTML = to
      }
      if(type == "status"){
            if(what == "builders"){
                  document.getElementById("statusb").classList.remove("warning")
                  document.getElementById("statusb").classList.add("spectext")
                  document.getElementById("statusb").innerHTML = to
                  show("statusb")
            }
            
      }
      if(type == "statuswarn"){
            if(what == "builders"){
                  document.getElementById("statusb").classList.add("warning")
                  document.getElementById("statusb").classList.remove("spectext")
                  document.getElementById("statusb").innerHTML = to
                  show("statusb")
            }
            
      }
      
}

function load(){
      if(dirs.builders === "nincs"){
            updatetext("dir","builders", "Nincs Kiválasztva")
      }
}

function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

async function loadup(type){
      if(type == "builders"){
            fs.readFile(dirs.builders + '\\ampixupdater\\ver.txt', (err, data) => {
                  if(data == undefined){
                        stat.builders = "empty"
                        updatetext("status","builders", "Ide nincs felrakva a modpack.")
                  }else{
                        vers.builders_local = data                        
                  }
            })
            fs.readFile(dirs.builders + '\\ampixupdater\\type.txt', (err, data) => {
                  if(data == undefined) return
                  if(data == "builders") return
                  stat.builders = "onlydel"
                  updatetext("statuswarn","builders", "Itt másik modpack van telepítve először töröld le azt a gombbal.")
            })
            request.get('https://cdn.ampix.hu/builders/ver.txt', function(err, res, body) {
                  if(body == undefined) return updatetext("newver","builders", "Hiba: Nem lehet elérni a rendszert")
                  vers.builders_online = body
                  doneb = true
            })
            await sleep(500)
            show("selecodirb")
            hide("selecdirb")
            if(stat.builders == "empty"){
                  show("downloadpackb")
            }else if(stat.builders == "onlydel"){
                  show("delpackb")
            }else if(vers.builders_local != vers.builders_online){
                  show("updatepackb")
                  show("delpackb")
                  updatetext("status","builders", "Frissités elérhető!")
            }else{
                  show("delpackb")
                  updatetext("status","builders", "A legújabb verziót használod.")
            }
      }
      
}

function otherDir(size, type){
      if(type == "builders"){
            dirs.builders = "nincs"
            stat.builders = "nincs"
            vers.builders_local = "nincs"
            vers.builders_online = "nincs"
            hide("statusb")
            hide("selecodirb")
            show("selecdirb")
            hide("updatepackb")
            hide("delpackb")
            hide("downloadpackb")
            load()
            
      }
      if(size == "button"){
            openDir("builders")
      }
}

function updatepack(what,type){
      if(what == "update"){
            fs.rmSync(dirs.builders + "\\ampixupdater", { recursive: true, force: true })
            fs.rmSync(dirs.builders + "\\simple-rpc", { recursive: true, force: true })
            fs.rmSync(dirs.builders + "\\mods", { recursive: true, force: true })
      }
      if(type == "builders"){
                  const loc = dirs.builders
                  updatetext("status","builders", "Letöltés...")
                  request('https://cdn.ampix.hu/builders/base.zip')
                  .pipe(fs.createWriteStream(loc + '\\base.zip'))
                  .on('close', async function () {
                        updatetext("status","builders", "Kicsomagolás...")
                        decompress(loc+'\\base.zip', loc+'\\').then(async files => {
                              fs.rmSync(loc + "\\base.zip", { force: true })
                              updatetext("status","builders", "Kész!")
                              await sleep(2000)
                              otherDir("je", "builders")
                        });
                  });
      }
}

async function delpack(type){
      if(type == "builders"){
            fs.rmSync(dirs.builders + "\\ampixupdater", { recursive: true, force: true })
            fs.rmSync(dirs.builders + "\\simple-rpc", { recursive: true, force: true })
            fs.rmSync(dirs.builders + "\\mods", { recursive: true, force: true })
            updatetext("statuswarn","builders", "Modpack sikeresen kitörölve.")
            await sleep(1500)
            otherDir("je","builders")
      }
}

load()