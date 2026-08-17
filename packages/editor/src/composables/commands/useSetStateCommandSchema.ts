import '@app/legacy/module/command/setState.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetStateCommandSchema() {
	return useCommandSchema('setState', {
		onLoad() {
			getFocus($('#setState-state'));
		}
	});
}
