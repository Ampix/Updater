const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  ipcRenderer,
} = require("electron");
const path = require("path");
const ejse = require("ejs-electron");
const { autoUpdater } = require("electron-updater");
const isPackaged = require("electron-is-packaged").isPackaged;
var win;
var splash;
var dev = false;

if (isPackaged === false) {
  dev = true;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let dir;

ipcMain.on("selectdirbuilders", function () {
  dir = dialog
    .showOpenDialog(win, {
      title: "Ampix Builders Mappaválasztás",
      properties: ["openDirectory"],
    })
    .then((result) => {
      if (result.canceled) return;
      let tipo = "builders";
      let mappa = {
        tipo: "builders",
        folder: result.filePaths[0],
      };
      win.webContents.send("selectdirback", (tipo, mappa));
    });
});
ipcMain.on("selectdirt2", function () {
  dir = dialog
    .showOpenDialog(win, {
      title: "Twigmod 2 Mappaválasztás",
      properties: ["openDirectory"],
    })
    .then((result) => {
      if (result.canceled) return;
      let tipo = "twigmod2";
      let mappa = {
        tipo: "twigmod2",
        folder: result.filePaths[0],
      };
      win.webContents.send("selectdirback", (tipo, mappa));
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
  win.loadFile("src/home.ejs");
  win.center();
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
