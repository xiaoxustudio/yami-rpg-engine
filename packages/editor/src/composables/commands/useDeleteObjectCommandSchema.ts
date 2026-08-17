import '@app/legacy/module/command/deleteObject.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteObjectCommandSchema() {
	return useCommandSchema('deleteObject', {
		onLoad() {
			getFocus($('#deleteObject-object'));
		}
	});
}
