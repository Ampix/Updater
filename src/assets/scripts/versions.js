var fs = require("fs");
const request = require('request');
const decompress = require("decompress")

var dirs = {
      builders: "nincs",
      twigmod2: "nincs"
}

let doneb = false

var stat = {
      builders: "nincs",
      twigmod2: "nincs"
}

var vers = {
      builders_local: "nincs",
      builders_online: "nincs",
      t2_local: "nincs",
      t2_online: "nincs"
}

function openDir(type){
      if(type == "builders"){
            ipcRenderer.send('selectdirbuilders');
      }
      if(type == "twigmod2"){
            ipcRenderer.send('selectdirt2');
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
      if(cuccos.tipo == "twigmod2"){
            dirs.twigmod2 = cuccos.folder
            updatetext("dir",cuccos.tipo,cuccos.folder)
            loadup("twigmod2")
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
            if(what == "twigmod2"){
                  document.getElementById("statust2").classList.remove("warning")
                  document.getElementById("statust2").classList.add("spectext")
                  document.getElementById("statust2").innerHTML = to
                  show("statust2")
            }
            
      }
      if(type == "statuswarn"){
            if(what == "builders"){
                  document.getElementById("statusb").classList.add("warning")
                  document.getElementById("statusb").classList.remove("spectext")
                  document.getElementById("statusb").innerHTML = to
                  show("statusb")
            }
            if(what == "twigmod2"){
                  document.getElementById("statust2").classList.add("warning")
                  document.getElementById("statust2").classList.remove("spectext")
                  document.getElementById("statust2").innerHTML = to
                  show("statust2")
            }
            
      }
      
}

function load(){
      if(dirs.builders === "nincs"){
            updatetext("dir","builders", "Nincs Kiválasztva")
      }
      if(dirs.twigmod2 === "nincs"){
            updatetext("dir","twigmod2", "Nincs Kiválasztva")
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
      if(type == "twigmod2"){
            fs.readFile(dirs.twigmod2 + '\\ampixupdater\\ver.txt', (err, data) => {
                  if(data == undefined){
                        stat.twigmod2 = "empty"
                        updatetext("status","twigmod2", "Ide nincs felrakva a modpack.")
                  }else{
                        vers.twigmod2_local = data                        
                  }
            })
            fs.readFile(dirs.twigmod2 + '\\ampixupdater\\type.txt', (err, data) => {
                  if(data == undefined) return
                  if(data == "twigmod2") return
                  stat.twigmod2 = "onlydel"
                  updatetext("statuswarn","twigmod2", "Itt másik modpack van telepítve először töröld le azt a gombbal.")
            })
            request.get('https://cdn.ampix.hu/twigmod2/ver.txt', function(err, res, body) {
                  if(body == undefined) return updatetext("newver","twigmod2", "Hiba: Nem lehet elérni a rendszert")
                  vers.twigmod2_online = body
                  doneb = true
            })
            await sleep(500)
            show("selecodirt2")
            hide("selecdirt2")
            if(stat.twigmod2 == "empty"){
                  show("downloadpackt2")
            }else if(stat.twigmod2 == "onlydel"){
                  show("delpackt2")
            }else if(vers.twigmod2_local != vers.twigmod2_online){
                  show("updatepackt2")
                  show("delpackt2")
                  updatetext("status","twigmod2", "Frissités elérhető!")
            }else{
                  show("delpackt2")
                  updatetext("status","twigmod2", "A legújabb verziót használod.")
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
            if(size == "button"){
                  openDir("builders")
            }
      }
      if(type == "twigmod2"){
            dirs.twigmod2 = "nincs"
            stat.twigmod2 = "nincs"
            vers.twigmod2_local = "nincs"
            vers.twigmod2_online = "nincs"
            hide("statust2")
            hide("selecodirt2")
            show("selecdirt2")
            hide("updatepackt2")
            hide("delpackt2")
            hide("downloadpackt2")
            load()
            if(size == "button"){
                  openDir("twigmod2")
            }
      }
}

function updatepack(type){
      if(type == "builders"){
            const loc = dirs.builders
            fs.rmSync(loc + "\\ampixupdater", { recursive: true, force: true })
            fs.rmSync(loc + "\\simple-rpc", { recursive: true, force: true })
            fs.rmSync(loc + "\\mods", { recursive: true, force: true })
            fs.rmSync(loc + "\\base.zip", { recursive: true, force: true })
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
      
      if(type == "twigmod2"){
            const loc = dirs.twigmod2
            fs.rmSync(loc + "\\ampixupdater", { recursive: true, force: true })
            fs.rmSync(loc + "\\simple-rpc", { recursive: true, force: true })
            fs.rmSync(loc + "\\mods", { recursive: true, force: true })
            fs.rmSync(loc + "\\base.zip", { recursive: true, force: true })
            fs.rmSync(loc + "\\config", { recursive: true, force: true })
            updatetext("status","twigmod2", "Letöltés...")
            request('https://cdn.ampix.hu/twigmod2/base.zip')
            .pipe(fs.createWriteStream(loc + '\\base.zip'))
            .on('close', async function () {
                  updatetext("status","builders", "Kicsomagolás...")
                  decompress(loc+'\\base.zip', loc+'\\').then(async files => {
                        fs.rmSync(loc + "\\base.zip", { force: true })
                        updatetext("status","twigmod2", "Kész!")
                        await sleep(2000)
                        otherDir("je", "twigmod2")
                  });
            });
      }
}
async function delpack(type){
      if(type == "builders"){
            fs.rmSync(dirs.builders + "\\ampixupdater", { recursive: true, force: true })
            fs.rmSync(dirs.builders + "\\simple-rpc", { recursive: true, force: true })
            fs.rmSync(dirs.builders + "\\mods", { recursive: true, force: true })
            fs.rmSync(dirs.builders + "\\base.zip", { recursive: true, force: true })
            updatetext("statuswarn","builders", "Modpack sikeresen kitörölve.")
            await sleep(1500)
            otherDir("je","builders")
      }
      if(type == "twigmod2"){
            fs.rmSync(dirs.twigmod2 + "\\ampixupdater", { recursive: true, force: true })
            fs.rmSync(dirs.twigmod2 + "\\simple-rpc", { recursive: true, force: true })
            fs.rmSync(dirs.twigmod2 + "\\mods", { recursive: true, force: true })
            fs.rmSync(dirs.twigmod2 + "\\base.zip", { recursive: true, force: true })
            fs.rmSync(dirs.twigmod2 + "\\config", { recursive: true, force: true })
            updatetext("statuswarn","twigmod2", "Modpack sikeresen kitörölve.")
            await sleep(1500)
            otherDir("je","twigmod2")
      }
}

load()