import '@/module/command/simulateKey.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSimulateKeyCommandSchema() {
	return useCommandSchema('simulateKey', {
		onLoad() {
			getFocus($('#simulateKey-operation'));
		}
	});
}
