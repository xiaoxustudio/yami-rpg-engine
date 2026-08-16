import '@/module/command/wait.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useWaitCommandSchema() {
	return useCommandSchema('wait', {
		onLoad() {
			getFocus($('#wait-duration'), 'all');
		}
	});
}
