// Buscar CEP
function buscarCEP() {
    //console.log("teste do evento blur")
    //armazenar o cep digitado na variável
    let cep = document.getElementById('inputCEPClient').value
    //console.log(cep) //teste de recebimento do CEP
    //"consumir" a API do ViaCEP
    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`
    //acessando o web service par abter os dados
    fetch(urlAPI)
        .then(response => response.json())
        .then(dados => {
            //extração dos dados
            document.getElementById('inputAddressClient').value = dados.logradouro
            document.getElementById('inputNeighborhoodClient').value = dados.bairro
            document.getElementById('inputCityClient').value = dados.localidade
            document.getElementById('inputUFClient').value = dados.uf
        })
        .catch(error => console.log(error))
}


// capturar o foco na busca pelo nome do cliente
// a constante foco obtem o elemento html (input) identificada como 'searchclient'

const foco = document.getElementById('searchClient')

// iniciar a janela de clientes alterando as propriedades de alguns elementos

document.addEventListener('DOMContentLoaded', () => {
    // DEsativar os botoes
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // foco na busca de clientes
    foco.focus()
})

//============================================================================================================================//======================================================Manipulação da tecla Enter

// Função para manipular o evento da tecla enter
function teclaEnter(event){
    // se  tecla  Enter for pressionada 
    if (event.key=== "Enter") {
        event.preventDefault()// ignorar o comportamento padrao
        // associado o Enter a busca  do cliente
        buscarCliente()
    }
}


//=========================================================================================================================
// =========================================Função para restaurar o padrao da tecla Enter (submit)

function restaurarEnter(){
    frmClient.removeEventListener('keydown',teclaEnter)
}

// "Escutar do Evento Tercla Enter"
frmClient.addEventListener('keydown',teclaEnter)


//============================================================================================================================//====================================================Fim Da Manipulação da Tecla Enter


// capturar os dados do input do formulario (passo 1 do fluxo)
let frmClient = document.getElementById('frmClient')
let nameClient = document.getElementById('inputNameClient')
let cpfClient = document.getElementById('inputCPFClient')
let emailClient = document.getElementById('inputEmailClient')
let phoneClient = document.getElementById('inputPhoneClient')
let cepClient = document.getElementById('inputCEPClient')
let addressClient = document.getElementById('inputAddressClient')
let numberClient = document.getElementById('inputNumberClient')
let complementClient = document.getElementById('inputComplementClient')
let neighborhoodClient = document.getElementById('inputNeighborhoodClient')
let cityClient = document.getElementById('inputCityClient')
let ufClient = document.getElementById('inputUfClient')


// === Função para aplicar máscara no CPF ===
function aplicarMascaraCPF(campo) {
    let cpf = campo.value.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (cpf.length > 3) cpf = cpf.replace(/^(\d{3})(\d)/, "$1.$2");
    if (cpf.length > 6) cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    if (cpf.length > 9) cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

    campo.value = cpf;
}

// === Função para validar CPF ===
function validarCPF() {
    let campo = document.getElementById('inputCPFClient');
    let cpf = campo.value.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        campo.style.borderColor = "red";
        campo.style.color = "red";
        return false;
    }

    let soma = 0, resto;

    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) {
        campo.style.borderColor = "red";
        campo.style.color = "red";
        return false;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) {
        campo.style.borderColor = "red";
        campo.style.color = "red";
        return false;
    }

    campo.style.borderColor = "green";
    campo.style.color = "green";
    return true;
}

// Adicionar eventos para CPF
cpfClient.addEventListener("input", () => aplicarMascaraCPF(cpfClient)); // Máscara ao digitar
cpfClient.addEventListener("blur", validarCPF); // Validação ao perder o foco
//============================================================================================================================
// CRUD Create/Update ======================================================================================================










//=============================================== Evento associado ao botão ==========================================
//============================================(uso das validações do html)============================================
frmClient.addEventListener('submit', async (event) => {
    //evitar o comportamento padrao do submit que é enviar os dados do formulario e reiniciar o documento html
    event.preventDefault()
    // teste importante (recebimento dos dados do formulario - passo 1 do fluxo)
    console.log(nameClient.value, 
        cpfClient.value,
        emailClient.value,
        phoneClient.value, 
        cepClient.value, 
        addressClient.value, 
        numberClient.value, 
        complementClient.value, 
        neighborhoodClient.value, 
        cityClient.value, 
        ufClient.value)

    // criar um objeto para armazenar os dados do cliente antes de enviar ao main
    const client = {
        nameCli: nameClient.value,
        cpfCli: cpfClient.value,
        emailCli: emailClient.value,
        phoneCli: phoneClient.value,
        cepCli: cepClient.value,
        addressCli: addressClient.value,
        numberCli: numberClient.value,
        complementCli: complementClient.value,
        neighborhoodCli: neighborhoodClient.value,
        cityCli: cityClient.value,
        ufCli: ufClient.value
    }
    api.newClient(client) 



})


//============================================================================================================================
// =================================================Fim CRUD Create/Update==================================================


//==========================================================================================================================
// ==================================================== CRUD Read ==========================================================

function buscarCliente(){
    //console.log("teste do botão buscar")

    // Passo 1: Capturar o nome do cliente
    let name = document.getElementById('searchClient').value
    console.log(name) // teste do passo 1
    api.searchName(name) // passo 2: envio do nome ao main
    // Recebimento dos dados do cliente 
    api.renderClient((event, dataClient) => {
        console.log(dataClient) // teste do passo 5

        // Passo 6: renderizar os dados do cliente no formulario
        // - Criar um vetor global para manipulação dos dados 
        // - Criar uma constante para converter os dados recebidos que estão no formato string para o formato JSON (JSON.parse)
        // usar o laço forEach para percorrer o vetor e setar o campo (caixas de texto) do formulario
        const dadosCliente = JSON.parse(dataClient)
        // atribuir ao vetor os dados do cliente
        arrayClient = dadosCliente
        // extrair os dados do cliente
        arrayClient.forEach((c) => {
            nameClient.value = c.nomeCliente,
            cpfClient.value = c.cpfCliente,
            emailClient.value = c.emailCliente,
            phoneClient.value = c.foneCliente,    
            cepClient.value = c.cepCliente,
            addressClient.value = c.logradouroCliente,
            numberClient.value = c.numeroCliente,
            complementClient.value = c.complementoCliente,
            neighborhoodClient.value = c.bairroCliente,
            cityClient.value = c.cidadeCliente,
            ufClient.value = c.ufCliente
        })
    })
}


// Setar o cliente não cadastrado
api.setClient((args) => {
    let campoBusca = document.getElementById('searchClient').value.trim()

    // Regex para verificar se o valor é só número (CPF)
    if (/^\d{11}$/.test(campoBusca)) {
        // É um número → CPF
        cpfClient.focus()
        foco.value = ""
        cpfClient.value = campoBusca
    } 
    else if(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(campoBusca)){
        cpfClient.focus()
        foco.value = ""
        cpfClient.value = campoBusca
    }
    else {
        // Não é número → Nome
        nameClient.focus()
        foco.value = ""
        nameClient.value = campoBusca
    }
})


// ==================================================fim CRUD Read =========================================================
// =========================================================================================================================





// =========================================================================================================================
// ====================================================Reset form ==========================================================
function resetForm(){
    //Limpar os campos e resetar o formulario com as configurações pré definidas
    location.reload()
}

// Recebimento do pedido do main para resetar o formulario
api.resetForm((args)=>{
    resetForm()
})

// ================================================= Fim - Reset form =====================================================
// ========================================================================================================================