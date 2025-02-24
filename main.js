
console.log("Processo principal")
const { app, BrowserWindow, nativeTheme, Menu } = require('electron')

// Janela Principal
let win
const createWindow = () => {
  // a linha abaixo define o tema(claro ou escuro)
  nativeTheme.themeSource = 'dark' // (dark ou light)
  win = new BrowserWindow({
    width: 800,
    height: 600,
    // autoHideMenuBar: true,
    // minimizable: false,
    resizable: false
  })

  // menu personalizado
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))


  win.loadFile('./src/views/index.html')
}

//  Janeçla sobre
function aboutWindow() {
  nativeTheme.themeSource = 'light'
  // A linha abaixo obtém a janela principal
  const main = BrowserWindow.getFocusedWindow()
  let about
  // Estabelecer uma relação hieráquica entre janelas
  if (main) {
    // Criar tabela sobre
    about = new BrowserWindow({
      width: 360,
      height: 220,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: main,
      modal: true
    })
  }
  // Carregar o documento html na janela
  about.loadFile('./src/views/sobre.html')
}

// Iniciar A APLICAÇÃO
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
//****************************************************Reduzir logs não criticos**************************************************
app.commandLine.appendSwitch('log-level', '3')
//*********************************************************Template do menu******************************************************
const template = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label:' Cadastro do Veículo'
      },
      {
        label: ' Cadastro dos Clientes'
      },
      {
        label: 'OS'
      },
      {
        type: 'separator'
      },
      {
        label: 'Sair',
        click: () => app.quit(),
        accelerator: 'Alt+F4'
      }
    ]
  },
  {
    label: 'Relatórios',
    submenu: [
      {
        label: 'Clientes'
      },
      {
        label: 'OS abertas'
      },
      {
        label: 'OS concluídas'
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'aplicar zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar o zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'Ferramentas do Desenvolvedor',
        role: 'toggleDevTools'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
] 
