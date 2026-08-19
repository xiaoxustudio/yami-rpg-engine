import '@app/legacy/module/command/setTeamRelation.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTeamRelationCommandSchema() {
	return useCommandSchema('setTeamRelation', {
		onLoad() {
			getFocus(document.getElementById('setTeamRelation-teamId1'));
		}
	});
}
