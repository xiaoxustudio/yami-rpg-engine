import { createCustomBoxElement, type CustomBoxApi } from '@ui-kit';
import { customBoxOptions } from './custom-box-opts';

export function createCustomBox(): CustomBoxApi {
	return createCustomBoxElement(customBoxOptions);
}
