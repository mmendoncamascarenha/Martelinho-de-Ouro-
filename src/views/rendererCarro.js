// capturar os dados do formulário de Carro
let frmCar = document.getElementById('frmCar')
let plateCar = document.getElementById('inputPlateCar')
let markCar = document.getElementById('inputMarkCar') 
let modelCar = document.getElementById('inputModelCar')
let yearCar = document.getElementById('inputYearCar')
let colorCar = document.getElementById('inputColorCar')
let descriptionCar = document.getElementById('inputDescriptionCar')

// Evento de submit
frmCar.addEventListener('submit', async (event) => {
    event.preventDefault()

    console.log(
        plateCar.value,
        modelCar.value,
        yearCar.value,
        colorCar.value,
        descriptionCar.value
    )

    const car = {
        placaCarro: plateCar.value,
        marcaCarro: markCar.value,
        modeloCarro: modelCar.value,
        anoCarro: yearCar.value,
        corCarro: colorCar.value,
        descricaoCarro: descriptionCar.value
    }
    api.newCar(car)
})