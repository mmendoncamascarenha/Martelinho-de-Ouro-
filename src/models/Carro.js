/**
 * Modelo de dados para construção das coleções("tabelas")
 * Clientes 
 */

// importação dos recursos do framework mongoose 
const { model, Schema} = require('mongoose')


// criação da estrutura da coleção Clientes
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
    //descricaoCarro:{
       // type: String,
   //},
}, {versionKey: false})  // nao versionaros os dados armazenados

// exportar para o main o modelo de dados
// OBS: Clientes sera o nome da coleção 

module.exports = model('carro', carroSchema)
    