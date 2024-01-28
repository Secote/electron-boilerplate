// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu, ipcMain, shell } from "electron";
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

// Add this function to create overlay window
const createOverlayWindow = (mainWindow) => {
  const overlayWindow = createWindow("overlay", {
    width: 200,
    height: 200,
    parent: mainWindow,
    modal: true,
    frame: false,
    show: false,
    webPreferences: {
      enableRemoteModule: env.name === "production",
      nodeIntegration: true
    }
  });
  const overlayFilePath = path.join(__dirname, "overlay.html");
  console.log(`Overlay file path: ${overlayFilePath}`);
  overlayWindow.loadURL(`file://${overlayFilePath}`);

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
const initIpc = (mainWindow) => {
  ipcMain.on("need-app-path", (event, arg) => {
    event.reply("app-path", app.getAppPath());
  });
  ipcMain.on("open-external-link", (event, href) => {
    shell.openExternal(href);
  });
  const overlayWindow = createOverlayWindow(mainWindow);
  ipcMain.on("show-overlay", () => {
    overlayWindow.show();
    console.log("Overlay window shown");
  });

  ipcMain.on("hide-overlay", () => {
    overlayWindow.hide();
    console.log("Overlay window hidden");
  });
};

app.on("ready", () => {
  setApplicationMenu();


  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      // Spectron needs access to remote module
      enableRemoteModule: env.name === "production"
    }
  });
  initIpc(mainWindow);
  mainWindow.loadURL(
    "http://localhost:8080"
  );

  if (env.name === "development") {
    mainWindow.openDevTools();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
