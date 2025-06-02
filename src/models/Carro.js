const { model, Schema} = require('mongoose')
const carroSchema = new Schema ({
    placaCarro:{
        type: String
    },
    marcaCarro:{
        type: String
    },
    modeloCarro:{
        type: String
    },
    anoCarro:{
        type: String
    }, 
    corCarro:{
        type: String
    }, 
}, {versionKey: false})  
module.exports = model('carro', carroSchema)
    