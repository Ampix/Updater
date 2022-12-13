const os = require("os");
var fs = require("fs");
const request = require("request");
const decompress = require("decompress");
const { ipcRenderer, shell, webFrame } = require("electron");
var mv = require("mv");
let canswitchpage = false;
let page = "Kezdőlap";
//  minus.addEventListener("click", minimize);
//  close_app.addEventListener("click", closeapp);

function closeapp() {
    ipcRenderer.send("app/close");
}

function hide(target) {
    document.getElementById(target).classList.add("hide");
}

function show(target) {
    document.getElementById(target).classList.remove("hide");
}

function minimize() {
    ipcRenderer.send("app/minimize");
}

var modpacks = [];
var modpack_folders = [];
var loaded_modpacks = [];
var multimc = "";

ipcRenderer.on("selectdirback", function (evt, minden) {
    if (minden.type === "multimc") {
        document.getElementById("multi-folder").innerHTML = minden.folder;
    } else {
        fs.writeFile(configdir + minden.type + ".txt", minden.folder, (err) => {
            if (err) {
                console.log(err);
            }
        });
        if (page === "Kezdőlap") {
            location.reload();
        }
        if (page === "Beállítások") {
            loadtext();
        }
    }
});
ipcRenderer.on("showupdateinfo", function (evt, stuff) {
    hasupdate = true;
    console.log("asd");
    let kacko = document.createElement("div");
    kacko.innerHTML = `<h1 class="spectext" style="margin-bottom: 20px !important">Frissitési napló v${stuff.name}</h1><md-block style="text-align: left !important;">${stuff.log}</md-block>`;
    document.getElementById("updatetext").appendChild(kacko);
    setTimeout(() => {
        doModal("open");
    }, 50);
});

function setfolder(type) {
    if (type === "multimc") {
        let cuccos = { name: "multimc", title: "MultiMC" };
        ipcRenderer.send("selectdir", cuccos);
    } else {
        let id = getId(type);
        setTimeout(async () => {
            let cuccos = { name: type, title: modpacks.title[id] };
            ipcRenderer.send("selectdir", cuccos);
        }, 100);
    }
}

function loadmodpack(item) {
    let id = getId(item);
    setTimeout(async () => {
        if (loaded_modpacks.includes(item) == false) {
            if (modpack_folders.length == id) {
                loaded_modpacks.push(item);
                fs.readFile(configdir + "multimc.txt", "utf8", function (err, data) {
                    multimc = data + "\\instances\\";
                    fs.readFile(data + "\\instances\\" + modpacks.title[id] + "\\.minecraft\\ampixupdater\\ver.txt", "utf8", function (err2, data2) {
                        if (!data2) {
                            modpack_folders.push("none");
                        } else {
                            modpack_folders.push("van");
                        }
                        loaderin();
                    });
                });
            } else {
                loadmodpack(item);
            }
        }
    }, 100);
}

function getId(what) {
    for (let i = 0; i < modpacks.name.length; i++) {
        if (modpacks.name[i] === what) {
            return i;
        }
    }
}

function openLink(link) {
    shell.openExternal(link);
}
const username = os.userInfo().username;
// * Mappa ellenőrzése
if (!fs.existsSync("C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater")) {
    fs.mkdirSync("C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater");
}
let configdir = "C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater\\";
window.addEventListener("load", (event) => {
    document.getElementById("Kezdőlap").classList.add("active");
});

function status(what, to) {
    document.getElementById(what).innerHTML = to;
}

function getWarn() {
    request.get("https://cdn.ampix.hu/updater/info.txt", function (err, res, body) {
        if (body === "nincs") {
            hide("warning-body");
        } else {
            show("warning-body");
            warning = body;
        }
    });
}

function updatepack(type) {
    if (canswitchpage) {
        let id = getId(type);
        setTimeout(async () => {
            var all = 0;
            var current = 0;
            var progress = document.getElementById("progfill-" + type);
            const loc = modpack_folders[id];
            fs.rmSync(loc + "\\ampixupdater", {
                recursive: true,
                force: true,
            });
            fs.rmSync(loc + "\\mods", { recursive: true, force: true });
            fs.rmSync(loc + "\\base.zip", {
                recursive: true,
                force: true,
            });
            fs.mkdirSync(loc + "\\ampixupdater");
            status("status-" + type, "Letöltés...");
            canswitchpage = false;
            progress.style.width = "0%";
            show("progress-" + type);
            show("status-" + type);
            hide("downloadpack-" + type);
            hide("delpack-" + type);
            var req = request({
                method: "GET",
                uri: "https://cdn.ampix.hu/" + type + "/base.zip",
            });
            req.pipe(fs.createWriteStream(loc + "\\base.zip"));
            req.on("response", function (data) {
                all = data.headers["content-length"];
            });
            req.on("data", function (chunk) {
                current += chunk.length;
                var percent = (current * 100) / all;
                progress.style.width = percent.toFixed(0) + "%";
            });
            req.on("end", async function () {
                status("status-" + type, "Kicsomagolás...");
                hide("progress-" + type);
                decompress(loc + "\\base.zip", loc + "\\").then(async (files) => {
                    fs.rmSync(loc + "\\base.zip", {
                        force: true,
                    });
                    request("https://cdn.ampix.hu/" + type + "/ver.txt")
                        .pipe(fs.createWriteStream(loc + "\\ampixupdater\\ver.txt"))
                        .on("close", async function () {
                            location.reload();
                        });
                });
            });
        }, 100);
    }
}

