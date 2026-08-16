import '@/module/command/setTarget.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTargetCommandSchema() {
	return useCommandSchema('setTarget', {
		onLoad() {
			getFocus($('#setTarget-actor'));
		}
	});
}
