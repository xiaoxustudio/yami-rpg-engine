import '@/module/command/controlDialog.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useControlDialogCommandSchema() {
	return useCommandSchema('controlDialog', {
		onLoad() {
			getFocus($('#controlDialog-element'));
		}
	});
}