async function delpack(type) {
    let id = getId(type);
    setTimeout(async () => {
        fs.rmSync(configdir + type + ".txt", {
            recursive: true,
            force: true,
        });
        const loc = modpack_folders[id];
        fs.rmSync(loc + "\\ampixupdater", { recursive: true, force: true });
        fs.rmSync(loc + "\\simple-rpc", { recursive: true, force: true });
        fs.rmSync(loc + "\\mods", { recursive: true, force: true });
        fs.rmSync(loc + "\\base.zip", { recursive: true, force: true });
        fs.rmSync(loc + "\\config", { recursive: true, force: true });
        location.reload();
    }, 100);
}

function loaderin() {
    if (modpack_folders.length === modpacks.name.length) {
        for (let i = 0; i < modpacks.name.length; i++) {
            loadbuttons(modpacks.name[i], "load");
        }
    }
}

function checkupdates(item, id) {
    if (modpacks.downloadable[id] == false) {
        loadbuttons(item, "nodown");
    } else {
        fs.readFile(multimc + modpacks.title[id] + "\\.minecraft\\ampixupdater\\ver.txt", "utf8", (err, data) => {
            if (!data) {
                return loadbuttons(item, "new");
            }
            request.get("https://cdn.ampix.hu/" + item + "/ver.txt", function (err, res, body) {
                if (!body) return;
                if (data === body) {
                    loadbuttons(item, "noupdate");
                } else {
                    loadbuttons(item, "update");
                }
            });
        });
    }
}

function loadbuttons(item, mode) {
    let id = getId(item);
    setTimeout(async () => {
        if (mode === "load") {
            setTimeout(() => {
                hide("loadbox");
                document.getElementById("modpacks").innerHTML += `<div style='background-image: url("https://cdn.ampix.hu/updater/logos/${modpacks.name[id]}.png");background-repeat: no-repeat;background-size: 75px;background-position: center 10%;padding: 25px;border-radius: 10px;background-color: #222;margin-bottom:10px;margin-top:10px;'>
            <h3 class="spectext">${modpacks.title[id]}</h3>
            <button
              class="specbutton donebutton hide"
              id="done-${modpacks.name[id]}"
            ></button>
            <button
              onclick="setfolder('${modpacks.name[id]}')"
              class="specbutton folderbutton hide"
              id="setfolder-${modpacks.name[id]}"
            ></button>
            <button
              onclick="updatepack('${modpacks.name[id]}')"
              class="specbutton updatebutton hide"
              id="downloadpack-${modpacks.name[id]}"
            ></button>
            <button
              onclick="delpack('${modpacks.name[id]}')"
              class="specbutton delbutton hide"
              id="delpack-${modpacks.name[id]}"
            ></button>
            <div class="progress hide" id="progress-${modpacks.name[id]}">
              <div class="progress_fill" id="progfill-${modpacks.name[id]}"></div>
            </div>
            <h3 class="hide" id="status-${modpacks.name[id]}">Nincs új frissités</h3>
          </div>`;
                setTimeout(() => {
                    if (modpack_folders[id] === "none") {
                        show("setfolder-" + modpacks.name[id]);
                    } else {
                        checkupdates(modpacks.name[id], id);
                    }
                }, 100);
            }, 100);
        }
        if (mode === "new") {
            hide("setfolder-" + item);
            hide("delpack-" + item);
            hide("done-" + item);
            hide("status-" + item);
            hide("progress-" + item);
            show("downloadpack-" + item);
        }
        if (mode === "update") {
            hide("setfolder-" + item);
            hide("done-" + item);
            hide("progress-" + item);
            show("downloadpack-" + item);
            show("status-" + item);
            show("delpack-" + item);
            status("status-" + item, "Frissités elérhető!");
        }
        if (mode === "noupdate") {
            hide("setfolder-" + item);
            hide("downloadpack-" + item);
            hide("progress-" + item);
            show("status-" + item);
            show("done-" + item);
            show("delpack-" + item);
            status("status-" + item, "Legújabb verzió");
        }
        if (mode === "nodown") {
            hide("setfolder-" + item);
            hide("downloadpack-" + item);
            hide("progress-" + item);
            show("status-" + item);
            hide("done-" + item);
            hide("delpack-" + item);
            status("status-" + item, "A letöltés nem engedélyezett.");
        }
    }, 100);
}

