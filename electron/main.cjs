const { app, BrowserWindow, ipcMain, net, shell } = require('electron')
const path = require('node:path')

const isDevelopment = process.env.RANJI_DESKTOP_DEV === '1'

function isSafeExternalUrl(value) {
  try {
    const url = new URL(String(value || ''))
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: '#0b0d0b',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  window.webContents.setWindowOpenHandler(function ({ url }) {
    if (isSafeExternalUrl(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  window.webContents.on('will-navigate', function (event, url) {
    if (url !== window.webContents.getURL()) event.preventDefault()
  })

  window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  if (isDevelopment) window.webContents.openDevTools()
}

ipcMain.handle('ranji:open-external', async function (_, value) {
  if (!isSafeExternalUrl(value)) throw new Error('只允许打开 http 或 https 视频链接')
  await shell.openExternal(String(value))
  return true
})

ipcMain.handle('ranji:model-request', async function (_, request) {
  if (!isSafeExternalUrl(request?.url)) throw new Error('模型接口只允许使用 http 或 https 地址')
  const response = await net.fetch(String(request.url), {
    method: 'POST',
    headers: request.headers || {},
    body: JSON.stringify(request.body || {})
  })
  const text = await response.text()
  let data
  try { data = text ? JSON.parse(text) : {} } catch { data = { error: { message: text || '模型接口返回了无法解析的内容' } } }
  return { status: response.status, data }
})

app.whenReady().then(function () {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
