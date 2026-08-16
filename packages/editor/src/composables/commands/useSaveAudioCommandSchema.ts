import '@/module/command/saveAudio.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSaveAudioCommandSchema() {
	return useCommandSchema('saveAudio', {
		onLoad() {
			getFocus($('#saveAudio-type'));
		}
	});
}
