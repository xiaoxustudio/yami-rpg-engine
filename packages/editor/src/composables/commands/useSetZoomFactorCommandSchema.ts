import '@/module/command/setZoomFactor.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetZoomFactorCommandSchema() {
	return useCommandSchema('setZoomFactor', {
		onLoad() {
			getFocus($('#setZoomFactor-zoom'), 'all');
		}
	});
}
