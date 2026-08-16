import '@/module/command/deleteTile.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteTileCommandSchema() {
	return useCommandSchema('deleteTile', {
		onLoad() {
			getFocus($('#deleteTile-tilemap'));
		}
	});
}
