import {
	createCustomBoxElement,
	createNumberBoxElement,
	createSelectBoxElement,
	createTextBoxElement,
	createTextAreaElement
} from '@ui-kit';
import { customBoxOptions } from './custom-box-opts';
import { Select } from '@app/components/select-list';
import { measureText } from '@app/utils/dom';
import { listenDraggingScrollbarEvent } from '@app/utils/element-utils';

export const customBoxFactory = () => createCustomBoxElement(customBoxOptions);
export const numberBoxFactory = (dom?: HTMLElement | null) =>
	createNumberBoxElement({ dom, measureText });
export const selectBoxFactory = () => createSelectBoxElement({ popup: (box) => Select.open(box) });
export const textBoxFactory = () => createTextBoxElement();
export const textAreaFactory = () => createTextAreaElement({ listenDraggingScrollbarEvent });
