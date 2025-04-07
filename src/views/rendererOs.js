let frmOs = document.getElementById('frmOs')
let numeroOs = document.getElementById('txtOs')
let dataOs = document.getElementById('txtData')
let buscarOs = document.getElementById('inputSearchClient')
let nomeOs = document.getElementById('inputNameOs')
let foneOs = document.getElementById('inputPhoneOs')
let cpfOs = document.getElementById('inputCPFOs')
let statusOs = document.getElementById('osStatus')
// evento para enviar os dados da OS
frmOs.addEventListener('submit', async (event) => {
    event.preventDefault()
    const os = {
        numeroOs: numeroOs.value,
        dataOs: dataOs.value,
        buscarOs: buscarOs.value,
        nomeOs: nomeOs.value,
        foneOs: foneOs.value,
        cpfOs: cpfOs.value,
        statusOs: statusOs.value
    }
    console.log(os) // só pra teste
    api.newOs(os)
})