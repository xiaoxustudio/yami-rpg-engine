import '@app/legacy/module/command/waitForVideo.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useWaitForVideoCommandSchema() {
	return useCommandSchema('waitForVideo', {
		onLoad() {
			getFocus($('#waitForVideo-element'));
		}
	});
}
