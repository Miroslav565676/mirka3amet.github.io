const { app, BrowserWindow, Menu, session } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    frame: false,
    backgroundColor: "#000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // hide default menu
  Menu.setApplicationMenu(null);

  // load the game
  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));

  // prevent new windows / external links
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  // ESC to exit fullscreen, F11 toggle, Alt+F4 still works
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "Escape" && input.type === "keyDown") {
      mainWindow.setFullScreen(false);
      mainWindow.setKiosk(false);
    }
    if (input.key === "F11" && input.type === "keyDown") {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
