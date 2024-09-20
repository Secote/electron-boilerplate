import { app, dialog } from "electron";
import { checkUrlValidity } from "../helpers/web";
import path from "path";

let mainWindow; // Reference to the mainWindow
let overlayWindow; // Reference to the overlayWindow
function setWindows(win, overlayWin) {
  mainWindow = win;
  overlayWindow = overlayWin;
}
const APP_ENDPOINT = "http://localhost:8080";

const appMenuTemplate = {
  label: "App",
  submenu: [
    // Add a new button
    // {
    //   label: "Restart Server",
    //   accelerator: "CmdOrCtrl+S",
    //   click: () => {
    //     // Send a message to the renderer process to show the overlay
    //     // Access the mainWindow from the click handler
    //     if (overlayWindow) {
    //       // Perform actions using mainWindow
    //       overlayWindow.show();
    //     }
    //     // mainWindow.loadURL(path.join(__dirname, 'text.html'));
    //     console.log(`Restart Server clicked in the menu bar`);
    //     // Execute your PowerShell script here
    //     // Example:
    //     const { exec } = require("child_process");
    //     const workingDir = path.join(__dirname, '../../', 'secote', 'webApp');
    //     const wslPath = workingDir.replace(/\\/g, '/').replace(/^([a-zA-Z]):/, '/mnt/$1').toLowerCase();
        
    //     // dialog.showMessageBox({message: workingDir});
    //     const command = `/home/secote/miniconda3/bin/conda run -n base_conda --no-capture-output bash -c 'pm2 start ecosystem.config.js --env production'`;

    //     exec(`wsl -d Ubuntu bash -c "${command}"`, { cwd : wslPath }, async (error, stdout, stderr) => {
    //       if (error) {
    //         console.error(`Error: ${error.message}`);
    //         // mainWindow.webContents.send('update-text', error.message);
    //         while (!await checkUrlValidity(APP_ENDPOINT, 2000)) {
    //           // sleep for 2 second
    //           await new Promise(r => setTimeout(r, 2000));
    //           console.log(`Waiting for ${APP_ENDPOINT} to be available...`);
    //         }
    //         // wait for 50 seconds
    //         await new Promise(r => setTimeout(r, 50000));
    //         overlayWindow.hide();
    //         return;
    //       }
    //       console.log(`Script Output: ${stdout}`);
    //       console.error(`Script Error: ${stderr}`);
    //       // Notify the renderer process that the script execution is finished
    //       if (overlayWindow) {
    //         // Perform actions using mainWindow
    //         await new Promise(r => setTimeout(r, 50000));
    //         overlayWindow.hide();
    //       }
    //     });
    //   }
    // },
    // Add a new button to reload the page
    {
      label: "Reload",
      accelerator: "CmdOrCtrl+R",
      click: (menuItem, browserWindow) => {
        if (browserWindow) {
          // Reload the current window/page
          browserWindow.reload();
        }
      }
    },
    // {
    //   label: "Quit",
    //   accelerator: "CmdOrCtrl+Q",
    //   click: () => {
    //     app.quit();
    //   }
    // }
  ]
};

export { appMenuTemplate, setWindows };
