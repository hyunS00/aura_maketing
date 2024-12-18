// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  generateReport: ({ filePaths, code, name, platform, type }) =>
    ipcRenderer.invoke("generate-report", {
      filePaths,
      code,
      name,
      platform,
      type,
    }),
  uploadFile: () => ipcRenderer.invoke("upload-file"),
});
