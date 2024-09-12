// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu, ipcMain, shell, dialog } from "electron";
import {appMenuTemplate, setWindows} from "./menu/app_menu_template";
import editMenuTemplate from "./menu/edit_menu_template";
import devMenuTemplate from "./menu/dev_menu_template";
import createWindow from "./helpers/window";
import overlayView from "./helpers/overlay";
import { checkUrlValidity } from "./helpers/web";

const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");
let flaskProcess = null; // 用于存储Flask服务器的子进程

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";
// import path from "path";
console.log("Environment is ", env.name);
console.log(process.versions.node);

app.commandLine.appendSwitch("no-sandbox"); 


// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

const APP_ENDPOINT = "http://localhost:8080";
let overlayPage;

const setApplicationMenu = () => {
  const menus = [appMenuTemplate, editMenuTemplate];
  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// We can communicate with our window (the renderer process) via messages.
const initIpc = () => {
  ipcMain.on("need-app-path", (event, arg) => {
    event.reply("app-path", app.getAppPath());
  });
  ipcMain.on("open-external-link", (event, href) => {
    shell.openExternal(href);
  });
};

async function startServerIfNecessary(mainWindow) {

  overlayPage.show();

  const workingDir = path.join(__dirname, '../../', 'secote', 'webApp');
  // const wslPath = workingDir.replace(/\\/g, '/').replace(/^([a-zA-Z]):/, '/mnt/$1').toLowerCase();
  const command = `/home/secote/miniconda3/bin/conda run -n base_conda --no-capture-output bash -c 'pm2 start ecosystem.config.js --env production'`;
  // dialog.showMessageBox({message: workingDir});
  exec(`wsl -d Ubuntu bash -c "${command}"`, { cwd : workingDir }, (error, stdout, stderr) => {
    if (error) {
      console.error(`==Error: ${error.message}`);
      overlayPage.hide();
      dialog.showErrorBox("Error", `Error starting server: ${error.message}`);
      return;
    }
    mainWindow.loadURL(APP_ENDPOINT);
    overlayPage.hide();
  });
  
}

app.on("ready", () => {
  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      // Spectron needs access to remote module
      enableRemoteModule: env.name === "production",
      preload: path.join(__dirname, 'preload.js'),
    }
  });
  overlayPage = overlayView(mainWindow);

  setWindows(mainWindow, overlayPage); // Pass a reference to the mainWindow to the menu template

  console.log(" setApplicationMenu ");
  setApplicationMenu();
  console.log(" initIpc ");
  initIpc();
  console.log(" startServerIfNecessary ");
  startServerIfNecessary(mainWindow);
  // mainWindow.webContents.openDevTools()
});

// 停止Flask服务器
function stopFlaskServer() {
  if (flaskProcess !== null) {
    flaskProcess.kill('SIGINT'); 
    flaskProcess = null;
  }
}

// 停止Docker容器
function stopDockerContainers() {
  const dockerComposePath = path.join(__dirname, '../../', 'secote', 'docker-compose.deploy.yml');
  exec(`docker-compose -f "${dockerComposePath}" stop`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error stopping docker containers: ${error.message}`);
      return;
    }
    console.log(`Docker containers stopped: ${stdout}`);
  });
}

app.on('before-quit', () => {
  // stopFlaskServer(); // 在应用退出前停止Flask服务器
  // stopDockerContainers(); // 停止Docker容器 
});

app.on("window-all-closed", () => {
  app.quit();
});
