import { app, BrowserWindow, ipcMain } from 'electron';
import io from 'nicolive.io';

let win;
let server;
app.on('ready', () => {
  win = new BrowserWindow;// ({ show: false });
  win.loadURL(`file://${process.cwd()}/index.html`);
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });

  win.webContents.once('did-finish-load', () => {
    server = io.listen(() => {
      win.webContents.send('server-ready', server.address());
    });
  });
});
ipcMain.on('hide', (event) => {
  // console.log(event.sender.id)
  win.hide();
});
