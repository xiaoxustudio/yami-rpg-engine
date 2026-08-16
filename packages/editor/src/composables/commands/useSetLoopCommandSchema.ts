import '@/module/command/setLoop.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetLoopCommandSchema() {
	return useCommandSchema('setLoop', {
		onLoad() {
			getFocus($('#setLoop-type'));
		}
	});
}
