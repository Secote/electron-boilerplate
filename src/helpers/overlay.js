// This helper remembers the size and position of your windows, and restores
// them in that place after app relaunch.
// Can be used for more than one window, just construct many
// instances of it and give each different name.

import path from "path";
const overlay = (mainWindow) => {
  const APP_ENDPOINT = "http://localhost:8080";
  const overlayFilePath = path.join(__dirname, "overlay.html");

  const show = () => {
    console.log(`Show overlay`, overlayFilePath);
    mainWindow.loadURL(overlayFilePath);
  }
  const hide = () => {
    console.log(`Hide overlay`);
    mainWindow.loadURL(APP_ENDPOINT);
  }

  return {
    show,
    hide
  };
};

export default overlay;
