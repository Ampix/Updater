const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron")
const remoteMain = require("@electron/remote/main")
remoteMain.initialize()
const path = require("path")
const ejse = require("ejs-electron")
const { autoUpdater } = require("electron-updater")
const { Octokit } = require("octokit")
const fs = require("fs")
const os = require("os")
const username = os.userInfo().username

const octokit = new Octokit({
    auth: "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",
})

var win
var splash
var dev = !app.isPackaged
app.disableHardwareAcceleration()

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

let dir

ipcMain.on("selectdir", function (event, type) {
    dir = dialog
        .showOpenDialog(win, {
            title: type.title + " Mappaválasztás",
            properties: ["openDirectory"],
        })
        .then((result) => {
            if (result.canceled) return
            let mappa = result.filePaths[0]
            let stuff = {
                type: type.name,
                folder: mappa,
            }
            win.webContents.send("selectdirback", stuff)
        })
})

ipcMain.on("app/close", () => {
    app.quit()
})

ipcMain.on("app/minimize", () => {
    win.minimize()
})

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
    })
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
    })
    splash.loadFile("src/splash.ejs")
    splash.center()
    win.loadFile("src/main.ejs")
    win.center()
    remoteMain.enable(win.webContents)
    if (!dev) {
        splash.removeMenu()
    }
    ejse.data("version", app.getVersion())
    ejse.data("dev", dev)
}

app.whenReady().then(() => {
    createWindow()
    if (!dev) autoUpdater.checkForUpdatesAndNotify()
    if (dev) loader()
})

async function loader() {
    splash.close()
    win.show()
    await octokit
        .request("GET /repos/{owner}/{repo}/releases/latest", {
            owner: "Ampix",
            repo: "Updater-Release",
        })
        .then((Response) => {
            // * console.log(Response.data.name); verzió
            // * console.log(Response.data.body); log
            let configdir =
                "C:\\Users\\" + username + "\\AppData\\Roaming\\.ampixupdater\\"
            fs.exists(configdir + "ver.txt", (vari) => {
                if (vari) {
                    fs.readFile(configdir + "ver.txt", "utf8", (err, data) => {
                        if (data != Response.data.name) {
                            let stuff = {
                                name: Response.data.name,
                                log: Response.data.body,
                            }
                            win.webContents.send("showupdateinfo", stuff)
                            if (!dev) {
                                fs.writeFile(
                                    configdir + "ver.txt",
                                    Response.data.name,
                                    (err2) => {}
                                )
                            }
                        }
                    })
                } else {
                    let stuff = {
                        name: Response.data.name,
                        log: Response.data.body,
                    }
                    win.webContents.send("showupdateinfo", stuff)
                    if (!dev) {
                        fs.writeFile(
                            configdir + "ver.txt",
                            Response.data.name,
                            (err3) => {}
                        )
                    }
                }
            })
        })
    //shell.openPath("C:\\Users\\" + username + "\\AppData\\Roaming");
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})
autoUpdater.on("checking-for-update", () => {})

autoUpdater.on("update-available", (info) => {})

autoUpdater.on("update-not-available", async (info) => {
    loader()
})

autoUpdater.on("error", (err) => {})

autoUpdater.on("download-progress", (progressObj) => {
    var percent = (progressObj.transferred * 100) / progressObj.total
})

autoUpdater.on("update-downloaded", (info) => {
    autoUpdater.quitAndInstall()
})
