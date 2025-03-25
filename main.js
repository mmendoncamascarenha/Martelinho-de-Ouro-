console.log("Processo principal");


const { app, BrowserWindow, nativeTheme, Menu, ipcMain } = require('electron');

// esta linha esta relacionada ao preload.js
const path = require('node:path');

// importação dos metodos conectar e desconectar 
const { conectar, desconectar } = require('./database')

// importação dos Schema Clientes da camada model
const clientModel = require('./src/models/Clientes.js') 

const clientes = require('./src/models/Clientes.js')

// Janela Principal
let win;
const createWindow = () => {
  nativeTheme.themeSource = 'dark'; // Tema padrão
  win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  win.loadFile('./src/views/index.html');
};

// Janela Sobre
function aboutWindow() {
  nativeTheme.themeSource = 'dark';
  const main = BrowserWindow.getFocusedWindow();
  let about;
  if (main) {
    about = new BrowserWindow({
      width: 360,
      height: 220,
      resizable: false,
      minimizable: false,
      parent: main,
      modal: true
    });
  }
  about.loadFile('./src/views/sobre.html');
}

// Janela Clientes
let client;
function clientWindow() {
  nativeTheme.themeSource = 'dark';
  const main = BrowserWindow.getFocusedWindow();
  if (main) {
    client = new BrowserWindow({
      width: 1010,
      height: 720,
      //autoHideMenuBar:
      //resizable: false,
      parent: main,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    });
  }
  client.loadFile('./src/views/clientes.html'); // Nome atualizado
  client.center();
}
// Janela OS
let os;
function osWindow() {
  nativeTheme.themeSource = 'dark';
  const main = BrowserWindow.getFocusedWindow();
  if (main) {
    os = new BrowserWindow({
      width: 1010,
      height: 720,
      resizable: false,
      parent: main,
      modal: true
    });
  }
  os.loadFile('./src/views/OS.html'); // Nome atualizado
  os.center();
}

// Janela CARRO
let carro;
function carroWindow() {
  nativeTheme.themeSource = 'dark';
  const main = BrowserWindow.getFocusedWindow();
  if (main) {
    carro = new BrowserWindow({
      width: 1010,
      height: 720,
      resizable: false,
      parent: main,
      modal: true
    });
  }
  carro.loadFile('./src/views/carros.html'); // Nome atualizado
  carro.center();
}

// Iniciar a aplicação
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3');

// Template do menu
const template = [
  {
    label: 'Cadastro',
    submenu: [
      { label: 'Cadastro do Veículo', click: () => carroWindow() },
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
];

// Recebimento dos pedidos do renderizador para abertura de janelas (botões)
ipcMain.on('client-window', () => {
  clientWindow();
});

ipcMain.on('os-window', () => {
  osWindow();
});

ipcMain.on('carro-window', () => {
  carroWindow();
});


// =======================================================================================================================================================
// == Clientes -  CRUD Create
// recebimento do objeto que contem os dados do cliente
ipcMain.on('new-client', async (event, client) => {
  // importante ! teste de recebimento dos dados do cliente
  console.log(client)
  // cadastrar a estrutura de dados no banco MongoDB
  try {
    // criar uma nova de estrutura de dados usando a classe modelo. Atenção !
    // Os atributos precisam ser identicos ao modelo de dados cliente.js e os valores
    // sao definidos pelo conteudo do objeto cliente
    const newClient = new clientModel({
      nomeCliente: client.nameCli,
      cpfCliente: client.cpfCli,
      emailCliente: client.emailCli,
      foneCliente: client.phoneCli,
      cepCliente: client.cepCli,
      logradouroCliente: client.addressCli,
      numeroCliente: client.numberCli,
      complementoCliente: client.complementCli,
      bairroCliente: client.neighborhoodCli,
      cidadeCliente: client.cityCli,
      ufCliente: client.ufCli

    })
    // salver os dados do cliente no banco de dados
    await newClient.save()
  } catch (error) {
    console.log(error)
  }
})

// _FIM CLientes - CRUD Create 
//========================================================================================================================================================
