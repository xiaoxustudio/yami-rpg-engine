Object.defineProperties(Event.prototype, {
	dragKey: {
		get: function () {
			return this.spaceKey || this.altKey;
		}
	},
	cmdOrCtrlKey: {
		get:
			process.platform === 'darwin'
				? function (this: any) {
						return this.metaKey;
					}
				: function (this: any) {
						return this.ctrlKey;
					}
	},
	macRedoKey: {
		get:
			process.platform === 'darwin'
				? function (this: any) {
						return this.metaKey && this.shiftKey && this.code === 'KeyZ';
					}
				: function () {
						return false;
					}
	}
});

export const ctrl =
	process.platform === 'darwin'
		? function (keyName: string): string {
				return '⌘+' + keyName;
			}
		: function (keyName: string): string {
				return 'Ctrl+' + keyName;
			};
