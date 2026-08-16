import '@/module/command/deleteObject.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteObjectCommandSchema() {
	return useCommandSchema('deleteObject', {
		onLoad() {
			getFocus($('#deleteObject-object'));
		}
	});
}
