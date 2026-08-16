import '@/module/command/setPartyMember.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetPartyMemberCommandSchema() {
	return useCommandSchema('setPartyMember', {
		onLoad() {
			getFocus($('#setPartyMember-operation'));
		}
	});
}
