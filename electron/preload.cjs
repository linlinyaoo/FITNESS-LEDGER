const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: function (url) {
    return ipcRenderer.invoke('ranji:open-external', url)
  },
  requestModel: function (request) {
    return ipcRenderer.invoke('ranji:model-request', request)
  }
})
