<template>
	<WindowFrame
		id="changeActorEquipment"
		:ref="registryRef(fieldEls, 'changeActorEquipment')"
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
				:ref="registryRef(fieldEls, 'changeActorEquipment-actor')"
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
				:ref="registryRef(fieldEls, 'changeActorEquipment-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.changeActorEquipment-slot.label') }}</div>
			<SelectVar
				id="changeActorEquipment-slot"
				v-tip="t('components.changeActorEquipment-slot.tip')"
				:ref="registryRef(fieldEls, 'changeActorEquipment-slot')"
				v-focus
				v-model="form.slot"
			/>
			<div class="text">{{ t('components.changeActorEquipment-equipmentId.label') }}</div>
			<CustomBox
				id="changeActorEquipment-equipmentId"
				v-tip="t('components.changeActorEquipment-equipmentId.tip')"
				:ref="registryRef(fieldEls, 'changeActorEquipment-equipmentId')"
				v-focus
				type="file"
				filter="equipment"
				v-model="form.equipmentId"
			/>
			<div class="text">{{ t('components.changeActorEquipment-equipment.label') }}</div>
			<CustomBox
				id="changeActorEquipment-equipment"
				v-tip="t('components.changeActorEquipment-equipment.tip')"
				:ref="registryRef(fieldEls, 'changeActorEquipment-equipment')"
				type="equipment"
				v-model="form.equipment"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorEquipmentCommandSchema } from '@app/composables/commands/useChangeActorEquipmentCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorEquipmentCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'changeActorEquipment-operation',
		['add', 'remove', 'add-instance', 'remove-instance', 'remove-slot'],
		(items) => fieldEls.get('changeActorEquipment-operation')?.loadItems?.(items),
		{
			add: 'command.changeActorEquipment.add',
			remove: 'command.changeActorEquipment.remove',
			'add-instance': 'command.changeActorEquipment.add-instance',
			'remove-instance': 'command.changeActorEquipment.remove-instance',
			'remove-slot': 'command.changeActorEquipment.remove-slot'
		}
	);
	fieldEls
		.get('changeActorEquipment-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'add',
				targets: [
					fieldEls.get('changeActorEquipment-slot'),
					fieldEls.get('changeActorEquipment-equipmentId')
				]
			},
			{
				case: 'remove',
				targets: [fieldEls.get('changeActorEquipment-equipmentId')]
			},
			{
				case: 'add-instance',
				targets: [
					fieldEls.get('changeActorEquipment-slot'),
					fieldEls.get('changeActorEquipment-equipment')
				]
			},
			{
				case: 'remove-instance',
				targets: [fieldEls.get('changeActorEquipment-equipment')]
			},
			{
				case: 'remove-slot',
				targets: [fieldEls.get('changeActorEquipment-slot')]
			}
		]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
