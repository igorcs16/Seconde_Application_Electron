const electron = require('electron');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let commentWindow;
let commentMenu = null; // Sem a barra de menu na janela de comentário

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(`file://${__dirname}/main.html`);
    mainWindow.on('closed', () => app.quit());
    //mainWindow.setFullScreen(true);

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

function createCommentWindow() {
    commentWindow = new BrowserWindow({
        width: 500,
        height: 300,
        title: 'Novo comentário',
        webPreferences: {
            nodeIntegration: true
        }
    });

    commentWindow.loadURL(`file://${__dirname}/comment.html`);
    // tirando referencia do objeto para o garbage collector liberar a memória
    commentWindow.on('closed', () => commentWindow = null);

    if (process.platform !== 'darwin') {
        commentWindow.setMenu(commentMenu);
    }
}

ipcMain.on('addComment', (event, comment) => {
    mainWindow.webContents.send('addComment', comment);
    commentWindow.close();
});

const menuTemplate = [
    {
        label: 'Menu',
        submenu: [
            {
                label: 'Adicionar Comentário',
                click() {
                    createCommentWindow();
                }
            },
            {
                label: 'Sair',
                accelerator: process.platform === 'linux' ? 'Alt+F4' :
                             process.platform === 'win32' ? 'Alt+F4' : 'Cmd+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
]

if (process.platform === 'darwin'){
    menuTemplate.unshift({});
}

if (process.env.NODE_ENV !== 'production') {
    //development
    //production
    //test... etc
    const devTemplate = {
        label: 'Dev',
        submenu: [
            {
                label: 'Reiniciar' ,
                role: 'reload' 
            },

            {
                label:'Debug',
                accelerator: process.platform === 'linux' ? 'Ctrl+Shift+I' :
                             process.platform === 'win32' ? 'Ctrl+Shift+I' : 'Command+a',
                click(items, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
        ],
    };

    menuTemplate.push(devTemplate);

    if (process.platform !== 'darwin') {
        commentMenu = Menu.buildFromTemplate([devTemplate]);
    }
}