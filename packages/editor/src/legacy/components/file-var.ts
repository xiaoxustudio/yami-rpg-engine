import { createFileVarElement, type FileVarApi } from '@ui-kit';
import { customBoxFactory } from './var-factories';

export function createFileVar(): FileVarApi {
	return createFileVarElement({ customBoxFactory });
}
export { defVar } from '@ui-kit';
