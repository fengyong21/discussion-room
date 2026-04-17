const { app, BrowserWindow, Tray, Menu, screen, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 隐藏 Dock 图标（Mac）
  if (app.dock) {
    app.dock.hide();
  }

  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setIgnoreMouseEvents(false, { forward: true });
  mainWindow.loadFile(path.join(__dirname, 'pet.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('小司 - 公司宠物');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🐾 小司',
      enabled: false
    },
    { type: 'separator' },
    {
      label: '👋 打招呼',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.executeJavaScript('petSay("嗨老板！我在呢~ 😊"); petAction("jump");');
        }
      }
    },
    {
      label: '😴 睡觉 / ☀️ 醒来',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.executeJavaScript('if(isSleeping){petAction("wake");petSay("老板你把我叫醒了！")}else{petAction("sleep");petSay("我先休息一下...💤")}');
        }
      }
    },
    {
      label: '📊 查看状态',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.executeJavaScript('showStatus()');
        }
      }
    },
    { type: 'separator' },
    {
      label: '❌ 退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', (e) => {
  // 防止关闭窗口时退出应用
  e.preventDefault?.();
});

app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.removeAllListeners('closed');
  }
});
