const { app, BrowserWindow, dialog, ipcMain} = require('electron')
const path = require('path')
const ejse = require('ejs-electron')
const { autoUpdater } = require("electron-updater")
let win
const dispatch = (data) => {
  win.webContents.send('message', data)
}

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
      ejse.data("version", app.getVersion())
    }

    app.whenReady().then(() => {
      createWindow()
      autoUpdater.checkForUpdatesAndNotify()    
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
      win.webContents.send('checkforupdate');
    })
    
    autoUpdater.on('update-available', (info) => {
      win.webContents.send('hasupdate')
    })
    
    autoUpdater.on('update-not-available', (info) => {
      win.webContents.send('noupdate')
    })
    
    autoUpdater.on('error', (err) => {
      let tipo
      win.webContents.send('error', (tipo, err))
    })
    
    autoUpdater.on('download-progress', (progressObj) => {
      let tipo
      let log_message = "Sebesség: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      win.webContents.send('updatedown', (tipo, log_message))
    })
    
    autoUpdater.on('update-downloaded', (info) => {
      win.webContents.send('updatedone');
    });