import '@/module/command/clampCamera.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useClampCameraCommandSchema() {
	return useCommandSchema('clampCamera', {
		onLoad() {
			getFocus($('#clampCamera-left'), 'all');
		}
	});
}
