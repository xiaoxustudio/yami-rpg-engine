import '@app/legacy/module/command/changePassableTerrain.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangePassableTerrainCommandSchema() {
	return useCommandSchema('changePassableTerrain', {
		onLoad() {
			getFocus(document.getElementById('changePassableTerrain-actor')!);
		}
	});
}
