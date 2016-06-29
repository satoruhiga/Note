const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const storage = require('electron-json-storage');
const chokidar = require('chokidar');

const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

const os = require('os');
const path = require('path');
const fs = require('fs');

let mainWindow;
var file_path = null;

// storage.clear(() => { });

ipc.on('open-file-dialog', () => {
	open_file_dialog();
});


ipc.on('edit-file', (e, arg) => {
	if (file_path == null) return;
	fs.writeFile(file_path, arg);
});

function readFile() {
	try {
		data = fs.readFileSync(file_path);
		var t = data.toString('utf8');
		// console.log(t);
		mainWindow.webContents.send('update-file', t);
	} catch (e) {
		console.log('readFile failed');
		console.log(e);
	}
}

var watcher = null;
function setWatchPath() {
	storage.get("file_path", (e, data) => {
		file_path = data;
		
		if (watcher) watcher.close();

		watcher = chokidar.watch(file_path);
		watcher.on('all', (event, path) => {
			readFile(path);
			console.log(event + ' to ' + path);
		});

		readFile();
	});
}

function createWindow() {
	storage.get('window-size', (e, opt) => {
		if (e) opt = {};
		opt['frame'] = false;

		storage.get('file_path', (e, data) => {
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
	}
})

function open_file_dialog() {
		dialog.showOpenDialog({
		properties: ['openFile']
	}, function (files) {
		if (files) {
			if (files.length == 0) return;

			const file = files[0];
			
			storage.set('file_path', file, function (err) {
				if (err) throw err;
				setWatchPath();
			});
		}
	});
}

ipc.on('main-window-loaded', () => {
	storage.has('file_path', (e, hasKey) => {
		if (!hasKey) {
			open_file_dialog();
		}	else {
			setWatchPath();
		}
	});
});