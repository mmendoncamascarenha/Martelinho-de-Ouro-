/**
 * Atualização automática do ano e da data
 * @author Murillo Mendonca 
 */

//***************************************************Função para formatar a data****************************************************
function formatarData() {
    const hoje = new Date();
    const opcoes = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    let dataFormatada = hoje.toLocaleDateString('pt-BR', opcoes);

    //***************************************Capitaliza a primeira letra do dia da semana******************************************
    dataFormatada = dataFormatada.replace(/^\w/, (c) => c.toUpperCase());
    return dataFormatada;
}

//***********************************************Objeto para armazenar os dados da data*******************************************
let dados = {
    anoAtual: new Date().getFullYear(),
    dataAtual: formatarData(),
};

//***************************************************Exibindo o ano no HTML (no rodapé)********************************************
let ano = document.getElementById('copyrightYear');
if (ano) {
   ano.innerHTML = dados.anoAtual;
}

//***************************************************Exibindo a data no HTML (no rodapé)********************************************
let dataElemento = document.getElementById('dataAtual');
if (dataElemento) {
    dataElemento.innerHTML = dados.dataAtual;
}

//***********************************************Função para atualizar a data, caso necessário************************************
function atualizarData() {
    dados.dataAtual = formatarData(); //*Atualiza a data no objeto*
    if (dataElemento) {
        dataElemento.innerHTML = dados.dataAtual; //*Atualiza o conteúdo no HTML*
    }
}

//******************************************Chamada para atualizar a data automaticamente, caso necessário**************************
setInterval(atualizarData, 1000 * 60 * 60); //*Atualiza a data a cada hora*