import '@/module/command/setResolution.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetResolutionCommandSchema() {
	return useCommandSchema('setResolution', {
		onLoad() {
			getFocus($('#setResolution-width'), 'all');
		}
	});
}
