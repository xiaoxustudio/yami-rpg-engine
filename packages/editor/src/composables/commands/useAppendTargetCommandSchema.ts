import '@app/legacy/module/command/appendTarget.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useAppendTargetCommandSchema() {
	return useCommandSchema('appendTarget', {
		onLoad() {
			getFocus($('#appendTarget-actor'));
		}
	});
}
