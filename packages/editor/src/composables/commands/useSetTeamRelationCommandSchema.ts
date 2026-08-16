import '@/module/command/setTeamRelation.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTeamRelationCommandSchema() {
	return useCommandSchema('setTeamRelation', {
		onLoad() {
			getFocus($('#setTeamRelation-teamId1'));
		}
	});
}
