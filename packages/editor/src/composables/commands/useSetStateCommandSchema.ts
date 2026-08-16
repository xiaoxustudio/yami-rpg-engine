import '@/module/command/setState.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetStateCommandSchema() {
	return useCommandSchema('setState', {
		onLoad() {
			getFocus($('#setState-state'));
		}
	});
}
