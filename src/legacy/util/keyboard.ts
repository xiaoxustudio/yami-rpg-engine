window.addEventListener(
	'keydown',
	function (event: EditorEvent) {
		if (event.cmdOrCtrlKey) {
			switch ((event as KeyboardEvent).code) {
				case 'KeyZ':
				case 'KeyY':
					event.preventDefault();
					break;
				case 'KeyA':
					// 当存在css(user-select: text)元素时 全选将选中该元素和文本框在内的所有文本块
					if (
						document.activeElement instanceof HTMLInputElement ||
						document.activeElement instanceof HTMLTextAreaElement
					) {
						break;
					} else {
						event.preventDefault();
					}
					break;
			}
		}
		switch ((event as KeyboardEvent).code) {
			case 'Space':
				Event.prototype.spaceKey = true;
				break;
		}
	},
	{ capture: true }
);

window.addEventListener(
	'keyup',
	function (event: EditorEvent) {
		switch ((event as KeyboardEvent).code) {
			case 'Space':
				Event.prototype.spaceKey = false;
				break;
		}
	},
	{ capture: true }
);
