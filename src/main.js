const os = require("os");
var fs = require("fs");
const { ipcRenderer, shell, webFrame } = require("electron");
let canswitchpage = false;
let page = "Kezdőlap";
const { exec } = require("child_process");
//  minus.addEventListener("click", minimize);
//  close_app.addEventListener("click", closeapp);

function closeapp() {
    ipcRenderer.send("app/close");
}

function minimize() {
    ipcRenderer.send("app/minimize");
}

function startmmc() {
    exec("multimc", { cwd: multimc }, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

ipcRenderer.on("selectdirback", (evt, name, mappa) => {
    if (name === "multimc") {
        document.getElementById("multi-folder").innerHTML = mappa;
    } else {
        fs.writeFile(configdir + name + ".txt", mappa, (err) => {
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
ipcRenderer.on("showupdateinfo", (evt, name, log) => {
    hasupdate = true;
    let kacko = document.createElement("div");
    kacko.innerHTML = `<h1 class="spectext" style="margin-bottom: 20px !important">Frissitési napló v${name}</h1><md-block style="text-align: left !important;">${log}</md-block>`;
    document.getElementById("updatetext").appendChild(kacko);
    setTimeout(() => {
        doModal("open");
    }, 50);
});

ipcRenderer.on("sethtml", (evt, html, extra) => {
    document.getElementById(html).innerHTML = extra;
});

ipcRenderer.on("addhtml", (evt, html, extra) => {
    document.getElementById(html).innerHTML += extra;
});

ipcRenderer.on("edithtml", (evt, name, what, extra) => {
    if (what == "show") {
        document.getElementById(name).classList.remove("hide");
    }
    if (what == "hide") {
        document.getElementById(name).classList.add("hide");
    }
    if (what == "status") {
        document.getElementById(name).innerHTML = extra;
    }
});

function setfolder(type) {
    if (type === "multimc") {
        ipcRenderer.send("selectdir", "multimc", "MultiMC");
    } else {
        let id = getId(type);
        setTimeout(async () => {
            ipcRenderer.send("selectdir", type, modpacks.title[id]);
        }, 100);
    }
}

function openLink(link) {
    shell.openExternal(link);
}

window.addEventListener("load", (event) => {
    document.getElementById("Kezdőlap").classList.add("active");
});

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

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
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
                ipcRenderer.send("setpage", "Kezdőlap");
            }
            if (page === "Beállítások") {
                hide("Kezdőlap-box");
                show("Beállítások-box");
                ipcRenderer.send("setpage", "Beállítások");
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
        fs.writeFile(configdir + "multimc.txt", installo, (err) => {
            if (err) {
                console.log(err);
            }
        });
        location.reload();
    }
}

ipcRenderer.send("setup");
