import { createNumberVarElement, type NumberVarApi } from '@ui-kit';
import { customBoxFactory, numberBoxFactory } from './var-factories';

export function createNumberVar(): NumberVarApi {
	return createNumberVarElement({ customBoxFactory, numberBoxFactory });
}
export { defVar, defVarForPlugin } from '@ui-kit';
