<template>
<WindowFrame id="setInventory" @confirm="onConfirm">
	<template #title><TitleBar>Set Inventory<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setInventory-actor" type="actor" @input="onActor" />
			<div class="text">Operation</div><SelectBox id="setInventory-operation" v-model="form.operation" />
			<div class="text">Money</div
			><NumberVar id="setInventory-money" min="1" max="100000000" v-model="form.money" />
			<div class="text">Item</div
			><FileVar id="setInventory-itemId" type="file" filter="item" v-model="form.itemId" />
			<div class="text">Quantity</div
			><NumberVar id="setInventory-quantity" min="1" max="10000" v-model="form.quantity" />
			<div class="text">Equipment</div
			><FileVar id="setInventory-equipmentId" type="file" filter="equipment" v-model="form.equipmentId" />
			<div class="text">Equipment</div
			><CustomBox id="setInventory-equipment" type="equipment" @input="onEquipment" />
			<div class="text">Order A</div
			><NumberVar id="setInventory-order1" min="0" max="10000" v-model="form.order1" />
			<div class="text">Order B</div
			><NumberVar id="setInventory-order2" min="0" max="10000" v-model="form.order2" />
			<div class="text">Global Actor</div
			><CustomBox id="setInventory-refActor" type="actor" @input="onRefActor" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetInventoryCommandSchema } from '@app/composables/commands/useSetInventoryCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetInventoryCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onEquipment = (value: unknown) => {
	form.equipment = value;
};

const onRefActor = (value: unknown) => {
	form.refActor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setInventory-operation')?.loadItems?.([
		{ name: 'Increase Money', value: 'increase-money' },
		{ name: 'Decrease Money', value: 'decrease-money' },
		{ name: 'Increase Items', value: 'increase-items' },
		{ name: 'Decrease Items', value: 'decrease-items' },
		{ name: 'Gain Equipment', value: 'gain-equipment' },
		{ name: 'Lose Equipment', value: 'lose-equipment' },
		{ name: 'Gain Equipment', value: 'gain-equipment-instance' },
		{ name: 'Lose Equipment', value: 'lose-equipment-instance' },
		{ name: 'Swap Order of Items', value: 'swap' },
		{ name: 'Sort Simply', value: 'sort' },
		{ name: 'Sort by Filename', value: 'sort-by-order' },
		{ name: "Use Global Actor's Inventory", value: 'reference' },
		{ name: 'Restore Inventory', value: 'dereference' },
		{ name: 'Reset', value: 'reset' }
	]);
	$('#setInventory-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['increase-money', 'decrease-money'],
				targets: [$('#setInventory-money')]
			},
			{
				case: ['increase-items', 'decrease-items'],
				targets: [$('#setInventory-itemId'), $('#setInventory-quantity')]
			},
			{
				case: ['gain-equipment', 'lose-equipment'],
				targets: [$('#setInventory-equipmentId')]
			},
			{
				case: ['gain-equipment-instance', 'lose-equipment-instance'],
				targets: [$('#setInventory-equipment')]
			},
			{
				case: 'swap',
				targets: [$('#setInventory-order1'), $('#setInventory-order2')]
			},
			{ case: 'reference', targets: [$('#setInventory-refActor')] }
		]);
});

</script>
