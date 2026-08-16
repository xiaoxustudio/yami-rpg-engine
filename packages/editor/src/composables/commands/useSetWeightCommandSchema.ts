import '@/module/command/setWeight.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetWeightCommandSchema() {
	return useCommandSchema('setWeight', {
		onLoad() {
			getFocus($('#setWeight-actor'));
		}
	});
}
