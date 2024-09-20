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
const util = require('util');
const execAsync = util.promisify(exec);

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
  const command = `/home/secote/miniconda3/bin/conda run -n base_conda --no-capture-output bash -c 'pm2 start ecosystem.config.js --env production'`;

  try {

    // 获取当前 WSL 的 IP 地址
    const { stdout: ipOutput } = await execAsync(`wsl -d Ubuntu bash -c "ip addr show eth0 | grep 'inet ' | awk '{print \\$2}' | cut -d/ -f1"`);
    const WSL_IP = ipOutput.trim();
  
    const ports = [5050, 8080, 9090, 9091];
  
    for (const port of ports) {
      // 删除旧的端口转发规则
      try {
        await execAsync(`netsh interface portproxy delete v4tov4 listenport=${port} listenaddress=0.0.0.0`);
      } catch (error) {
        console.error(`删除端口 ${port} 的旧端口转发规则时出错：${error.message}`);
        // 继续执行，因为规则可能不存在
      }
  
      // 添加新的端口转发规则
      await execAsync(`netsh interface portproxy add v4tov4 listenport=${port} listenaddress=0.0.0.0 connectport=${port} connectaddress=${WSL_IP}`);
    }
  
    // 启动服务器
    await execAsync(`wsl -d Ubuntu bash -c "${command}"`, { cwd: workingDir });
  
    // 加载应用程序
    mainWindow.loadURL(APP_ENDPOINT);
    overlayPage.hide();
  
  } catch (error) {
    console.error(`发生错误：${error.message}`);
    overlayPage.hide();
    dialog.showErrorBox("错误", `启动服务器时发生错误：${error.message}`);
  }
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

function stopPM2Service() {
  const command = `/home/secote/miniconda3/bin/conda run -n base_conda --no-capture-output bash -c 'torchserve --stop && pm2 delete all'`;
  try {
    exec(`wsl -d Ubuntu bash -c "${command}"`);
    console.log('服务已成功停止。');
  } catch (error) {
    console.error('停止服务时发生错误：', error);
  }
}

app.on('before-quit', () => {
  stopPM2Service(); // 同步停止 PM2 服务
});

app.on('window-all-closed', () => {
  app.quit();
});
