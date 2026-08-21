import { createTextAreaVarElement, type TextAreaVarApi } from '@ui-kit';
import { customBoxFactory, textAreaFactory } from './var-factories';

export function createTextAreaVar(): TextAreaVarApi {
	return createTextAreaVarElement({ customBoxFactory, textAreaFactory });
}
export { defVar } from '@ui-kit';
