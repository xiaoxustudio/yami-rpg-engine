import '@app/legacy/module/command/stopAudio.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useStopAudioCommandSchema() {
	return useCommandSchema('stopAudio', {
		onLoad() {
			getFocus($('#stopAudio-type'));
		}
	});
}
