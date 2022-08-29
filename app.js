const { app, BrowserWindow, dialog, ipcMain} = require('electron')
const path = require('path')
const ejse = require('ejs-electron')
const { autoUpdater } = require("electron-updater")
let win
let updatestat = ""

//hold the array of directory paths selected by user

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

ipcMain.on( "setupdateinfo", ( event, value ) => {
  updatestat = value;
  win.webContents.send('updateinfo', (value))
});

ipcMain.on( "giveupdateinfo", () => {
  win.webContents.send('updateinfo', (updatestat))
});

function createWindow () {
      win = new BrowserWindow({
        width: 1200,
        height: 750,
        resizable: false,
        autoHideMenuBar: true,
        icon: "src/assets/icon.png",
        webPreferences: {
          preload: path.join(app.getAppPath(), 'preload.js'),
          nodeIntegration: true,
          contextIsolation: false
        },
        backgroundColor: '#333333'
      })
    
      win.loadFile('src/home.ejs')
      //win.removeMenu()
      //win.webContents.openDevTools()
      ejse.data("version", app.getVersion())
    }

    app.whenReady().then(() => {
      createWindow()
      
      autoUpdater.checkForUpdates()    
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow()
        }
      })
    })
    
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
    autoUpdater.on('checking-for-update', () => {
      win.webContents.send( "setupdateinfo", "Frissités keresése..." );
    })
    
    autoUpdater.on('update-available', (info) => {
      win.webContents.send( "setupdateinfo", "Frissités találva" );
    })
    
    autoUpdater.on('update-not-available', (info) => {
      win.webContents.send( "setupdateinfo", "" );
    })
    
    autoUpdater.on('error', (err) => {
      win.webContents.send( "setupdateinfo", "Hiba: " + err );
    })
    
    autoUpdater.on('download-progress', (progressObj) => {
      var percent = (progressObj.transferred * 100) / progressObj.total;
      let log_message = ' (' + percent.toFixed(0) + '%)';
      win.webContents.send( "setupdateinfo", "Letöltés " + log_message );
    })
    
    autoUpdater.on('update-downloaded', (info) => {
      win.webContents.send( "setupdateinfo", "Frissités letöltve, zárd be az updatert a telepítéshez.");
    });