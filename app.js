const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const remoteMain = require("@electron/remote/main");
remoteMain.initialize();
const path = require("path");
const ejse = require("ejs-electron");
const { autoUpdater } = require("electron-updater");
const { Octokit } = require("octokit");
const fs = require("fs");
const os = require("os");
const username = os.userInfo().username;
var modpacks = [];
var modpack_folders = [];
var loaded_modpacks = [];
var multimc = "";
const request = require("request");
const decompress = require("decompress");
const https = require("https");
var mv = require("mv");
let configdir = "C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater\\";

const octokit = new Octokit({
    auth: "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",
});

var win;
var splash;
var dev = !app.isPackaged;
app.disableHardwareAcceleration();

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getId(what) {
    for (let i = 0; i < modpacks.name.length; i++) {
        if (modpacks.name[i] === what) {
            return i;
        }
    }
}

let dir;

ipcMain.on("selectdir", (event, name, title) => {
    dir = dialog
        .showOpenDialog(win, {
            title: title + " Mappaválasztás",
            properties: ["openDirectory"],
        })
        .then((result) => {
            if (result.canceled) return;
            let mappa = result.filePaths[0];
            win.webContents.send("selectdirback", name, mappa);
        });
});

ipcMain.on("setup", () => {
    loadscripts();
});

ipcMain.on("setpage", (evt, page) => {
    if (page == "Kezdőlap") {
        loaded_modpacks = [];
        modpack_folders = [];
        sethtml("modpacks", "");
        modpacks.name.forEach(loadmodpack);
    }
    if (page == "Beállítások") {
        loadtext();
    }
});

ipcMain.on("app/close", () => {
    app.quit();
});

ipcMain.on("app/minimize", () => {
    win.minimize();
});

async function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 750,
        frame: false,
        resizable: false,
        autoHideMenuBar: true,
        show: false,
        icon: "src/assets/icon.png",
        webPreferences: {
            preload: path.join(app.getAppPath(), "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
        backgroundColor: "#333333",
    });
    splash = new BrowserWindow({
        width: 300,
        height: 150,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        icon: "src/assets/icon.png",
        webPreferences: {
            preload: path.join(app.getAppPath(), "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    splash.loadFile("src/splash.ejs");
    splash.center();
    win.loadFile("src/main.ejs");
    win.center();
    remoteMain.enable(win.webContents);
    if (!dev) {
        splash.removeMenu();
        win.removeMenu();
    }
    ejse.data("version", app.getVersion());
    ejse.data("dev", dev);
}

app.whenReady().then(() => {
    if (!fs.existsSync("C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater")) {
        fs.mkdirSync("C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater");
    }
    createWindow();
    if (!dev) autoUpdater.checkForUpdatesAndNotify();
    if (dev) loader();
});

async function loader() {
    splash.close();
    win.show();
    await octokit
        .request("GET /repos/{owner}/{repo}/releases/latest", {
            owner: "Ampix",
            repo: "Updater-Release",
        })
        .catch((err) => {
            throw err;
        })
        .then((Response) => {
            // * console.log(Response.data.name); Verzió
            // * console.log(Response.data.body); Szöveg
            let configdir = "C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater\\";
            fs.exists(configdir + "ver.txt", (vari) => {
                if (vari) {
                    fs.readFile(configdir + "ver.txt", "utf8", (err, data) => {
                        if (data != Response.data.name) {
                            win.webContents.send("showupdateinfo", Response.data.name, Response.data.body);
                            if (!dev) {
                                fs.writeFile(configdir + "ver.txt", Response.data.name, (err2) => {});
                            }
                        }
                    });
                } else {
                    win.webContents.send("showupdateinfo", Response.data.name, Response.data.body);
                    if (!dev) {
                        fs.writeFile(configdir + "ver.txt", Response.data.name, (err3) => {});
                    }
                }
            });
        });
    //shell.openPath("C:\\Users\\" + username + "\\AppData\\Roaming");
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
autoUpdater.on("checking-for-update", () => {});

autoUpdater.on("update-available", (info) => {});

autoUpdater.on("update-not-available", async (info) => {
    loader();
});

autoUpdater.on("error", (err) => {});

autoUpdater.on("download-progress", (progressObj) => {
    var percent = (progressObj.transferred * 100) / progressObj.total;
});

autoUpdater.on("update-downloaded", (info) => {
    autoUpdater.quitAndInstall();
});

// * SCRIPTING

function hide(target) {
    win.webContents.send("edithtml", target, "hide", undefined);
}

function show(target) {
    win.webContents.send("edithtml", target, "show", undefined);
}

function status(target, to) {
    win.webContents.send("edithtml", target, "status", to);
}

function sethtml(target, to) {
    win.webContents.send("sethtml", target, to);
}

function addhtml(target, to) {
    win.webContents.send("addhtml", target, to);
}

async function loadscripts() {
    // modpacks.forEach(loadmodpack);
    // getWarn();
    // modpack_folders = [];

    https
        .get("https://cdn.ampix.hu/updater/modpacks.json", (res) => {
            let cucc = "";
            res.on("data", (chunk) => {
                cucc += chunk;
            });
            res.on("end", () => {
                cucc = JSON.parse(cucc);
                hide("loadbox");
                fs.readFile(configdir + "multimc.txt", "utf8", function (err, filedata) {
                    if (filedata) {
                        multimc = filedata;
                        show("verbox");
                        canswitchpage = true;
                        modpacks = cucc;
                        modpack_folders = [];
                        modpacks.name.forEach(loadmodpack);
                    } else {
                        show("multi-box");
                        sethtml("multi-folder", configdir + "MultiMC");
                        //setmultimc();
                    }
                });
            });
        })
        .on("error", (err) => {
            sethtml("loadbox-text", "Sikertelen csatlakozás a szerverre / Nincs internet");
        });
}

function loadmodpack(item) {
    let id = getId(item);
    setTimeout(async () => {
        if (loaded_modpacks.includes(item) == false) {
            if (modpack_folders.length == id) {
                loaded_modpacks.push(item);
                fs.readFile(multimc + "\\instances\\" + modpacks.title[id] + "\\.minecraft\\ampixupdater\\ver.txt", "utf8", function (err2, data2) {
                    if (!data2) {
                        modpack_folders.push("none");
                    } else {
                        modpack_folders.push("van");
                    }
                    loaderin();
                });
            } else {
                loadmodpack(item);
            }
        }
    }, 100);
}

function loaderin() {
    if (modpack_folders.length === modpacks.name.length) {
        for (let i = 0; i < modpacks.name.length; i++) {
            loadbuttons(modpacks.name[i], "load");
        }
    }
}

function loadbuttons(item, mode) {
    let id = getId(item);
    setTimeout(async () => {
        if (mode === "load") {
            setTimeout(() => {
                hide("loadbox");
                addhtml(
                    "modpacks",
                    `<div style='background-image: url("https://cdn.ampix.hu/updater/logos/${modpacks.name[id]}.png");background-repeat: no-repeat;background-size: 75px;background-position: center 10%;padding: 25px;border-radius: 10px;background-color: #222;margin-bottom:10px;margin-top:10px;'>
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
          </div>`
                );
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

function loadtext() {
    sethtml("settbox", "se");
    karesztarin = "";
    for (let i = 0; i < modpacks.name.length; i++) {
        let modpack = modpacks.name[i];
        karesztarin += `<div class="element">
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
    sethtml("settbox", karesztarin);
}
