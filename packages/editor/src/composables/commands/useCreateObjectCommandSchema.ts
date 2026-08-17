import '@app/legacy/module/command/createObject.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateObjectCommandSchema() {
	return useCommandSchema('createObject', {
		onLoad() {
			getFocus($('#createObject-presetId'));
		}
	});
}
