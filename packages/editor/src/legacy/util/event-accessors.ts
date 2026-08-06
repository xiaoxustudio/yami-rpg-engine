Object.defineProperties(Event.prototype, {
	dragKey: {
		get: function () {
			return this.spaceKey || this.altKey;
		}
	}
});

export function macRedoKey(e: any): boolean {
	return process.platform === 'darwin' ? e.metaKey && e.shiftKey && e.code === 'KeyZ' : false;
}

export const ctrl =
	process.platform === 'darwin'
		? function (keyName: string): string {
				return '⌘+' + keyName;
			}
		: function (keyName: string): string {
				return 'Ctrl+' + keyName;
			};
