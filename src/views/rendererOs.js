
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
let dataOS = document.getElementById('inputConclusaoClient')
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
        console.log(idOS.value, idClient.value, descricaoOS.value, materialOS.value, dataOS.value, orcamentoOS.value, pagamentoOS.value, statusOS.value, )
        
        if (idOS.value === "") {
            const OS = {
                desOS: descricaoOS.value,
                matOS: materialOS.value,
                //datOS: dataOS.value,
                orcOS: orcamentoOS.value,
                pagOS: pagamentoOS.value,
                staOS: statusOS.value,
                idCli: idClient.value,
                conOs: dataOS.value
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
    const search = input.value.toLowerCase()

    api.searchClients()

    api.listClients((event, clients) => {
        const dataClients = JSON.parse(clients)
        arrayClients = dataClients

        const results = arrayClients.filter(c =>
            c.nomeCliente && c.nomeCliente.toLowerCase().includes(search)
        ).slice(0, 6)

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
        })
    })
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

    idOS.value = os._id

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
    //IdC.value = os.idCliente
    descricaoOS.value = os.descricao
    materialOS.value = os.material
    dataOS.value = os.data
    orcamentoOS.value = os.orcamento
    pagamentoOS.value = os.pagamento
    statusOS.value = os.status
})

// ============================================================
// == Imprimir OS ============================================= 

function generateOS() {
    api.printOS()
}

// == Fm - Imprimir OS ======================================== 
// ============================================================
