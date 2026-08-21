const platform = typeof process !== 'undefined' ? process.platform : '';

export const showInExplorerCommand =
	platform === 'win32' ? 'showInExplorer' : platform === 'darwin' ? 'showInFinder' : '';

if (platform === 'darwin') {
	document.documentElement.classList.add('darwin');
}
