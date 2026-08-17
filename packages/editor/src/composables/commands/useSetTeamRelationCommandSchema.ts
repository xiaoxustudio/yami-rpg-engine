import '@app/legacy/module/command/setTeamRelation.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTeamRelationCommandSchema() {
	return useCommandSchema('setTeamRelation', {
		onLoad() {
			getFocus($('#setTeamRelation-teamId1'));
		}
	});
}
