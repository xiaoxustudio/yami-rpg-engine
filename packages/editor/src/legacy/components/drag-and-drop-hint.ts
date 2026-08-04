import {
	attachDragAndDropHintApi as attachApi,
	createDragAndDropHintElement,
	type DragAndDropHintApi
} from '@ui-kit';

export function attachDragAndDropHintApi(el: HTMLElement): void {
	attachApi(el);
}

export function createDragAndDropHint(): DragAndDropHintApi {
	return createDragAndDropHintElement();
}
