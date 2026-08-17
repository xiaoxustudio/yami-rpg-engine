import '@app/legacy/module/command/nestElement.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useNestElementCommandSchema() {
	return useCommandSchema('nestElement', {
		onLoad() {
			getFocus($('#nestElement-parent'));
		}
	});
}
