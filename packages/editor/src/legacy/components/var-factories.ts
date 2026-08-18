import {
	createCustomBoxElement,
	createNumberBoxElement,
	createSelectBoxElement,
	createTextBoxElement,
	createTextAreaElement
} from '@ui-kit';
import { customBoxOptions } from './custom-box-opts';
import { Select } from './select-list';
import { measureText } from '@app/legacy/util/dom';
import { listenDraggingScrollbarEvent } from '@app/legacy/util/element-utils';

export const customBoxFactory = () => createCustomBoxElement(customBoxOptions);
export const numberBoxFactory = (dom?: HTMLElement | null) =>
	createNumberBoxElement({ dom, measureText });
export const selectBoxFactory = () => createSelectBoxElement({ popup: (box) => Select.open(box) });
export const textBoxFactory = () => createTextBoxElement();
export const textAreaFactory = () => createTextAreaElement({ listenDraggingScrollbarEvent });
