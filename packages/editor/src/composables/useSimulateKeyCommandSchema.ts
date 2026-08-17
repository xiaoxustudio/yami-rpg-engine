import '@app/legacy/module/command/simulateKey.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSimulateKeyCommandSchema() {
	return useCommandSchema('simulateKey', {
		onLoad() {
			getFocus($('#simulateKey-operation'));
		}
	});
}
