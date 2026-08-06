import { createStringVarElement, type StringVarApi } from '@ui-kit';
import { customBoxFactory, textBoxFactory } from './var-factories';

export function createStringVar(): StringVarApi {
	return createStringVarElement({ customBoxFactory, textBoxFactory });
}
export { defVar } from '@ui-kit';
