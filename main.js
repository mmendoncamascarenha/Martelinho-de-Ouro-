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
// janela clientes
let client
function clientWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    client = new BrowserWindow({
      width: 1010,
      height: 720,
      //autoHideMenuBar: true,
      // resizable: false,
      parent: main,
      modal: true,
      // ativação do preload.js
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })

  }
  client.loadFile('./src/views/cliente.html')
  client.center() //iniciar no centro da tela
}

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
    dialog.showMessageBox({ 
      type: 'info', 
      title: "Aviso", 
      message: "Cliente adicionado com sucesso", 
      buttons: ['OK'] });
    event.reply('reset-form');
  } catch (error) {
    if (error.code === 11000) {
      dialog.showMessageBox({ type: 'warning', title: "Atenção!", message: "CPF já cadastrado", buttons: ['OK'] });
    }
    console.log(error);
  }
});

// CRUD - OS
ipcMain.on('new-os', async (event, OS) => {
  // Importante! Teste de recebimento dos dados do cliente
  console.log(OS)
  // console.log("teste")
  // cadastrar a estrutura de dados no banco de dados usando a classe modelo. Atenção!! os atributos precisam ser identicos ao modelo de dados Clientes.js eos valores sao definidos pelo conteudo do objeto cliente 
  try {
    const newOS = new osModel({
      descricaoOS: OS.desOS,
      materialOS: OS.matOS,
      dataOS: OS.datOS,
      orcamentoOS: OS.orcOS,
      pagamentoOS: OS.pagOS,
      statusOS: OS.staOS
    })
    // salvar os dados do cliente no banco de dados
    await newOS.save()
    //Mensagem de confirmação
    dialog.showMessageBox({
      //Customização
      type: 'info',
      title: "Aviso",
      message: "OS adicionada com sucesso",
      buttons: ['OK']
    }).then((result) => {
      //ação ao precionar o botão 
      if (result.response === 0) {
        // enviar um pedido para o renderizador limpar os campos e resetar as 
        // configurações pré definidas (rótulo) preload.js
        event.reply('reset-form')
      }

    })

  } catch (error) {
    console.log(error)
  }
})


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




//========================================================================================================================-=======================================================Relatório de Clientes
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
  {
    label: 'Cadastro', submenu: [
      { label: 'Cadastro de Clientes', click: () => createChildWindow('clientes') },
      { label: 'Cadastro de Veículos', click: () => createChildWindow('carros') },
      { label: 'OS', click: () => createChildWindow('OS') },
      { type: 'separator' },
      { label: 'Sair', click: () => app.quit(), accelerator: 'Alt+F4' }
    ]
  },
  {
    label: 'Relatórios', submenu: [
      { label: 'Clientes', click: () => relatorioClientes() },
      { label: 'OS abertas' },
      { label: 'OS concluídas' }
    ]
  },
  {
    label: 'Ferramentas', submenu: [
      { label: 'Aplicar zoom', role: 'zoomIn' },
      { label: 'Reduzir', role: 'zoomOut' },
      { label: 'Restaurar zoom', role: 'resetZoom' },
      { type: 'separator' },
      { label: 'Recarregar', role: 'reload' },
      { label: 'Ferramentas do Desenvolvedor', role: 'toggleDevTools' }
    ]
  },
  { label: 'Ajuda', submenu: [{ label: 'Sobre', click: () => createChildWindow('sobre', 360, 200) }] }
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
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
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

// ==============================================FIM DE RELATORIOS DE CLIENTES==============================================


// =========================================================================================================================
// ==CRUD Read =============================

// Validação de busca (preenchimento obrigatorio)
ipcMain.on('validate-search', () => {
  dialog.showMessageBox({
    type: 'warning',
    title: 'Atenção',
    message: 'Preencha o campo de busca',
    buttons: ['OK']
  })
})


