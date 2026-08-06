import { createNumberBoxElement, type NumberBoxApi } from '@ui-kit';
import { measureText } from '@/util/dom';

export function createNumberBox(dom?: any): NumberBoxApi {
	return createNumberBoxElement({ dom, measureText });
}