function loadtext() {
    let box = document.getElementById("settbox");
    while (box.firstChild) {
        box.removeChild(box.lastChild);
    }
    for (let i = 0; i < modpacks.name.length; i++) {
        let modpack = modpacks.name[i];
        box.innerHTML += `<div class="element">
            <h3>${modpacks.title[i]} Mappája:</h3>
            <h3 id="${modpack}-dir" class="foldertext">Betöltés...</h3>
            <button onclick="setfolder('${modpack}')">Módosítás</button>
          </div>`;
        fs.readFile(configdir + modpack + ".txt", "utf8", function (err, data) {
            if (!data) {
                document.getElementById(modpack + "-dir").innerHTML = "Nincs megadva";
            } else {
                document.getElementById(modpack + "-dir").innerHTML = data;
            }
        });
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function load() {
    // modpacks.forEach(loadmodpack);
    // getWarn();
    // modpack_folders = [];

    fetch("https://cdn.ampix.hu/updater/modpacks.json", { cache: "no-store" })
        .then(async (response) => {
            if (response.ok) {
                hide("loadbox");
                response.json().then((data) => {
                    fs.readFile(configdir + "multimc.txt", "utf8", function (err, filedata) {
                        if (filedata) {
                            multimc = filedata;
                            show("verbox");
                            canswitchpage = true;
                            modpacks = data;
                            modpack_folders = [];
                            modpacks.name.forEach(loadmodpack);
                        } else {
                            show("multi-box");
                            document.getElementById("multi-folder").innerHTML = configdir + "MultiMC";
                            //setmultimc();
                        }
                    });
                });
            } else {
                document.getElementById("loadbox-text").innerHTML = "Sikertelen csatlakozás a szerverre / Nincs internet";
            }
        })
        .catch((error) => {
            document.getElementById("loadbox-text").innerHTML = "Sikertelen csatlakozás a szerverre / Nincs internet";
        });
}
function switchPage(pagee) {
    if (canswitchpage) {
        if (page != pagee) {
            document.getElementById(page).classList.remove("active");
            page = pagee;
            document.getElementById(page).classList.add("active");
            if (page === "Kezdőlap") {
                hide("Beállítások-box");
                show("Kezdőlap-box");
                loaded_modpacks = [];
                modpack_folders = [];
                document.getElementById("modpacks").innerHTML = "";
                modpacks.name.forEach(loadmodpack);
            }
            if (page === "Beállítások") {
                hide("Kezdőlap-box");
                show("Beállítások-box");
                loadtext();
            }
        }
    }
}
function doModal(what) {
    let modal = document.getElementById("updatebox");
    if (what === "open") {
        modal.showModal();
    }
    if (what === "close") {
        modal.close();
        hasupdate = false;
    }
}

async function installmmc() {
    let installo = document.getElementById("multi-folder").innerHTML;
    if (!document.getElementById("multimcModeId").checked) {
        hide("multi-base");
        show("multi-install");
        let progress = document.getElementById("multi-progfill");
        var all = 0;
        var current = 0;
        status("multi-status", "Letöltés...");
        var req = request({
            method: "GET",
            uri: "https://files.multimc.org/downloads/mmc-stable-win32.zip",
        });
        req.pipe(fs.createWriteStream(installo + "\\multimc.zip"));
        req.on("response", function (data) {
            all = data.headers["content-length"];
        });
        req.on("data", function (chunk) {
            current += chunk.length;
            var percent = (current * 100) / all;
            progress.style.width = percent.toFixed(0) + "%";
        });
        req.on("end", async function () {
            status("multi-status", "Kicsomagolás...");
            decompress(installo + "\\multimc.zip", installo + "\\").then(async (files) => {
                fs.rmSync(installo + "\\multimc.zip", {
                    force: true,
                });
                fs.writeFile(configdir + "multimc.txt", installo, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                mv(installo + "\\MultiMC", installo, { mkdirp: false, clobber: false }, function (err) {
                    if (err) {
                        throw err;
                    } else {
                        location.reload();
                    }
                });
                fs.mkdirSync(installo + "\\instances");
            });
        });
    } else {
        fs.writeFile(configdir + "multimc.txt", installo + "\\MultiMC", (err) => {
            if (err) {
                console.log(err);
            }
        });
        location.reload();
    }
}

load();
