import '@app/legacy/module/command/setTerrain.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTerrainCommandSchema() {
	return useCommandSchema('setTerrain', {
		onLoad() {
			getFocus(document.getElementById('setTerrain-position'));
		}
	});
}
