import { Scene } from './scene-window.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';

Scene.screenDragenter = function (this: HTMLElement, event: DragEvent) {
	const file = getBrowserInstance()?.body?.activeFile as { type?: string } | undefined;
	switch (file?.type) {
		case 'actor':
		case 'animation':
		case 'particle':
			Scene.createPreviewObject!(file);
			Scene.screenDragover.call(this, event);
	}
};

Scene.screenDragleave = function (this: HTMLElement, event: DragEvent) {
	if (!this.contains(event.relatedTarget as Node | null)) {
		Scene.deletePreviewObject!();
	}
};

Scene.screenDragover = function (this: HTMLElement, event: DragEvent) {
	if (Scene.previewObject) {
		event.dataTransfer!.dropEffect = 'move';
		event.preventDefault();
		const integer = !event.shiftKey;
		const object = Scene.previewObject;
		let { x, y } = Scene.getTileCoords!(event, integer);
		if (integer) {
			x += 0.5;
			y += 0.5;
		}
		if (object.x !== x || object.y !== y) {
			object.x = x;
			object.y = y;
			Scene.requestRendering!();
		}
	}
};

Scene.screenDrop = function (this: HTMLElement, _event: DragEvent) {
	if (Scene.previewObject) {
		const kind = Scene.previewObject.class;
		const folder = Scene.getDefaultObjectFolder!(kind);
		const fn = Scene.loadObjectContext;
		Scene.loadObjectContext = Function.empty;
		Scene.list.addNodeTo(Scene.previewObject, folder);
		Scene.loadObjectContext = fn;
		Scene.previewObject = null;
	}
};
