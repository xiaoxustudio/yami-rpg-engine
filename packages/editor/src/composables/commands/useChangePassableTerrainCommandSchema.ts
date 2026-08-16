import '@/module/command/changePassableTerrain.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangePassableTerrainCommandSchema() {
	return useCommandSchema('changePassableTerrain', {
		onLoad() {
			getFocus($('#changePassableTerrain-actor'));
		}
	});
}
