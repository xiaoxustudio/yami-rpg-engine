import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { pinia } from './pinia';
import type { ActorGetterForm } from '@app/composables/useActorGetterWindow';
import type { AncestorGetterForm } from '@app/composables/useAncestorGetterWindow';
import type { AngleGetterForm } from '@app/composables/useAngleGetterWindow';
import type { ElementGetterForm } from '@app/composables/useElementGetterWindow';
import type { EquipmentGetterForm } from '@app/composables/useEquipmentGetterWindow';
import type { ItemGetterForm } from '@app/composables/useItemGetterWindow';
import type { PositionGetterForm } from '@app/composables/usePositionGetterWindow';
import type { RegionGetterForm } from '@app/composables/useRegionGetterWindow';
import type { SkillGetterForm } from '@app/composables/useSkillGetterWindow';
import type { StateGetterForm } from '@app/composables/useStateGetterWindow';
import type { TilemapGetterForm } from '@app/composables/useTilemapGetterWindow';
import type { TriggerGetterForm } from '@app/composables/useTriggerGetterWindow';
import type { VariableGetterForm } from '@app/composables/useVariableGetterWindow';

export const useGetterWindowsStore = defineStore('getterWindows', () => {
	const actorGetterForm = reactive<ActorGetterForm>({
		type: 'trigger',
		memberId: 0,
		actorId: '',
		presetId: '',
		variable: { type: 'local', key: '' }
	});

	const ancestorGetterForm = reactive<AncestorGetterForm>({
		type: 'trigger',
		presetId: '',
		variable: { type: 'local', key: '' }
	});

	const angleGetterForm = reactive<AngleGetterForm>({
		type: 'position',
		position: { type: 'actor', actor: { type: 'trigger' } },
		degrees: 0
	});

	const elementGetterForm = reactive<ElementGetterForm>({
		type: 'trigger',
		presetId: '',
		ancestor: { type: 'trigger' },
		index: 0,
		variable: { type: 'local', key: '' }
	});

	const equipmentGetterForm = reactive<EquipmentGetterForm>({
		type: 'trigger',
		actor: { type: 'trigger' },
		slot: '',
		equipmentId: '',
		variable: { type: 'local', key: '' }
	});

	const itemGetterForm = reactive<ItemGetterForm>({
		type: 'trigger',
		actor: { type: 'trigger' },
		key: '',
		itemId: '',
		variable: { type: 'local', key: '' }
	});

	const positionGetterForm = reactive<PositionGetterForm>({
		type: 'absolute',
		x: 0,
		y: 0,
		actor: { type: 'trigger' },
		trigger: { type: 'trigger' },
		light: { type: 'trigger' },
		region: { type: 'trigger' },
		mode: 'center',
		objectId: ''
	});

	const regionGetterForm = reactive<RegionGetterForm>({
		type: 'trigger',
		presetId: ''
	});

	const skillGetterForm = reactive<SkillGetterForm>({
		type: 'trigger',
		actor: { type: 'trigger' },
		key: '',
		skillId: '',
		variable: { type: 'local', key: '' }
	});

	const stateGetterForm = reactive<StateGetterForm>({
		type: 'trigger',
		actor: { type: 'trigger' },
		stateId: '',
		variable: { type: 'local', key: '' }
	});

	const tilemapGetterForm = reactive<TilemapGetterForm>({
		type: 'trigger',
		presetId: '',
		variable: { type: 'local', key: '' }
	});

	const triggerGetterForm = reactive<TriggerGetterForm>({
		type: 'trigger',
		variable: { type: 'local', key: '' }
	});

	const variableGetterForm = reactive<VariableGetterForm>({
		type: '',
		actor: { type: 'trigger' },
		skill: { type: 'trigger' },
		state: { type: 'trigger' },
		equipment: { type: 'trigger' },
		item: { type: 'trigger' },
		element: { type: 'trigger' },
		commonKey: '',
		presetKey: '',
		globalKey: ''
	});

	return {
		actorGetterForm,
		ancestorGetterForm,
		angleGetterForm,
		elementGetterForm,
		equipmentGetterForm,
		itemGetterForm,
		positionGetterForm,
		regionGetterForm,
		skillGetterForm,
		stateGetterForm,
		tilemapGetterForm,
		triggerGetterForm,
		variableGetterForm
	};
});

export function getGetterWindowsStore() {
	return useGetterWindowsStore(pinia);
}
