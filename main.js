console.log("Processo principal")
const { app, BrowserWindow, nativeTheme, Menu, ipcMain } = require('electron')
const path = require('node:path')

// Janela Principal
let win
const createWindow = () => {
  nativeTheme.themeSource = 'dark' // (dark ou light)
  win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  win.loadFile('./src/views/index.html')
}

// Recebimento dos pedidos do renderizador para abertura de janelas (botões)
ipcMain.on('client-window', () => {
  clientWindow()
})

ipcMain.on('os-window', () => {
  osWindow()
})

// Janela sobre
function aboutWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  let about
  if (main) {
    about = new BrowserWindow({
      width: 360,
      height: 220,
      resizable: false,
      minimizable: false,
      parent: main,
      modal: true
    })
  }
  about.loadFile('./src/views/sobre.html')
}

// Janela Clientes
let client
function clientWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    client = new BrowserWindow({
      width: 1010,
      height: 720,
      resizable: false,
      parent: main,
      modal: true
    })
  }
  client.loadFile('.src/views/clientes.html')
  client.center()
}

// Janela OS
let os
function osWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    os = new BrowserWindow({
      width: 1010,
      height: 720,
      resizable: false,
      parent: main,
      modal: true
    })
  }
  os.loadFile('./src/views/OS.html')
  os.center()
}

// Iniciar a aplicação
app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
})

// Reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3')

// Template do menu
const template = [
  {
    label: 'Cadastro',
    submenu: [
      { label: 'Cadastro do Veículo' },
      { label: 'Cadastro dos Clientes', click: () => clientWindow() },
      { label: 'OS', click: () => osWindow() },
      { type: 'separator' },
      { label: 'Sair', click: () => app.quit(), accelerator: 'Alt+F4' }
    ]
  },
  {
    label: 'Relatórios',
    submenu: [
      { label: 'Clientes' },
      { label: 'OS abertas' },
      { label: 'OS concluídas' }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      { label: 'Aplicar zoom', role: 'zoomIn' },
      { label: 'Reduzir', role: 'zoomOut' },
      { label: 'Restaurar o zoom padrão', role: 'resetZoom' },
      { type: 'separator' },
      { label: 'Recarregar', role: 'reload' },
      { label: 'Ferramentas do Desenvolvedor', role: 'toggleDevTools' }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      { label: 'Sobre', click: () => aboutWindow() }
    ]
  }
]
