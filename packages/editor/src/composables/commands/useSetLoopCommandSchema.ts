import '@app/legacy/module/command/setLoop.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetLoopCommandSchema() {
	return useCommandSchema('setLoop', {
		onLoad() {
			getFocus($('#setLoop-type'));
		}
	});
}
