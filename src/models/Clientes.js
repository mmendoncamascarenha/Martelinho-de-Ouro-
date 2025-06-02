const { model, Schema} = require('mongoose')
const clienteSchema = new Schema ({
    nomeCliente:{
        type: String
    }, 
    cpfCliente:{
        type: String
    },
    emailCliente:{
        type: String,
    },
    foneCliente:{
        type: String
    },
    cepCliente:{
        type: String,
        
    },
    logradouroCliente:{
        type: String
    },
    numeroCliente:{
        type: String
    },
    complementoCliente:{
        type: String
    },
    bairroCliente: {
        type: String
    },
    cidadeCliente:{
        type: String
    },
    ufCliente:{
        type: String
    },
}, {versionKey: false})  
module.exports = model('clientes', clienteSchema)
    