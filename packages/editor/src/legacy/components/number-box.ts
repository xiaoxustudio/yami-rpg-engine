import { createNumberBoxElement, type NumberBoxApi } from '@ui-kit';
import { measureText } from '@app/legacy/util/dom';

export function createNumberBox(dom?: HTMLElement | null): NumberBoxApi {
	return createNumberBoxElement({ dom, measureText });
}
