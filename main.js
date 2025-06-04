console.log("Processo principal");

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('fs');
const { conectar, desconectar } = require('./database');
// importar mongoose (validação do id na OS)
const mongoose = require('mongoose')
const clientModel = require('./src/models/Clientes.js');
const carroModel = require('./src/models/Carro.js'); 
const osModel = require('./src/models/Os.js');
const { jsPDF } = require('jspdf');
//require('jspdf-autotable') //aditivo do jsPDF
const prompt = require('electron-prompt');
//const os = require('os');



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
  try {
    const newOS = new osModel({
      idCliente: OS.idCliente_OS,   // id do cliente
      problema: OS.desOS,           // descrição do problema
      pecas: OS.matOS,              // material/peças usados
      dataConclusao: OS.conOs,
      dataEntrada: OS.datOS,        // data da OS
      orcamento: OS.orcOS,              // orçamento
      pagamento: OS.pagOS,          // forma pagamento
      statusOS: OS.staOS,            // status da OS

    })
    
    await newOS.save()

    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "OS adicionada com sucesso",
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
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
      { label: 'OS abertas', click: () => relatorioOsAbertas() },
      { label: 'OS concluídas', click: () => relatorioOsConcluidas() }
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

// ==============================================FIM DE RELATORIOS DE CLIENTES============================================

// ==========================================
// == Relatorio da OS Aberta ================

async function relatorioOsAbertas() {
  try {

    const clientes = await osModel.find({ statusOS: 'Aberta' }).sort({ orcamento: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')

    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logomartelo (2).png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 20, 8) //(5mm, 8mm x,y)

    doc.setFontSize(18)

    doc.text("Relatório de Ordem de Serviços", 14, 45)//x,y (mm) 

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("ID do Cliente", 14, y)
    doc.text("Orçamento", 70, y)
    doc.text("Status", 120, y)
    y += 5

    doc.setLineWidth(0.5) // expessura da linha
    doc.line(10, y, 200, y) // inicio e fim

    y += 10 // espaçãmento da linha

    clientes.forEach((c) => {

      if (y > 280) {
        doc.addPage()
        y = 20
        doc.text("ID do Cliente", 14, y)
        doc.text("Orçamento", 70, y)
        doc.text("Status", 120, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }

      doc.text(c.id || "N/A", 14, y)
      doc.text(c.orcamento || "N/A", 80, y)
      doc.text(c.statusOS || "N/A", 120, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordemservico.pdf')

    doc.save(filePath)

    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

// ==================== fim relatorio da os aberta ===============


// ==========================================
// == Relatorio da OS Concluida ================

async function relatorioOsConcluidas() {
  try {

    const clientes = await osModel.find({ statusOS: 'Finalizada' }).sort({ orcamento: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')

    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logomartelo (2).png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 20, 8) //(5mm, 8mm x,y)

    doc.setFontSize(18)

    doc.text("Relatório de Ordem de Serviços", 14, 45)//x,y (mm) 

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("ID do Cliente", 14, y)
    doc.text("Orçamento", 80, y)
    doc.text("Status", 120, y)
    y += 5

    doc.setLineWidth(0.5) // expessura da linha
    doc.line(10, y, 200, y) // inicio e fim

    y += 10 // espaçãmento da linha

    clientes.forEach((c) => {

      if (y > 280) {
        doc.addPage()
        y = 20
        doc.text("ID do Cliente", 14, y)
        doc.text("Orçamento", 70, y)
        doc.text("Status", 120, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }

      doc.text(c.id || "N/A", 14, y)
      doc.text(c.orcamento || "N/A", 70, y)
      doc.text(c.statusOS || "N/A", 120, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordemservico.pdf')

    doc.save(filePath)

    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

// ==========================================
// == fim relatorio da OS concluida =============================

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
//=================================================== FIM DO CRUD UPDATe







//************************************************************/
//*******************  Ordem de Serviço  *********************/
//************************************************************/





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

// ==========================================
// == OS - CRUD Create ================

// Validação de busca (preenchimento obrigatório Id Cliente-OS)
ipcMain.on('validate-client', (event) => {
  dialog.showMessageBox({
      type: 'warning',
      title: "Aviso!",
      message: "É obrigatório vincular o cliente na Ordem de Serviço",
      buttons: ['OK']
  }).then((result) => {
      //ação ao pressionar o botão (result = 0)
      if (result.response === 0) {
          event.reply('set-search')
      }
  })
})
/*
// recebimento do objeto que contem os dados do cliente
ipcMain.on('new-os', async (event, os) => {
  // Importante! Teste de recebimento dos dados do cliente
  console.log(os)
    console.log("teste")
  // cadastrar a estrutura de dados no banco de dados usando a classe modelo. Atenção!! os atributos precisam ser identicos ao modelo de dados Clientes.js eos valores sao definidos pelo conteudo do objeto cliente 
  try {
    const newOS = new osModel({
      idCliente: os.idClient_OS,
      descricao: os.desOS,
      material: os.matOS,
      data: os.datOS,
      orcamento: os.orcOS,
      pagamento: os.pagOS,
      status: os.staOS
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
  */
// -- Fim - OS - CRUD Create ===========
// ==========================================



// ============================================================
// == Buscar OS ===============================================

ipcMain.on('search-os', async (event) => {
  prompt({
      title: 'Buscar OS',
      label: 'Digite o número da OS:',
      inputAttrs: {
          type: 'text'
      },
      type: 'input',
      width: 400,
      height: 200
  }).then(async (result) => {
      // buscar OS pelo id (verificar formato usando o mongoose - importar no início do main)
      if (result !== null) {
          // Verificar se o ID é válido (uso do mongoose - não esquecer de importar)
          if (mongoose.Types.ObjectId.isValid(result)) {
              try {
                  const dataOS = await osModel.findById(result)
                  if (dataOS) {
                      console.log(dataOS) // teste importante
                      // enviando os dados da OS ao rendererOS
                      // OBS: IPC só trabalha com string, então é necessário converter o JSON para string JSON.stringify(dataOS)
                      event.reply('render-os', JSON.stringify(dataOS))
                  } else {
                      dialog.showMessageBox({
                          type: 'warning',
                          title: "Aviso!",
                          message: "OS não encontrada",
                          buttons: ['OK']
                      })
                  }
              } catch (error) {
                  console.log(error)
              }
          } else {
              dialog.showMessageBox({
                  type: 'error',
                  title: "Atenção!",
                  message: "Formato do número da OS inválido.\nVerifique e tente novamente.",
                  buttons: ['OK']
              })
          }
      }
  })
})

// == Fim - Buscar OS =========================================
// ============================================================


// ============================================================
// == Editar OS - CRUD Update =================================

ipcMain.on('update-os', async (event, os) => {
  //importante! teste de recebimento dos dados da os (passo 2)
  console.log(os)
  // Alterar os dados da OS no banco de dados MongoDB
  try {
      // criar uma nova de estrutura de dados usando a classe modelo. Atenção! Os atributos precisam ser idênticos ao modelo de dados OS.js e os valores são definidos pelo conteúdo do objeto os
      const updateOS = await osModel.findByIdAndUpdate(
          os.id_OS,
          {
              idCliente: os.idClient_OS,
              statusOS: os.stat_OS,
              computador: os.computer_OS,
              serie: os.serial_OS,
              problema: os.problem_OS,
              observacao: os.obs_OS,
              tecnico: os.specialist_OS,
              diagnostico: os.diagnosis_OS,
              pecas: os.parts_OS,
              valor: os.total_OS
          },
          {
              new: true
          }
      )
      // Mensagem de confirmação
      dialog.showMessageBox({
          //customização
          type: 'info',
          title: "Aviso",
          message: "Dados da OS alterados com sucesso",
          buttons: ['OK']
      }).then((result) => {
          //ação ao pressionar o botão (result = 0)
          if (result.response === 0) {
              //enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas (rótulo 'reset-form' do preload.js
              event.reply('reset-form')
          }
      })
  } catch (error) {
      console.log(error)
  }
})

// == Fim Editar OS - CRUD Update =============================
// ============================================================

// IMPRIMIR OS ==========================================================================================================
//=======================================================================================================================
ipcMain.on('print-os', async (event) => {
  prompt({
      title: 'Imprimir OS',
      label: 'Digite o número da OS:',
      inputAttrs: {
          type: 'text'
      },
      type: 'input',
      width: 400,
      height: 200
  }).then(async (result) => {
      // buscar OS pelo id (verificar formato usando o mongoose - importar no início do main)
      if (result !== null) {
          // Verificar se o ID é válido (uso do mongoose - não esquecer de importar)
          if (mongoose.Types.ObjectId.isValid(result)) {
              try {
                  const dataOS = await osModel.findById(result)
                  if (dataOS) {
                      console.log(dataOS) // teste importante
                      // enviando os dados da OS ao rendererOS
                      // OBS: IPC só trabalha com string, então é necessário converter o JSON para string JSON.stringify(dataOS)
                      event.reply('render-os', JSON.stringify(dataOS))
                  } else {
                      dialog.showMessageBox({
                          type: 'warning',
                          title: "Aviso!",
                          message: "OS não encontrada",
                          buttons: ['OK']
                      })
                  }
              } catch (error) {
                  console.log(error)
              }
          } else {
              dialog.showMessageBox({
                  type: 'error',
                  title: "Atenção!",
                  message: "Formato do número da OS inválido.\nVerifique e tente novamente.",
                  buttons: ['OK']
              })
          }
      }
  })
})

// impressão via botão imprimir
ipcMain.on('print-os', async (event) => {
  prompt({
      title: 'Imprimir OS',
      label: 'Digite o número da OS:',
      inputAttrs: {
          type: 'text'
      },
      type: 'input',
      width: 400,
      height: 200
  }).then(async (result) => {
      // buscar OS pelo id (verificar formato usando o mongoose - importar no início do main)
      if (result !== null) {
          // Verificar se o ID é válido (uso do mongoose - não esquecer de importar)
          if (mongoose.Types.ObjectId.isValid(result)) {
              try {
                  // teste do botão imprimir
                  //console.log("imprimir OS")
                  const dataOS = await osModel.findById(result)
                  if (dataOS && dataOS !== null) {
                      console.log(dataOS) // teste importante
                      // extrair os dados do cliente de acordo com o idCliente vinculado a OS
                      const dataClient = await clientModel.find({
                          _id: dataOS.idClient
                      })
                      console.log(dataClient)
                      // impressão (documento PDF) com os dados da OS, do cliente e termos do serviço (uso do jspdf)

                      // formatação do documento pdf
                      const doc = new jsPDF('p', 'mm', 'a4')
                      const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logomartelo (2).png')
                      const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
                      doc.addImage(imageBase64, 'PNG', 5, 8)
                      doc.setFontSize(18)
                      doc.text("OS:", 14, 45) //x=14, y=45
                      doc.setFontSize(12)

                      // Extração dos dados do cliente vinculado a OS
                      dataClient.forEach((c) => {
                          doc.text("Cliente:", 14, 65),
                              doc.text(c.nomeCliente, 34, 65),
                              doc.text(c.foneCliente, 85, 65),
                              doc.text(c.emailCliente || "N/A", 130, 65)
                          //...
                      })

                      // Extração dos dados da OS                        
                      doc.text(String(dataOS.computador), 14, 85)
                      doc.text(String(dataOS.problema), 80, 85)

                      // Texto do termo de serviço
                      doc.setFontSize(10)
                      const termo = `
  Termo de Serviço e Garantia
  
  O cliente autoriza a realização dos serviços técnicos descritos nesta ordem, ciente de que:
  
  - Diagnóstico e orçamento são gratuitos apenas se o serviço for aprovado. Caso contrário, poderá ser cobrada taxa de análise.
  - Peças substituídas poderão ser retidas para descarte ou devolvidas mediante solicitação no ato do serviço.
  - A garantia dos serviços prestados é de 90 dias, conforme Art. 26 do Código de Defesa do Consumidor, e cobre exclusivamente o reparo executado ou peça trocada, desde que o equipamento não tenha sido violado por terceiros.
  - Não nos responsabilizamos por dados armazenados. Recomenda-se o backup prévio.
  - Equipamentos não retirados em até 90 dias após a conclusão estarão sujeitos a cobrança de armazenagem ou descarte, conforme Art. 1.275 do Código Civil.
  - O cliente declara estar ciente e de acordo com os termos acima.`

                      // Inserir o termo no PDF
                      doc.text(termo, 14, 150, { maxWidth: 180 }) // x=14, y=60, largura máxima para quebrar o texto automaticamente

                      // Definir o caminho do arquivo temporário e nome do arquivo
                      const tempDir = app.getPath('temp')
                      const filePath = path.join(tempDir, 'os.pdf')
                      // salvar temporariamente o arquivo
                      doc.save(filePath)
                      // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
                      shell.openPath(filePath)
                  } else {
                      dialog.showMessageBox({
                          type: 'warning',
                          title: "Aviso!",
                          message: "OS não encontrada",
                          buttons: ['OK']
                      })
                  }

              } catch (error) {
                  console.log(error)
              }
          } else {
              dialog.showMessageBox({
                  type: 'error',
                  title: "Atenção!",
                  message: "Código da OS inválido.\nVerifique e tente novamente.",
                  buttons: ['OK']
              })
          }
      }
  })
})

async function printOS(osId) {
  try {
      const dateOS = await osModel.findById(osId)

      const dataClient = await clientModel.find({
          _id: dateOS.idClient
      })
      console.log(dataClient)
      // impressão (documento PDF) com os dados da OS, do cliente e termos do serviço (uso do jspdf)

      // formatação do documento pdf
      const doc = new jsPDF('p', 'mm', 'a4')
      const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
      const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
      doc.addImage(imageBase64, 'PNG', 5, 8)
      doc.setFontSize(18)
      doc.text("OS:", 14, 45) //x=14, y=45
      doc.setFontSize(12)

      // Extração dos dados do cliente vinculado a OS
      dataClient.forEach((c) => {
          doc.text("Cliente:", 14, 65),
              doc.text(c.nomeCliente, 34, 65),
              doc.text(c.foneCliente, 85, 65),
              doc.text(c.emailCliente || "N/A", 130, 65)
          //...
      })

      // Extração dos dados da OS                        
      doc.text(String(dateOS.orcamento), 14, 85)
      doc.text(String(dateOS.problema), 80, 85)

      // Texto do termo de serviço
      doc.setFontSize(10)
      const termo = `
Termo de Serviço e Garantia

O cliente autoriza a realização dos serviços técnicos descritos nesta ordem, ciente de que:

- Diagnóstico e orçamento são gratuitos apenas se o serviço for aprovado. Caso contrário, poderá ser cobrada taxa de análise.
- Peças substituídas poderão ser retidas para descarte ou devolvidas mediante solicitação no ato do serviço.
- A garantia dos serviços prestados é de 90 dias, conforme Art. 26 do Código de Defesa do Consumidor, e cobre exclusivamente o reparo executado ou peça trocada, desde que o equipamento não tenha sido violado por terceiros.
- Não nos responsabilizamos por dados armazenados. Recomenda-se o backup prévio.
- Equipamentos não retirados em até 90 dias após a conclusão estarão sujeitos a cobrança de armazenagem ou descarte, conforme Art. 1.275 do Código Civil.
- O cliente declara estar ciente e de acordo com os termos acima.`

      // Inserir o termo no PDF
      doc.text(termo, 14, 150, { maxWidth: 180 }) // x=14, y=60, largura máxima para quebrar o texto automaticamente

      // Definir o caminho do arquivo temporário e nome do arquivo
      const tempDir = app.getPath('temp')
      const filePath = path.join(tempDir, 'os.pdf')
      // salvar temporariamente o arquivo
      doc.save(filePath)
      // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
      shell.openPath(filePath)

  } catch (error) {
      console.log(error)
  }
}

// Fim - Impressão de OS ======================================
// ============================================================

// ============================================================
// == Excluir OS - CRUD Delete  ===============================

ipcMain.on('delete-os', async (event, idOS) => {
  console.log(idOS) // teste do passo 2 (recebimento do id)
  try {
      //importante - confirmar a exclusão
      //osScreen é o nome da variável que representa a janela OS
      const { response } = await dialog.showMessageBox(os, {
          type: 'warning',
          title: "Atenção!",
          message: "Deseja excluir esta ordem de serviço?\nEsta ação não poderá ser desfeita.",
          buttons: ['Cancelar', 'Excluir'] //[0, 1]
      })
      if (response === 1) {
          //console.log("teste do if de excluir")
          //Passo 3 - Excluir a OS
          const delOS = await osModel.findByIdAndDelete(idOS)
          event.reply('reset-form')
      }
  } catch (error) {
      console.log(error)
  }
})

// == Fim Excluir OS - CRUD Delete ============================
// ============================================================

// ============================================================
// == Editar OS - CRUD Update =================================

ipcMain.on('update-os', async (event, OS) => {
  //importante! teste de recebimento dos dados da os (passo 2)
  console.log(OS)
  // Alterar os dados da OS no banco de dados MongoDB
  try {
      // criar uma nova de estrutura de dados usando a classe modelo. Atenção! Os atributos precisam ser idênticos ao modelo de dados OS.js e os valores são definidos pelo conteúdo do objeto os
      const updateOS = await osModel.findByIdAndUpdate(
          OS.id_OS,
          {
            idCliente: OS.idCliente_OS,   // id do cliente
            problema: OS.desOS,           // descrição do problema
            pecas: OS.matOS,              // material/peças usados
            dataConclusao: OS.conOs,
            dataEntrada: OS.datOS,        // data da OS
            orcamento: OS.orcOS,              // orçamento
            pagamento: OS.pagOS,          // forma pagamento
            statusOS: OS.staOS
          },
          {
              new: true
          }
      )
      // Mensagem de confirmação
      dialog.showMessageBox({
          //customização
          type: 'info',
          title: "Aviso",
          message: "Dados da OS alterados com sucesso",
          buttons: ['OK']
      }).then((result) => {
          //ação ao pressionar o botão (result = 0)
          if (result.response === 0) {
              //enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas (rótulo 'reset-form' do preload.js
              event.reply('reset-form')
          }
      })
  } catch (error) {
      console.log(error)
  }
})

// == Fim Editar OS - CRUD Update =============================
// ============================================================
