import '@app/legacy/module/command/label.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useLabelCommandSchema() {
	return useCommandSchema('label', {
		onLoad() {
			getFocus($('#label-name'), 'all');
		}
	});
}
