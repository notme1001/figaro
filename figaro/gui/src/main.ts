import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import serve from 'electron-serve';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

const loadURL = serve({ directory: path.resolve(__dirname, '..', 'web', 'public'), });
let win: BrowserWindow;

import conf from './config/conf.json';

function createWindow (): void {
  const sconf: string = path.resolve(__dirname, '..', '..', 'server', 'conf.json');
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    show: false,
  });
  const figaro: ChildProcessWithoutNullStreams = spawn(process.platform === 'win32' ? 'python' : '/usr/bin/env python3', [ path.resolve(__dirname, '..', '..', '..', 'figaro.py'), '-s', ]);
  figaro.stdout.once('data', () => {
    console.log('Got data ... ');

    // process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
    // win.webContents.openDevTools();
    win.removeMenu();
    // win.loadURL(`http://${conf.host}:${conf.port}`);
    // win.loadURL(`http://localhost:8000/`);

    // win.loadURL('about:blank');
    win.webContents.executeJavaScript(`localStorage.setItem('no-logout', true);`);
    win.webContents.executeJavaScript(`localStorage.setItem('tkn', '${fs.readFileSync(path.resolve(__dirname, '..', '.tkn'))}');`);
    loadURL(win);
    win.once('ready-to-show', () => win.show());
  });
  figaro.stdout.on('data', (data) => console.log(data.toString()));
  figaro.stderr.on('data', (data) => console.log(data.toString()));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (win === null) createWindow();
});
