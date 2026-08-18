import '@app/legacy/module/command/setPartyMember.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetPartyMemberCommandSchema() {
	return useCommandSchema('setPartyMember', {
		onLoad() {
			getFocus(document.getElementById('setPartyMember-operation')!);
		}
	});
}
