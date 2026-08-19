import '@app/legacy/module/command/transferGlobalActor.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useTransferGlobalActorCommandSchema() {
	return useCommandSchema('transferGlobalActor', {
		onLoad() {
			getFocus(document.getElementById('transferGlobalActor-actor'), 'all');
		}
	});
}
