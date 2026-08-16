import '@/module/command/setPan.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetPanCommandSchema() {
	return useCommandSchema('setPan', {
		onLoad() {
			getFocus($('#setPan-type'));
		}
	});
}
