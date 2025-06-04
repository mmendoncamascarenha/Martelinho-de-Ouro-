/**
 * Modelo de dados para construção das coleções("tabelas")
 * OS
 */

// importação dos recursos do framework mongoose
const { model, Schema } = require('mongoose')

// criação da estrutura da coleção OS
const osSchema = new Schema({
    dataEntrada: {
        type: Date,
        default: Date.now
    },
    dataConclusao: {
        type: String,
    },
    idClient: {
        type: String,        
    },
    statusOS: {
        type: String
    },
    problema: {
        type: String  
    },
    observacao: {
        type: String
    },
    tecnico: {
        type: String  
    },
    diagnostico: {
        type: String  
    },
    pecas: {
        type: String 
    },
    orcamento: {
        type: String 
    },
    pagamento: {    
        type: String
    }
}, {versionKey: false}) //não versionar os dados armazenados

// exportar para o main o modelo de dados
// OBS: OS 
module.exports = model('OS', osSchema)