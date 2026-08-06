import { createSelectVarElement, type SelectVarApi } from '@ui-kit';
import { customBoxFactory, selectBoxFactory } from './var-factories';

export function createSelectVar(): SelectVarApi {
	return createSelectVarElement({ customBoxFactory, selectBoxFactory });
}
export { defVar } from '@ui-kit';
