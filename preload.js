/**
 * Arquivo de pré carregamento(mais desempenho) e reforço de segurança na comunicação entre processos (IPC)
 */

// importação dos recursos do framework electron
// contextBridge (segurança) ipcRenderer (comunicação)
const { contextBridge, ipcRenderer } = require('electron')

// enviar ao main um pedido para conexao do banco de dados e troca do icone no processo 
ipcRenderer.send('db-connect')

// expor (autorizar a comunicação entre processos)
contextBridge.exposeInMainWorld('api', {
    clientWindow: () => ipcRenderer.send('client-window'),
    osWindow: () => ipcRenderer.send('os-window'),
    carroWindow: () => ipcRenderer.send('carro-window'),
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    newClient: (client) => ipcRenderer.send('new-client', client),
    newCarro: (carro) => ipcRenderer.send('new-carro', carro),
    newOS: (os) => ipcRenderer.send('new-os', os),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    searchName: (name) => ipcRenderer.send('search-name', name),
    renderClient: (dataClient) => ipcRenderer.on('renderClient', dataClient),
    validateSearch: () => ipcRenderer.send('validate-search'),
    setClient: (args) => ipcRenderer.on('set-client', args),
    deleteClient: (id) =>ipcRenderer.send('delete-client',id),
    updateClient: (client) => ipcRenderer.send('update-client',client),
    searchOS: () => ipcRenderer.send('search-os'),
    setSearch: (args) => ipcRenderer.on('set-search', args),
    searchClients: (clients) => ipcRenderer.send('search-clients', clients),
    listClients: (clients) => ipcRenderer.on('list-clients', clients),
    validateClient: () => ipcRenderer.send('validate-client'),
    renderOS: (dataOS) => ipcRenderer.on('render-os', dataOS),
    updateOS: (os) => ipcRenderer.send('update-os', os),
    printOS: () => ipcRenderer.send('print-os')

});