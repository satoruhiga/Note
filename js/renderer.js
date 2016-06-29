const ipc = require('electron').ipcRenderer

const settings_btn = document.getElementById('settings_btn')
const main_text_area = document.getElementById('main_text_area');

settings_btn.addEventListener('click', () => {
	ipc.send('open-file-dialog')
});

var timeout = null;
main_text_area.addEventListener('input', (e) => {
	if (timeout) clearTimeout(timeout);
	timeout = setTimeout(() => {
		ipc.send('edit-file', main_text_area.value);
	}, 5000);
});

// TAB
main_text_area.addEventListener('keydown', function (e) {
	if (e.keyCode === 9) {
		e.preventDefault();
		var elem = e.target;
		var val = elem.value;
		var pos = elem.selectionStart;
		elem.value = val.substr(0, pos) + '\t' + val.substr(pos, val.length);
		elem.setSelectionRange(pos + 1, pos + 1);
	}
});

ipc.on('update-file', function (event, arg) {
	main_text_area.value = arg;
})

window.addEventListener('load', () => {
	ipc.send('main-window-loaded');
});
