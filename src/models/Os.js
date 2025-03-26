/**
 * Modelo de dados para construção das coleções("tabelas")
 * Clientes 
 */

// importação dos recursos do framework mongoose 
const { model, Schema} = require('mongoose')


// criação da estrutura da coleção Clientes
const clienteSchema = new Schema ({
    numeroOs:{
        type: String
    },
    dataOs:{
        type: String
    },
    buscarOs:{
        type: String
    },
    nomeOs:{
        type: String
    }, 
    foneOs:{
        type: String
    },
    cpfOs:{
        type: String,
        unique: true,
        index : true
    },
    statusOs:{
        type: String,
    },
}, {versionKey: false})  // nao versionaros os dados armazenados

// exportar para o main o modelo de dados
// OBS: Clientes sera o nome da coleção 

module.exports = model('os', clienteSchema)
    