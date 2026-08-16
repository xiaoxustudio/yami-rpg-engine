<template>
<WindowFrame id="changeActorEquipment" @confirm="onConfirm">
	<template #title><TitleBar>Change Actor Equipment<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorEquipment-actor" type="actor" @input="onActor" /><div class="text">Operation</div><SelectBox id="changeActorEquipment-operation" v-model="form.operation" /><div class="text">Shortcut Key</div><SelectVar id="changeActorEquipment-slot" v-model="form.slot" /><div class="text">Equipment</div
			><CustomBox
				id="changeActorEquipment-equipmentId"
				type="file"
				filter="equipment"
				@input="onEquipmentId"
			 /><div class="text">Equipment</div
			><CustomBox id="changeActorEquipment-equipment" type="equipment" @input="onEquipment" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useChangeActorEquipmentCommandSchema } from '@app/composables/commands/useChangeActorEquipmentCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useChangeActorEquipmentCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onEquipmentId = (value: unknown) => {
	form.equipmentId = value;
};

const onEquipment = (value: unknown) => {
	form.equipment = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#changeActorEquipment-operation')?.loadItems?.([
		{ name: 'Add', value: 'add' },
		{ name: 'Remove', value: 'remove' },
		{ name: 'Add Instance', value: 'add-instance' },
		{ name: 'Remove Instance', value: 'remove-instance' },
		{ name: 'Remove Slot', value: 'remove-slot' }
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
