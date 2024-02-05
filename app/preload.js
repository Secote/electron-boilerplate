const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateText: (callback) => ipcRenderer.on('update-text', (_event, value) => callback(value)),
  displayText: (text) => ipcRenderer.send('show-text', text)
})