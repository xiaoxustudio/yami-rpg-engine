import '@app/legacy/module/command/createObject.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateObjectCommandSchema() {
	return useCommandSchema('createObject', {
		onLoad() {
			getFocus(document.getElementById('createObject-presetId'));
		}
	});
}
