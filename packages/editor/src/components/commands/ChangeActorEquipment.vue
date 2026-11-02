<template>
	<WindowFrame
		id="changeActorEquipment"
		:ref="controlRef('changeActorEquipment')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.changeActorEquipment.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorEquipment-actor.label') }}</div>
			<CustomBox
				id="changeActorEquipment-actor"
				:ref="controlRef('changeActorEquipment-actor')"
				v-tip="t('components.changeActorEquipment-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeActorEquipment-operation.label') }}</div>
			<SelectBox
				:label="t('components.changeActorEquipment-operation.label')"
				id="changeActorEquipment-operation"
				v-tip="t('components.changeActorEquipment-operation.tip')"
				:ref="controlRef('changeActorEquipment-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.changeActorEquipment-slot.label') }}</div>
			<SelectVar
				id="changeActorEquipment-slot"
				v-tip="t('components.changeActorEquipment-slot.tip')"
				:ref="controlRef('changeActorEquipment-slot')"
				v-focus
				v-model="form.slot"
			/>
			<div class="text">{{ t('components.changeActorEquipment-equipmentId.label') }}</div>
			<CustomBox
				id="changeActorEquipment-equipmentId"
				v-tip="t('components.changeActorEquipment-equipmentId.tip')"
				:ref="controlRef('changeActorEquipment-equipmentId')"
				v-focus
				type="file"
				filter="equipment"
				v-model="form.equipmentId"
			/>
			<div class="text">{{ t('components.changeActorEquipment-equipment.label') }}</div>
			<CustomBox
				id="changeActorEquipment-equipment"
				v-tip="t('components.changeActorEquipment-equipment.tip')"
				:ref="controlRef('changeActorEquipment-equipment')"
				type="equipment"
				v-model="form.equipment"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorEquipmentCommandSchema } from '@app/composables/commands/useChangeActorEquipmentCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	provideChangeActorEquipmentBridge,
	resetChangeActorEquipmentBridge,
	type ChangeActorEquipmentBridge
} from '@app/composables/change-actor-equipment-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'changeActorEquipment'
	| 'changeActorEquipment-actor'
	| 'changeActorEquipment-equipment'
	| 'changeActorEquipment-equipmentId'
	| 'changeActorEquipment-operation'
	| 'changeActorEquipment-slot';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useChangeActorEquipmentCommandSchema();

/** 控件级能力：schema 载入表单时要候选项，但 schema 不该知道控件 id。 */
const bridgeApi: ChangeActorEquipmentBridge = {
	loadItems: (slotItems) => controls['changeActorEquipment-slot']?.loadItems?.(slotItems)
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	provideChangeActorEquipmentBridge(bridgeApi);
	onUnmounted(() => resetChangeActorEquipmentBridge(bridgeApi));
	useLocalizedOptions(
		'changeActorEquipment-operation',
		['add', 'remove', 'add-instance', 'remove-instance', 'remove-slot'],
		(items) => controls['changeActorEquipment-operation']?.loadItems?.(items),
		{
			add: 'command.changeActorEquipment.add',
			remove: 'command.changeActorEquipment.remove',
			'add-instance': 'command.changeActorEquipment.add-instance',
			'remove-instance': 'command.changeActorEquipment.remove-instance',
			'remove-slot': 'command.changeActorEquipment.remove-slot'
		}
	);
	controls['changeActorEquipment-operation']?.enableHiddenMode?.();
	controls['changeActorEquipment-operation']?.relate?.([
		{
			case: 'add',
			targets: [
				controlRoot(controls['changeActorEquipment-slot']),
				controlRoot(controls['changeActorEquipment-equipmentId'])
			]
		},
		{
			case: 'remove',
			targets: [controlRoot(controls['changeActorEquipment-equipmentId'])]
		},
		{
			case: 'add-instance',
			targets: [
				controlRoot(controls['changeActorEquipment-slot']),
				controlRoot(controls['changeActorEquipment-equipment'])
			]
		},
		{
			case: 'remove-instance',
			targets: [controlRoot(controls['changeActorEquipment-equipment'])]
		},
		{
			case: 'remove-slot',
			targets: [controlRoot(controls['changeActorEquipment-slot'])]
		}
	]);
});
</script>

<style>
#changeActorEquipment {
	width: 324px;
	height: 170px;
}

#changeActorEquipment-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorEquipment-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
