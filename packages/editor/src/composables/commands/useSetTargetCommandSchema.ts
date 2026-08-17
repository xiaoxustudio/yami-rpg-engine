import '@app/legacy/module/command/setTarget.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTargetCommandSchema() {
	return useCommandSchema('setTarget', {
		onLoad() {
			getFocus($('#setTarget-actor'));
		}
	});
}
