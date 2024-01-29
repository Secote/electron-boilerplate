// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu, ipcMain, shell, net, BrowserWindow, ipcRenderer } from "electron";
import appMenuTemplate from "./menu/app_menu_template";
import editMenuTemplate from "./menu/edit_menu_template";
import devMenuTemplate from "./menu/dev_menu_template";
import createWindow from "./helpers/window";

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";
import path from "path";
console.log(env.name);

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

const APP_ENDPOINT = "http://localhost:8080";
// Add this function to create overlay window
const createOverlayWindow = (mainWindow) => {
  const overlayFilePath = path.join(__dirname, "overlay.html");
  const overlayWindow = new BrowserWindow({ parent: mainWindow, modal: false, transparent: true, show: false, center: true, frame: false, useContentSize: true, webPreferences: { nodeIntegration: true, defaultFontFamily: 'monospace' } });
  overlayWindow.isMenuBarVisible = true;
  overlayWindow.loadURL(overlayFilePath);
  console.log(`Overlay file path: ${overlayFilePath}`);
  return overlayWindow;
};


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


// make this a synchronous function so we can return a value
function checkUrlValidity(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const request = net.request(url);

    // Set a timeout for the request
    const requestTimeout = setTimeout(() => {
      request.abort(); // Abort the request
      resolve(false); // Resolve the promise with false
    }, timeout);

    request.on('response', (response) => {
      clearTimeout(requestTimeout); // Clear the timeout

      const statusCode = response.statusCode;

      if (statusCode === 200) {
        resolve(true); // Resolve the promise with true for a valid page
      } else {
        resolve(false); // Resolve the promise with false for an invalid page
      }
    });

    request.on('error', (error) => {
      clearTimeout(requestTimeout); // Clear the timeout
      reject(error); // Reject the promise with the error
    });

    request.end();
  });
}

async function startServerIfNecessary(mainWindow) {
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
  const overlayWindow = createOverlayWindow(mainWindow);
  overlayWindow.once("ready-to-show", () => {
    overlayWindow.show();
  });
  //window.electronAPI.showOverlay();
  // Start the server if it's not running
  const { exec } = require("child_process");
  exec("docker-compose -f ./resources/build/docker-compose.app.yml up -d", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log(`Script Output: ${stdout}`);
    console.error(`Script Error: ${stderr}`);
    //window.electronAPI.hideOverloay();
  }).on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
    overlayWindow.hide();
    mainWindow.loadURL(targetUrl); });
}

app.on("ready", () => {
  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      // Spectron needs access to remote module
      enableRemoteModule: env.name === "production",
      preload: path.join(__dirname, 'preload.js')
    }
  });
  setApplicationMenu();
  initIpc();
  startServerIfNecessary(mainWindow);
});

app.on("window-all-closed", () => {
  app.quit();
});
