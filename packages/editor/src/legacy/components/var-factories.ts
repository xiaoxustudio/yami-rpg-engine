import {
	createCustomBoxElement,
	createNumberBoxElement,
	createSelectBoxElement,
	createTextBoxElement,
	createTextAreaElement
} from '@ui-kit';
import { customBoxOptions } from './custom-box-opts';
import { Select } from './select-list';
import { measureText } from '@/util/dom';
import { listenDraggingScrollbarEvent } from '@/util/element-utils';

export const customBoxFactory = () => createCustomBoxElement(customBoxOptions);
export const numberBoxFactory = (dom?: any) => createNumberBoxElement({ dom, measureText });
export const selectBoxFactory = () =>
	createSelectBoxElement({ popup: (box) => (Select as any).open(box) });
export const textBoxFactory = () => createTextBoxElement();
export const textAreaFactory = () => createTextAreaElement({ listenDraggingScrollbarEvent });
