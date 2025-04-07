console.log("Processo principal");

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('fs');
const { conectar, desconectar } = require('./database');
const clientModel = require('./src/models/Clientes.js');
const carroModel = require('./src/models/Carro.js'); // <- isso aqui!
const osModel = require('./src/models/Os.js');
const { jsPDF } = require('jspdf');

let win;
const createWindow = () => {
  nativeTheme.themeSource = 'dark';
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

// Funções para abrir janelas
function createChildWindow(file, width = 1010, height = 720) {
  const main = BrowserWindow.getFocusedWindow();
  if (main) {
    let win = new BrowserWindow({
      width, height,
      resizable: false,
      parent: main,
      modal: true,
      webPreferences: { preload: path.join(__dirname, 'preload.js') }
    });
    win.loadFile(`./src/views/${file}.html`);
    win.center();
  }
}

// Eventos do IPC para abrir janelas
ipcMain.on('client-window', () => createChildWindow('clientes'));
ipcMain.on('os-window', () => createChildWindow('OS'));
ipcMain.on('carro-window', () => createChildWindow('carros'));

// CRUD - Clientes
ipcMain.on('new-client', async (event, client) => {
  try {
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
    });
    await newClient.save();
    dialog.showMessageBox({ type: 'info', title: "Aviso", message: "Cliente adicionado com sucesso", buttons: ['OK'] });
    event.reply('reset-form');
  } catch (error) {
    if (error.code === 11000) {
      dialog.showMessageBox({ type: 'warning', title: "Atenção!", message: "CPF já cadastrado", buttons: ['OK'] });
    }
    console.log(error);
  }
});

// CRUD - OS
ipcMain.on('new-os', async (event, os) => {
  try {
    const newOS = new osModel({
      descricaoOS: os.desOS,
      materialOS: os.matOS,
      dataOS: os.datOS,
      orcamentoOS: os.orcOS,
      pagamentoOS: os.pagOS,
      statusOS: os.staOS
    });
    await newOS.save();
    dialog.showMessageBox({ type: 'info', title: "Aviso", message: "Ordem de Serviço adicionada com sucesso", buttons: ['OK'] });
    event.reply('reset-form');
  } catch (error) {
    console.log(error);
  }
});


// CRUD - CARRO
ipcMain.on('new-carro', async (event, carro) => {
  try {
    const newCarro = new carroModel({
      placaCarro: carro.plaCarro,
      marcaCarro: carro.marCarro,
      modeloCarro: carro.modCarro,
      anoCarro: carro.anoCarro,
      corCarro: carro.coCarro,
      descricaoCarro: carro.desCarro
    });
    await newCarro.save();
  } catch (error) {
    console.log(error);
  }
});




// Relatório de Clientes
async function relatorioClientes() {
  try {
    const clientes = await clientModel.find().sort({ nomeCliente: 1 });
    const doc = new jsPDF();
    doc.setFontSize(26).text("Relatório de Clientes", 14, 20);
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(12).text(`Data: ${dataAtual}`, 160, 10);
    let y = 45;
    doc.text("Nome", 14, y).text("Telefone", 80, y).text("E-mail", 130, y);
    doc.setLineWidth(0.5).line(10, y + 5, 200, y + 5);
    const tempDir = app.getPath('temp');
    const filePath = path.join(tempDir, 'clientes.pdf');
    doc.save(filePath);
    shell.openPath(filePath);
  } catch (error) {
    console.log(error);
  }
}

// Template do menu
const template = [
  { label: 'Cadastro', submenu: [
      { label: 'Cadastro de Clientes', click: () => createChildWindow('clientes') },
      { label: 'Cadastro de Veículos', click: () => createChildWindow('carros') },
      { label: 'OS', click: () => createChildWindow('OS') },
      { type: 'separator' },
      { label: 'Sair', click: () => app.quit(), accelerator: 'Alt+F4' }
    ]
  },
  { label: 'Relatórios', submenu: [
      { label: 'Clientes', click: () => relatorioClientes() },
      { label: 'OS abertas' },
      { label: 'OS concluídas' }
    ]
  },
  { label: 'Ferramentas', submenu: [
      { label: 'Aplicar zoom', role: 'zoomIn' },
      { label: 'Reduzir', role: 'zoomOut' },
      { label: 'Restaurar zoom', role: 'resetZoom' },
      { type: 'separator' },
      { label: 'Recarregar', role: 'reload' },
      { label: 'Ferramentas do Desenvolvedor', role: 'toggleDevTools' }
    ]
  },
  { label: 'Ajuda', submenu: [ { label: 'Sobre', click: () => createChildWindow('sobre', 360, 200) } ] }
];

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

ipcMain.on('db-connect', async (event) => {
  let conectado = await conectar();
  if (conectado) {
    setTimeout(() => event.reply('db-status', "conectado"), 500);
  }
});

app.on('before-quit', () => {
  desconectar();
});

