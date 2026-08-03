{
	let dragging = false;
	let osdragging = false;

	const dragstart = function (event: EditorEvent): void {
		dragging = true;
		event.preventDefault();
		window.addEventListener('pointerup', pointerup);
	};

	const dragend = function (event: EditorEvent): void {
		if (dragging) {
			dragging = false;
			window.removeEventListener('pointerup', pointerup);
		}
	};

	const pointerup = function (event: EditorEvent): void {
		if (dragging) {
			dragging = false;
			window.removeEventListener('pointerup', pointerup);
		}
	};

	const dragenter = function (event: EditorEvent): void {
		if (!dragging && !osdragging && !(event as DragEvent).relatedTarget) {
			osdragging = true;
			window.dispatchEvent(new DragEvent('os-dragstart'));
			window.addEventListener('dragleave', dragleave);
			window.addEventListener('dragover', dragover);
			window.addEventListener('drop', drop);
		}
	};

	const dragleave = function (event: EditorEvent): void {
		if (osdragging && !(event as DragEvent).relatedTarget) {
			osdragging = false;
			window.dispatchEvent(new DragEvent('os-dragend'));
			window.removeEventListener('dragleave', dragleave);
			window.removeEventListener('dragover', dragover);
			window.removeEventListener('drop', drop);
		}
	};

	const dragover = function (event: EditorEvent): void {
		event.preventDefault();
	};

	const drop = function (event: EditorEvent): void {
		if (osdragging) {
			osdragging = false;
			window.dispatchEvent(new DragEvent('os-dragend'));
			window.removeEventListener('dragleave', dragleave);
			window.removeEventListener('dragover', dragover);
			window.removeEventListener('drop', drop);
		}
	};

	window.addEventListener('dragstart', dragstart);
	window.addEventListener('dragend', dragend);
	window.addEventListener('dragenter', dragenter);
}
