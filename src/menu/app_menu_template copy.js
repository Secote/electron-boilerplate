import { app } from "electron";
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
    {
      label: "Show Text Window",
      click: () => {
         mainWindow.loadURL(path.join(__dirname, 'text.html'));
      }
    },
    {
      label: "Show Text",
      click: () => {
        mainWindow.webContents.send('update-text', "Show my text");
      }
    },
    {
      label: "Check URL Validity",
      click: async () => {
          console.log(`Check URL Validity clicked in the menu bar`, await checkUrlValidity("http://localhost:8080", 2000));
      }
    },
    {
      label: "Show Window",
      click: () => {
        // Send a message to the renderer process to show the overlay
        // Access the mainWindow from the click handler
        if (overlayWindow) {
          // Perform actions using mainWindow
          overlayWindow.show();
          console.log(`Show Window clicked in the menu bar`);
        }
      }
    },
    {
      label: "Hide Window",
      click: () => {
        // Send a message to the renderer process to show the overlay
        // Access the mainWindow from the click handler
        if (overlayWindow) {
          // Perform actions using mainWindow
          overlayWindow.hide();
          console.log(`Hide Window clicked in the menu bar`);
        }
      }
    },
    // Add a new button
    {
      label: "Restart Server",
      click: () => {
        // Send a message to the renderer process to show the overlay
        // Access the mainWindow from the click handler
        if (overlayWindow) {
          // Perform actions using mainWindow
          overlayWindow.show();
        }
        mainWindow.loadURL(path.join(__dirname, 'text.html'));
        console.log(`Restart Server clicked in the menu bar`);
        // Execute your PowerShell script here
        // Example:
        const { exec } = require("child_process");
        const dockerComposePath = path.join(__dirname, '../../', 'secote', 'docker-compose.deploy.yml');
        mainWindow.webContents.send('update-text', dockerComposePath);
        exec("docker-compose -f ./resources/secote/docker-compose.app.yml down --remove-orphans & docker-compose -f ./resources/secote/docker-compose.app.yml up -d", async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            mainWindow.webContents.send('update-text', error.message);
            while (!await checkUrlValidity(APP_ENDPOINT, 2000)) {
              // sleep for 2 second
              await new Promise(r => setTimeout(r, 2000));
              console.log(`Waiting for ${APP_ENDPOINT} to be available...`);
            }
            overlayWindow.hide();
            return;
          }
          console.log(`Script Output: ${stdout}`);
          console.error(`Script Error: ${stderr}`);
          // Notify the renderer process that the script execution is finished
          if (overlayWindow) {
            // Perform actions using mainWindow
            overlayWindow.hide();
          }
        });
      }
    },
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
    {
      label: "Quit",
      accelerator: "CmdOrCtrl+Q",
      click: () => {
        app.quit();
      }
    }
  ]
};

export { appMenuTemplate, setWindows };
