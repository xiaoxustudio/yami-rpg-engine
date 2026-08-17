import '@app/legacy/module/command/setZoomFactor.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetZoomFactorCommandSchema() {
	return useCommandSchema('setZoomFactor', {
		onLoad() {
			getFocus($('#setZoomFactor-zoom'), 'all');
		}
	});
}
