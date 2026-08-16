import '@/module/command/setTerrain.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTerrainCommandSchema() {
	return useCommandSchema('setTerrain', {
		onLoad() {
			getFocus($('#setTerrain-position'));
		}
	});
}
