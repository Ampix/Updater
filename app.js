const { app, BrowserWindow } = require('electron')
const path = require('path')
const ejse = require('ejs-electron')
const { autoUpdater } = require("electron-updater")
let win
const dispatch = (data) => {
  win.webContents.send('message', data)
}

function createWindow () {
      win = new BrowserWindow({
        width: 1200,
        height: 750,
        resizable: false,
        icon: "src/assets/icon.png",
        webPreferences: {
          preload: path.join(__dirname, 'preload.js', 'src', "temps", "assets"),
          nodeIntegration: true,
          contextIsolation: false
        },
        backgroundColor: '#333333'
      })
    
      win.loadFile('src/home.ejs')
      ejse.data("version", app.getVersion())
      win.removeMenu()
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
      sendStatusToWindow('Checking for update...')
    })
    
    autoUpdater.on('update-available', (info) => {
      sendStatusToWindow('Update available.')
    })
    
    autoUpdater.on('update-not-available', (info) => {
      sendStatusToWindow('Update not available.')
    })
    
    autoUpdater.on('error', (err) => {
      sendStatusToWindow('Error in auto-updater. ' + err)
    })
    
    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      sendStatusToWindow(log_message);
    })
    
    autoUpdater.on('update-downloaded', (info) => {
      sendStatusToWindow('Update downloaded');
    });