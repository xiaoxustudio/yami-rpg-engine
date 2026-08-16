import '@/module/command/waitForVideo.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useWaitForVideoCommandSchema() {
	return useCommandSchema('waitForVideo', {
		onLoad() {
			getFocus($('#waitForVideo-element'));
		}
	});
}
