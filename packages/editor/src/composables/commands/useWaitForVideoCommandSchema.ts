import '@app/legacy/module/command/waitForVideo.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useWaitForVideoCommandSchema() {
	return useCommandSchema('waitForVideo', {
		onLoad() {
			getFocus(document.getElementById('waitForVideo-element'));
		}
	});
}
