// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu, ipcMain, shell } from "electron";
import {appMenuTemplate, setWindows} from "./menu/app_menu_template";
import editMenuTemplate from "./menu/edit_menu_template";
import devMenuTemplate from "./menu/dev_menu_template";
import createWindow from "./helpers/window";
import overlayView from "./helpers/overlay";
import { checkUrlValidity } from "./helpers/web";

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";
console.log("Environment is ", env.name);

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
  console.log(`startServerIfNecessary ${APP_ENDPOINT}...`);
  const targetUrl = APP_ENDPOINT;
  try {
    const isUrlValid = await checkUrlValidity(targetUrl, 2000); // Specify timeout in milliseconds
    console.log(`isUrlValid: ${isUrlValid}`);
    if (isUrlValid) {
      console.log(`${targetUrl} is valid`);
      mainWindow.loadURL(targetUrl);
      return;
    }
  } catch (error) {
    console.error(`Error checking ${targetUrl}: ${error.message}`);
  }
  overlayPage.show();

  //window.electronAPI.show();
  // Start the server if it's not running
  const { exec } = require("child_process");
  exec("docker-compose -f ./resources/build/docker-compose.app.yml up -d", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      overlayPage.hide();
      return;
    }
    console.log(`Script Output: ${stdout}`);
    console.error(`Script Error: ${stderr}`);
    //window.electronAPI.hideOverloay();
  }).on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
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
      // preload: path.join(__dirname, 'preload.js'),

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

app.on("window-all-closed", () => {
  app.quit();
});
