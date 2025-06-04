
// Iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // Foco na busca do cliente
    input.focus()
})

// Captura dos elementos DOM
const btnUpdate = document.getElementById('btnUpdate')
const btnDelete = document.getElementById('btnDelete')

// captura dos dados dos inputs do formulario (passo 1 do fluxo)
let frmOS = document.getElementById('frmOS')
let descricaoOS = document.getElementById('serviceDescription')
let materialOS = document.getElementById('inputPecasClient')
let dataConclusao = document.getElementById('inputConclusaoClient')
let orcamentoOS = document.getElementById('inputOrcamentoClient')
let pagamentoOS = document.getElementById('inputPagamentoClient')
let statusOS = document.getElementById('osStatus')
let idClient = document.getElementById('inputIdClient')
let idOS = document.getElementById('txtOs')
const dateOS = document.getElementById('txtData')



// ======================================================================================================================
// == CRUD Create/Update ================================================================================================
// Evento associado ao botão submit (uso das validações do html)
frmOS.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (idClient.value === "") {
        api.validateClient()
    } else {
        console.log(idOS.value, idClient.value, descricaoOS.value, materialOS.value, dataConclusao.value, orcamentoOS.value, pagamentoOS.value, statusOS.value, )
        
        if (idOS.value === "") {
            const OS = {
                desOS: descricaoOS.value,
                matOS: materialOS.value,
                //datOS: dataOS.value,
                orcOS: orcamentoOS.value,
                pagOS: pagamentoOS.value,
                staOS: statusOS.value,
                idCli: idClient.value,
                conOs: dataConclusao.value
            }
            api.newOS(OS)
        } else {
            // Editar OS - (a ser implementado)
        }
    }
})

// =======================================================
// == Reset form =========================================
function resetForm() {
    location.reload()
}

// Recebimento do pedido do main para resetar o formulario
api.resetForm((args) => {
    resetForm()
})

// =======================================================
// == Buscar avançada - estilo Google ====================

const input = document.getElementById('inputSearchClient')
const suggestionList = document.getElementById('viewListSuggestion')


let nameClient = document.getElementById('inputNameClient')
let phoneClient = document.getElementById('inputPhoneClient')

let arrayClients = []

input.addEventListener('input', () => {
    const search = input.value.toLowerCase()//captura o que foi digitado e converte tudo para minúsculo
    suggestionList.innerHTML = ""

    // Buscar os nomes dos clientes no banco
    api.searchClients()

    // Listar os clientes 
    api.listClients((event, clients) => {
        const dataClients = JSON.parse(clients)
        arrayClients = dataClients

        //Filtra os clientes cujo nome (c.nomeCliente) contém o texto digitado(search)
        const results = arrayClients.filter(c =>
            c.nomeCliente && c.nomeCliente.toLowerCase().includes(search)
        ).slice(0, 10)

        suggestionList.innerHTML = ""

        results.forEach(c => {
            const item = document.createElement('li')
            item.classList.add('list-group-item', 'list-group-item-action')
            item.textContent = c.nomeCliente
            suggestionList.appendChild(item)

            item.addEventListener('click', () => {
                idClient.value = c._id  
                nameClient.value = c.nomeCliente
                phoneClient.value = c.foneCliente
                input.value = ""
                suggestionList.innerHTML = ""
            })

            // adiciona os nomes(itens <li>) a lista <ul>
            suggestionList.appendChild(item)
        })
    })
})
// setar o foco no campo de busca (validação de busca do cliente obrigatória)
api.setSearch((args) => {
    input.focus()
})

document.addEventListener('click', (event) => {
    if (!input.contains(event.target) && !suggestionList.contains(event.target)) {
        suggestionList.innerHTML = ""
    }
})

// =======================================================
// == Buscar OS =========================================

function findOS() {
    api.searchOS()
}

api.renderOS((event, dataOS) => {
    console.log(dataOS)
    const os = JSON.parse(dataOS)

    // preencher os campos com os dados da OS
    idOS.value = os._id
    // formatar data:

    const data = new Date(os.dataEntrada)
    const formatada = data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })

    dateOS.value = formatada
    idClient.value = os.idCliente
    //IdC.value = os.idCliente
    idClient.dispatchEvent(new Event('change'))
    descricaoOS.value = os.problema
    materialOS.value = os.pecas
    dataConclusao.value = os.dataConclusao
    orcamentoOS.value = os.orcamento
    pagamentoOS.value = os.pagamento
    statusOS.value = os.statusOS
    // desativar o botão adicionar
    btnCreate.disabled = true
    // ativar os botões editar e excluir
    btnUpdate.disabled = false
    btnDelete.disabled = false
    // desativar o campo de busca do cliente (evitar inconcistencia de dados)
    inputSearchClient.disabled = true
})
// Disparar ação de busca do nome e telefone do cliente quando o inputIdClient for preenchido (change - usado quando o campo input é desativado)
idClient.addEventListener('change', () => {
    if (idClient.value !== "") {
        console.log(idClient.value)
        api.searchIdClient(idClient.value)
    }
})

// receber dados do cliente para preenchimento da OS
api.renderIdClient((event, dataClient) => {
    const dadosCliente = JSON.parse(dataClient)
    // atribuir ao vetor os dados do cliente
    arrayClient = dadosCliente
    // extrair os dados do cliente
    arrayClient.forEach((c) => {
        nameClient.value = c.nomeCliente,
            phoneClient.value = c.foneCliente
    })

})
// ============================================================
// == CRUD Delete =============================================

function removeOS() {
    console.log(idOS.value) // Passo 1 (receber do form o id da OS)
    api.deleteOS(idOS.value) // Passo 2 (enviar o id da OS ao main)
}

// == Fim - CRUD Delete =======================================
// ============================================================

// ============================================================
// == Imprimir OS ============================================= 

function generateOS() {
    api.printOS()
}

// == Fm - Imprimir OS ======================================== 
// ============================================================
