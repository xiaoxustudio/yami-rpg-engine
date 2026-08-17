import '@app/legacy/module/command/loadSubscene.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useLoadSubsceneCommandSchema() {
	return useCommandSchema('loadSubscene', {
		onLoad() {
			getFocus($('#loadSubscene-sceneId'));
		}
	});
}
