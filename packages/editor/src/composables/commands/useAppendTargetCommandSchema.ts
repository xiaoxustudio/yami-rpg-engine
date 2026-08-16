import '@/module/command/appendTarget.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useAppendTargetCommandSchema() {
	return useCommandSchema('appendTarget', {
		onLoad() {
			getFocus($('#appendTarget-actor'));
		}
	});
}