// == Relatorio de Clientes ================
async function relatorioClientes() {
  try {
    const clientes = await clientModel.find().sort({ nomeClient: 1 })
    //console.log(cliente)

    // p - portrait | landscape | mm e a4 (folha A4 (210x297mm))

    const doc = new jsPDF('p', 'mm', 'a4')
    // inserir imagem no documento pdf
    // imagePath (caminho da imagem que sera inserida no pdf)
    // imagePath( uso da biblioteca fs para ler o arquivo no formato png)
    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logomartelo (2).png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 5, 8) //(5mm, 8mm x, y)

    // definir o tamanho da fonte (tamanho equivalente ao word)
    doc.setFontSize(18)
    //escrever um texto (titulo)
    doc.text("Relatorio de clientes", 14, 45)// x, y (mm)
    //inserir a data atual no relatorio
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)
    /// variavel de apoio na formatação
    let y = 60
    doc.text("Nome", 14, y)
    doc.text("Telefone", 80, y)
    doc.text("E-mail", 130, y)
    y += 5
    //desenhar uma linha 
    doc.setLineWidth(0.5) // expessura da linha 
    doc.line(10, y, 200, y) // 10 (inicio) ---- 200 fim
   
    // renderizar os clientes cadastrados no banco
    y += 10 // espaçamento da linha 
    // percorrer
    clientes.forEach((c) => {
      // adicionar outr pagina se a folha inteira for preenchida (estratégia é saber o tamanho da folha)
      // folha A4 y = 297mm
      if (y > 290) {
        doc.addPage()
        y = 20// resetar a variavel y
        doc.text("Nome", 14, y)
        doc.text("Telefone", 80, y)
        doc.text("E-mail", 130, y)
        y += 5
        //desenhar uma linha 
        doc.setLineWidth(0.5) // expessura da linha 
        doc.line(10, y, 200, y) // 10 (inicio) ---- 200 fim
        y += 10 
      }
      doc.text(c.nomeCliente, 14, y)
      doc.text(c.foneCliente, 80, y)
      doc.text(c.emailCliente || "N/A", 130, y)
      y += 10 // quebra de linha
    })

    // Adicionar numeração automatica 
    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++){
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, {align:'center'})
    }

    // Definir o caminho do arquivo temporario
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'clientes.pdf')



    //salvar o arquivo no aplicativo padrão de leitura de pdf do computador do usúario
    doc.save(filePath)
    //
    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}


async function relatorioOS(statusFiltrado = null) {
  try {
    const query = statusFiltrado ? { staOS: statusFiltrado } : {};
    const ordens = await osModel.find(query).sort({ desOS: 1 });

    const doc = new jsPDF('p', 'mm', 'a4');
    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logomartelo (2).png');
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    doc.addImage(imageBase64, 'PNG', 5, 8);

    doc.setFontSize(18);
    doc.text("Relatório de Ordens de Serviço", 14, 45);
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 160, 10);

    let y = 60;
    doc.text("Descrição", 14, y);
    doc.text("Data", 80, y);
    doc.text("Status", 130, y);
    y += 5;
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 10;

    ordens.forEach((o) => {
      if (y > 290) {
        doc.addPage();
        y = 20;
        doc.text("Descrição", 14, y);
        doc.text("Data", 80, y);
        doc.text("Status", 130, y);
        y += 5;
        doc.setLineWidth(0.5);
        doc.line(10, y, 200, y);
        y += 10;
      }
      doc.text(o.desOS || "N/A", 14, y);
      doc.text(o.datOS || "N/A", 80, y);
      doc.text(o.staOS || "N/A", 130, y);
      y += 10;
    });

    const paginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' });
    }

    const tempDir = app.getPath('temp');
    const filePath = path.join(tempDir, 'ordens_servico.pdf');
    doc.save(filePath);
    shell.openPath(filePath);
  } catch (error) {
    console.error(error);
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function relatorioOS() {
  try {
    const ordens = await osModel.find().sort({ desOS: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')
    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logomartelo (2).png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 5, 8)

    doc.setFontSize(18)
    doc.text("Relatório de Ordens de Serviço", 14, 45)
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("Descrição", 14, y)
    doc.text("Data", 80, y)
    doc.text("Status", 130, y)
    y += 5
    doc.setLineWidth(0.5)
    doc.line(10, y, 200, y)
    y += 10

    ordens.forEach((o) => {
      if (y > 290) {
        doc.addPage()
        y = 20
        doc.text("Descrição", 14, y)
        doc.text("Data", 80, y)
        doc.text("Status", 130, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }
      doc.text(o.desOS || "N/A", 14, y)
      doc.text(o.datOS || "N/A", 80, y)
      doc.text(o.staOS || "N/A", 130, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordens_servico.pdf')
    doc.save(filePath)
    shell.openPath(filePath)
  } catch (error) {
    console.error(error)
  }
}
