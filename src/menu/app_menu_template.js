import { app, shell, ipcMain, BrowserWindow } from "electron";

export default {
  label: "App",
  submenu: [
    // Add a new button
    {
      label: "Restart Server",
      click: (menuItem, browserWindow) => {
        // Send a message to the renderer process to show the overlay
        browserWindow.webContents.send("show-overlay");

        // Execute the PowerShell script
        ipcMain.once("script-execution-finished", () => {
          // Send a message to the renderer process to hide the overlay
          browserWindow.webContents.send("hide-overlay");
          console.log("Script execution finished");
          // Reload the current page
          browserWindow.reload();
        });

        // Execute your PowerShell script here
        // Example:
        const { exec } = require("child_process");
        exec("docker-compose -f ./resources/build/docker-compose.app.yml down --remove-orphans & docker-compose -f ./resources/build/docker-compose.app.yml up -d", (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            return;
          }
          console.log(`Script Output: ${stdout}`);
          console.error(`Script Error: ${stderr}`);
          // Notify the renderer process that the script execution is finished
          browserWindow.webContents.send("script-execution-finished");
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
