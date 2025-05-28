/**
 * Modelo de dados para construção das coleções("tabelas")
 * Clientes 
 */

// importação dos recursos do framework mongoose 
const { model, Schema} = require('mongoose')


// criação da estrutura da coleção Clientes
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
}, {versionKey: false})  // nao versionaros os dados armazenados

// exportar para o main o modelo de dados
// OBS: Clientes sera o nome da coleção 

module.exports = model('clientes', clienteSchema)
    