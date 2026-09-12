<template>
	<WindowFrame id="changeActorEquipment" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorEquipment.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorEquipment-actor.label') }}</div>
			<CustomBox id="changeActorEquipment-actor"
				v-tip="t('components.changeActorEquipment-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.changeActorEquipment-operation.label') }}</div>
			<SelectBox id="changeActorEquipment-operation"
				v-tip="t('components.changeActorEquipment-operation.tip')"
				:ref="registryRef(fieldEls, 'changeActorEquipment-operation')" v-model="form.operation" />
			<div class="text">{{ t('components.changeActorEquipment-slot.label') }}</div>
			<SelectVar id="changeActorEquipment-slot"
				v-tip="t('components.changeActorEquipment-slot.tip')"
				:ref="registryRef(fieldEls, 'changeActorEquipment-slot')" v-focus v-model="form.slot" />
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
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
	fieldEls.get('changeActorEquipment-operation')?.loadItems?.([
		{ name: t('command.changeActorEquipment.add') || 'Add', value: 'add' },
		{ name: t('command.changeActorEquipment.remove') || 'Remove', value: 'remove' },
		{
			name: t('command.changeActorEquipment.add-instance') || 'Add Instance',
			value: 'add-instance'
		},
		{
			name: t('command.changeActorEquipment.remove-instance') || 'Remove Instance',
			value: 'remove-instance'
		},
		{ name: t('command.changeActorEquipment.remove-slot') || 'Remove Slot', value: 'remove-slot' }
	]);
	fieldEls.get('changeActorEquipment-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'add',
				targets: [fieldEls.get('changeActorEquipment-slot'), fieldEls.get('changeActorEquipment-equipmentId')]
			},
			{
				case: 'remove',
				targets: [fieldEls.get('changeActorEquipment-equipmentId')]
			},
			{
				case: 'add-instance',
				targets: [fieldEls.get('changeActorEquipment-slot'), fieldEls.get('changeActorEquipment-equipment')]
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
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
