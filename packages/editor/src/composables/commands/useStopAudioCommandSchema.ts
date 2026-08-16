import '@/module/command/stopAudio.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useStopAudioCommandSchema() {
	return useCommandSchema('stopAudio', {
		onLoad() {
			getFocus($('#stopAudio-type'));
		}
	});
}
