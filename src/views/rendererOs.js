 // capturar os dados do input do formulario (passo 1 do fluxo)
let frmOs = document.getElementById('frmOs')
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