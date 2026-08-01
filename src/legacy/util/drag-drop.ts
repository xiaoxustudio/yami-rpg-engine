{
	let dragging = false;
	let osdragging = false;

	const dragstart = function (event: EditorEvent): void {
		dragging = true;
		event.preventDefault();
		window.on('pointerup', pointerup);
	};

	const dragend = function (event: EditorEvent): void {
		if (dragging) {
			dragging = false;
			window.off('pointerup', pointerup);
		}
	};

	const pointerup = function (event: EditorEvent): void {
		if (dragging) {
			dragging = false;
			window.off('pointerup', pointerup);
		}
	};

	const dragenter = function (event: EditorEvent): void {
		if (!dragging && !osdragging && !(event as DragEvent).relatedTarget) {
			osdragging = true;
			window.dispatchEvent(new DragEvent('os-dragstart'));
			window.on('dragleave', dragleave);
			window.on('dragover', dragover);
			window.on('drop', drop);
		}
	};

	const dragleave = function (event: EditorEvent): void {
		if (osdragging && !(event as DragEvent).relatedTarget) {
			osdragging = false;
			window.dispatchEvent(new DragEvent('os-dragend'));
			window.off('dragleave', dragleave);
			window.off('dragover', dragover);
			window.off('drop', drop);
		}
	};

	const dragover = function (event: EditorEvent): void {
		event.preventDefault();
	};

	const drop = function (event: EditorEvent): void {
		if (osdragging) {
			osdragging = false;
			window.dispatchEvent(new DragEvent('os-dragend'));
			window.off('dragleave', dragleave);
			window.off('dragover', dragover);
			window.off('drop', drop);
		}
	};

	window.on('dragstart', dragstart);
	window.on('dragend', dragend);
	window.on('dragenter', dragenter);
}
