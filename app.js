const { app, BrowserWindow, dialog, ipcMain} = require('electron')
const path = require('path')
const ejse = require('ejs-electron')
const { autoUpdater } = require("electron-updater")
var win
var splash
//hold the array of directory paths selected by user

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let dir

ipcMain.on('selectdirbuilders', function() {
  dir = dialog.showOpenDialog(win, {
    title: "Válasszad má' ki!", 
    properties: ['openDirectory']
  }).then(result => {
    if(result.canceled) return
    let tipo = "builders"
    let mappa = {
      tipo: "builders",
      folder: result.filePaths[0]
    }
    win.webContents.send('selectdirback', (tipo,mappa));
  })
})
ipcMain.on('selectdirt2', function() {
  dir = dialog.showOpenDialog(win, {
    title: "Válasszad má' ki!", 
    properties: ['openDirectory']
  }).then(result => {
    if(result.canceled) return
    let tipo = "twigmod2"
    let mappa = {
      tipo: "twigmod2",
      folder: result.filePaths[0]
    }
    win.webContents.send('selectdirback', (tipo,mappa));
  })
})

function createWindow () {
      win = new BrowserWindow({
        width: 1200,
        height: 750,
        resizable: false,
        autoHideMenuBar: true,
        show: false,
        icon: "src/assets/icon.png",
        webPreferences: {
          preload: path.join(app.getAppPath(), 'preload.js'),
          nodeIntegration: true,
          contextIsolation: false
        },
        backgroundColor: '#333333'
      })
      splash = new BrowserWindow({
        width: 300, 
        height: 400, 
        transparent: true, 
        frame: false, 
        alwaysOnTop: true,
        resizable: false,
        icon: "src/assets/icon.png",
        webPreferences: {
          preload: path.join(app.getAppPath(), 'preload.js'),
          nodeIntegration: true,
          contextIsolation: false
        }
   });
      splash.loadFile('src/splash.ejs');
      splash.center();
      win.loadFile('src/home.ejs')
      win.center();
      //win.removeMenu()
      //win.webContents.openDevTools()
      ejse.data("version", app.getVersion())
    }

    app.whenReady().then(async () => {
        createWindow()
        await sleep(500)
        autoUpdater.checkForUpdatesAndNotify()
    })

    function loader(){
      splash.close()
      win.show()
    }
    
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
    autoUpdater.on('checking-for-update', () => {
      splash.webContents.send("updateinfo", ("lol","search", undefined));
    })
    
    autoUpdater.on('update-available', (info) => {
      splash.webContents.send("updateinfo", ("lol","found", undefined));
    })
    
    autoUpdater.on('update-not-available', async (info) => {
      splash.webContents.send("updateinfo", ("lol", "noupdate", undefined));
      await sleep(1000)
      loader()
    })
    
    autoUpdater.on('error', (err) => {
      splash.webContents.send("updateinfo", ("lol","error", err ));
    })
    
    autoUpdater.on('download-progress', (progressObj) => {
      var percent = (progressObj.transferred * 100) / progressObj.total;
      splash.webContents.send( "updateinfo", ("lol","downloading", percent.toFixed(0) + '%' ));
    })
    
    autoUpdater.on('update-downloaded', (info) => {
      autoUpdater.quitAndInstall()
    });