import '@/module/command/setVolume.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetVolumeCommandSchema() {
	return useCommandSchema('setVolume', {
		onLoad() {
			getFocus($('#setVolume-type'));
		}
	});
}
