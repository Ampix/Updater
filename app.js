const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const remoteMain = require("@electron/remote/main");
remoteMain.initialize();
const path = require("path");
const ejse = require("ejs-electron");
const { autoUpdater } = require("electron-updater");
const isPackaged = require("electron-is-packaged").isPackaged;

var win;
var splash;
var dev = false;
app.disableHardwareAcceleration();

if (isPackaged === false) {
  dev = true;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let dir;

ipcMain.on("selectdir", function (event, type) {
  dir = dialog
    .showOpenDialog(win, {
      title: type + " Mappaválasztás",
      properties: ["openDirectory"],
    })
    .then((result) => {
      if (result.canceled) return;
      let mappa = result.filePaths[0];
      let stuff = {
        type: type,
        folder: mappa,
      };
      win.webContents.send("selectdirback", stuff);
    });
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
      preload: path.join(app.getAppPath(), "/src/assets/scripts/preload.js"),
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
  win.loadFile("src/home.ejs");
  win.center();
  remoteMain.enable(win.webContents);
  if (!dev) {
    win.removeMenu();
    splash.removeMenu();
  }
  ejse.data("version", app.getVersion());
  ejse.data("dev", dev);
}

app.whenReady().then(async () => {
  createWindow();
  await sleep(500);
  autoUpdater.checkForUpdatesAndNotify();
  if (dev) loader();
});

function loader() {
  splash.close();
  win.show();
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
  await sleep(500);
  loader();
});

autoUpdater.on("error", (err) => {});

autoUpdater.on("download-progress", (progressObj) => {
  var percent = (progressObj.transferred * 100) / progressObj.total;
});

autoUpdater.on("update-downloaded", (info) => {
  autoUpdater.quitAndInstall();
});
