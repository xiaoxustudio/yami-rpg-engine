import '@app/legacy/module/command/setLoop.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetLoopCommandSchema() {
	return useCommandSchema('setLoop', {
		onLoad() {
			getFocus(document.getElementById('setLoop-type'));
		}
	});
}
