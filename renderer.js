// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const ipc = require('electron').ipcRenderer

const settings_btn = document.getElementById('settings_btn')
const main_text_area = document.getElementById('main_text_area');

settings_btn.addEventListener('click', function (event) {
	ipc.send('open-file-dialog')
})

var timeout = null;
main_text_area.addEventListener('input', (e) => {
	if (timeout) clearTimeout(timeout);
	timeout = setTimeout(() => {
		ipc.send('edit-file', main_text_area.value);
	}, 1000);
});

ipc.on('update-file', function (event, arg) {
	main_text_area.textContent = arg;
})

window.addEventListener('load', () => {
	ipc.send('main-window-loaded');
});
