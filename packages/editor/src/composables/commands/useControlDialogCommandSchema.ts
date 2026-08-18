import '@app/legacy/module/command/controlDialog.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useControlDialogCommandSchema() {
	return useCommandSchema('controlDialog', {
		onLoad() {
			getFocus(document.getElementById('controlDialog-element')!);
		}
	});
}
