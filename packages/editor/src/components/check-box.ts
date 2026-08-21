import { createCheckBoxElement, type CheckBoxApi } from '@ui-kit';

export function createCheckBox(standard?: boolean): CheckBoxApi {
	return createCheckBoxElement({ standard });
}
