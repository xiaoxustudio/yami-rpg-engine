import '@/module/command/nestElement.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useNestElementCommandSchema() {
	return useCommandSchema('nestElement', {
		onLoad() {
			getFocus($('#nestElement-parent'));
		}
	});
}
