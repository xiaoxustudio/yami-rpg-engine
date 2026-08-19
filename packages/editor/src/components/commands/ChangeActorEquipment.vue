<template>
<WindowFrame id="changeActorEquipment" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.changeActorEquipment.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorEquipment-actor" type="actor" /><div class="text">Operation</div><SelectBox id="changeActorEquipment-operation" /><div class="text">Shortcut Key</div><SelectVar id="changeActorEquipment-slot" /><div class="text">Equipment</div
			><CustomBox
				id="changeActorEquipment-equipmentId"
				type="file"
				filter="equipment"
			 /><div class="text">Equipment</div
			><CustomBox id="changeActorEquipment-equipment" type="equipment" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorEquipmentCommandSchema } from '@app/composables/commands/useChangeActorEquipmentCommandSchema';
import { $ } from '@app/utils/dom';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { save } = useChangeActorEquipmentCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.changeActorEquipment');
	$('#changeActorEquipment-operation')?.loadItems?.([
		{ name: get('add') || 'Add', value: 'add' },
		{ name: get('remove') || 'Remove', value: 'remove' },
		{ name: get('add-instance') || 'Add Instance', value: 'add-instance' },
		{ name: get('remove-instance') || 'Remove Instance', value: 'remove-instance' },
		{ name: get('remove-slot') || 'Remove Slot', value: 'remove-slot' }
	]);
	$('#changeActorEquipment-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'add',
				targets: [
					$('#changeActorEquipment-slot'),
					$('#changeActorEquipment-equipmentId')
				]
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