ipcMain.on('search-name', async (event, name) => {
  //console.log("teste IPC search-name") Dica para testar o funcionamento
  //console.log(name) // teste do passo 2 (importante)

  // passos 3 e 4 busca dos dados do cliente do banco
  //find({nomeCliente: name}) - busca pelo nome
  //RegExp(name, i) - (insensitive / Ignorar maiúsculo ou minúsculo)
  try {
    /*const dataClient = await clientModel.find({
      nomeCliente: new RegExp(name, 'i')
    })*/
    const dataClient = await clientModel.find({
      $or: [
        { nomeCliente: new RegExp(name, 'i') },
        { cpfCliente: new RegExp(name, 'i') }
      ]
    })
    console.log(dataClient) // teste passo 3 e 4 (Importante!)

    // melhoria d eexperiencia do usuario (se o cliente nao estiver cadastrado, alertar o usuario e questionar se ele
    // quer cadastrar este novo cliente. Se não quiser cadastrar, limpar os campos, se quiser cadastrar recortar o nome do cliente do campo de busca e colar no campo nome)

    // se o vetor estiver vazio [] (cliente não cadastrado)
    if (dataClient.length === 0) {
      dialog.showMessageBox({
        type: 'question',
        title: 'Aviso',
        message: "Cliente não cadastrado. \nDeseja cadastrar esse cliente?",
        defaultId: 0, //botão 0
        buttons: ['Sim', 'Não'] //[0,1]

      }).then((result) => {
        if (result.response === 0) {
          // enviar ao renderizador um pedido para setar os campos(recortar do campo de busca e colar no campo nome
          event.reply('set-client')
        } else {
          // limpar formulario
          event.reply('reset-form')
        }

      })
    }


    // Passo 5: 
    // enviando os dados do cliente ao rendererCliente
    // OBS: IPC só trabalha com string, então é necessario converter o JSON para string JSON.stringify(dataClient)
    event.reply('renderClient', JSON.stringify(dataClient))

  } catch (error) {
    console.log(error)
  }
})


// ===================================================fim CRUD Read =======================================================
// ========================================================================================================================

//==========================================================================================================================
//===================================================== CRUD DELETE
ipcMain.on('delete-client', async (event, id) => {
  console.log(id) // teste do passo 2 (recebimento do id)
  try {
    //importante - confirmar a exclusao
    // client é o nome da variavel que representa a janela
    const { response } = await dialog.showMessageBox(client, {
      type: 'warning',
      title: "Atenção!",
      message: "Desejar excluir este cliente?\nEsta ação não poderá ser desfeita.",
      buttons: ['Cancelar', 'Excluir'] //[0, 1]
    })
    if (response === 1) {
      // Passo 3: Excluir o registro do cliente
      const delClient = await clientModel.findByIdAndDelete(id)
      event.reply('reset-form')
    }
  } catch (error) {
    console.log(error)

  }
})



//==========================================================================================================================
//=================================================== FIM DO CRUD DELETE



//==========================================================================================================================
//=================================================== CRUD Update
ipcMain.on('update-client', async (event, client) => {
  console.log(client) // teste importante 
  try {
    const updateClient = await clientModel.findByIdAndUpdate(
      client.idCli,
      {
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
      },
      {
        new: true
      }
    )

    // confirmação 
    dialog.showMessageBox({ 
      // customização
        type: 'info', 
        title: "Aviso", 
        message: "Dados do Cliente alterados com sucesso", 
        buttons: ['OK'] 
  }).then((result) => {
    if(result.response === 0) {
      // enviar um pedido para o redenrer
      //
      event.reply('reset-form')
    }
  })
    

  } catch (error) {
    console.log(error)
  }
})












//==========================================================================================================================
//=================================================== FIM DO CRUD UPDATE



//************************************************************/
//*******************  Ordem de Serviço  *********************/
//************************************************************/


// ============================================================
// == Buscar OS ===============================================

ipcMain.on('search-os', (event) => {
  //console.log("teste: busca OS")
  prompt({
    title: 'Buscar OS',
    label: 'Digite o número da OS:',
    inputAttrs: {
      type: 'text'
    },
    type: 'input',
    width: 400,
    height: 200
  }).then((result) => {
    if (result !== null) {
      console.log(result)
      //buscar a os no banco pesquisando pelo valor do result (número da OS)

    }
  })
})

// == Fim - Buscar OS =========================================
// ============================================================




// ============================================================================================================
// == Buscar cliente para vincular na OS (buscar estilo Google) ===============================================

ipcMain.on('search-clients', async (event) => {
  try {
    //buscar no banco os clientes pelo nome em ordem alfabética
    const clients = await clientModel.find().sort({
      nomeCliente: 1
    })

    ///console.log(clients) // teste do passo 2
    // passo 3: Envio dos clientes para o renderizador
    // OBS: não esquecer de converter para string
    event.reply('list-clients', JSON.stringify(clients))

  } catch (error) {
    console.log(error)
  }
})

// == Fim - Buscar cliente para vincular na OS (buscar estilo Google) =========================================
// ============================================================================================================