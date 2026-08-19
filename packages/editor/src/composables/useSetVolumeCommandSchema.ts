import '@app/legacy/module/command/setVolume.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetVolumeCommandSchema() {
	return useCommandSchema('setVolume', {
		onLoad() {
			getFocus(document.getElementById('setVolume-type'));
		}
	});
}
