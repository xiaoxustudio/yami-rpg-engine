<template>
	<WindowFrame id="changeActorEquipment" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorEquipment.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorEquipment-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Operation</div>
			<SelectBox id="changeActorEquipment-operation" v-model="form.operation" />
			<div class="text">Shortcut Key</div>
			<SelectVar id="changeActorEquipment-slot" v-focus v-model="form.slot" />
			<div class="text">Equipment</div>
			<CustomBox
				id="changeActorEquipment-equipmentId"
				v-focus
				type="file"
				filter="equipment"
				v-model="form.equipmentId"
			/>
			<div class="text">Equipment</div>
			<CustomBox
				id="changeActorEquipment-equipment"
				type="equipment"
				v-model="form.equipment"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorEquipmentCommandSchema } from '@app/composables/commands/useChangeActorEquipmentCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#changeActorEquipment-operation')?.loadItems?.([
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
	$('#changeActorEquipment-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'add',
				targets: [$('#changeActorEquipment-slot'), $('#changeActorEquipment-equipmentId')]
			},
			{
				case: 'remove',
				targets: [$('#changeActorEquipment-equipmentId')]
			},
			{
				case: 'add-instance',
				targets: [$('#changeActorEquipment-slot'), $('#changeActorEquipment-equipment')]
			},
			{
				case: 'remove-instance',
				targets: [$('#changeActorEquipment-equipment')]
			},
			{
				case: 'remove-slot',
				targets: [$('#changeActorEquipment-slot')]
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
