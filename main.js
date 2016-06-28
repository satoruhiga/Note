const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const storage = require('electron-json-storage');

const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

const os = require('os');
const path = require('path');
const fs = require('fs');

let mainWindow;
var file_path = null;

ipc.on('open-file-dialog', () => {
	dialog.showOpenDialog({
		properties: ['openFile']
	}, function (files) {
		if (files) {
			if (files.length == 0) return;

			const file = files[0];
			storage.set('file_path', file, function (err) {
				if (err) throw err;
				else reloadFile(file);
			});
		}
	});
});

ipc.on('main-window-loaded', () => {
	storage.get('file_path', function (err, data) {
		if (err) {
			ipc.send('open-file-dialog');
		} else {
			reloadFile(data);
		}
	});
});

ipc.on('edit-file', (e, arg) => {
	if (file_path == null) return;
	fs.writeFile(file_path, arg);
});

function reloadFile(path) {
	if (mainWindow == null) return;

	file_path = path;

	fs.readFile(path, 'utf8', function (err, data) {
		if (err) throw err;
		mainWindow.webContents.send('update-file', data);
	});
}

function createWindow() {
	storage.get('window-size', (e, opt) => {
		if (e) throw e;

		opt['frame'] = false;
		mainWindow = new BrowserWindow(opt);
		mainWindow.loadURL(`file://${__dirname}/index.html`);
		// mainWindow.webContents.openDevTools();
		mainWindow.on('closed', () => {
			mainWindow = null;
		});

		mainWindow.on('close', () => {
			storage.set('window-size', mainWindow.getBounds(), (e) => { });
		});
	});
}

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('ready', () => {
	createWindow();
})

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
})
