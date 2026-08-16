import '@/module/command/createObject.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateObjectCommandSchema() {
	return useCommandSchema('createObject', {
		onLoad() {
			getFocus($('#createObject-presetId'));
		}
	});
}
