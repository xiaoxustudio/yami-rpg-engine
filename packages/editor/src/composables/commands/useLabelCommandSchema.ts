import '@/module/command/label.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useLabelCommandSchema() {
	return useCommandSchema('label', {
		onLoad() {
			getFocus($('#label-name'), 'all');
		}
	});
}
