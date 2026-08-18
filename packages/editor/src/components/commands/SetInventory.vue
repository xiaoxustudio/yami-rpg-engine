<template>
<WindowFrame id="setInventory" @confirm="onConfirm">
	<template #title><TitleBar>Set Inventory<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setInventory-actor" type="actor" />
			<div class="text">Operation</div><SelectBox id="setInventory-operation" />
			<div class="text">Money</div
			><NumberVar id="setInventory-money" min="1" max="100000000" />
			<div class="text">Item</div
			><FileVar id="setInventory-itemId" type="file" filter="item" />
			<div class="text">Quantity</div
			><NumberVar id="setInventory-quantity" min="1" max="10000" />
			<div class="text">Equipment</div
			><FileVar id="setInventory-equipmentId" type="file" filter="equipment" />
			<div class="text">Equipment</div
			><CustomBox id="setInventory-equipment" type="equipment" />
			<div class="text">Order A</div
			><NumberVar id="setInventory-order1" min="0" max="10000" />
			<div class="text">Order B</div
			><NumberVar id="setInventory-order2" min="0" max="10000" />
			<div class="text">Global Actor</div
			><CustomBox id="setInventory-refActor" type="actor" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetInventoryCommandSchema } from '@app/composables/commands/useSetInventoryCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { save } = useSetInventoryCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.setInventory');
	$('#setInventory-operation')?.loadItems?.([
		{ name: get('increase-money') || 'Increase Money', value: 'increase-money' },
		{ name: get('decrease-money') || 'Decrease Money', value: 'decrease-money' },
		{ name: get('increase-items') || 'Increase Items', value: 'increase-items' },
		{ name: get('decrease-items') || 'Decrease Items', value: 'decrease-items' },
		{ name: get('gain-equipment') || 'Gain Equipment', value: 'gain-equipment' },
		{ name: get('lose-equipment') || 'Lose Equipment', value: 'lose-equipment' },
		{ name: get('gain-equipment-instance') || 'Gain Equipment', value: 'gain-equipment-instance' },
		{ name: get('lose-equipment-instance') || 'Lose Equipment', value: 'lose-equipment-instance' },
		{ name: get('swap') || 'Swap Order of Items', value: 'swap' },
		{ name: get('sort') || 'Sort Simply', value: 'sort' },
		{ name: get('sort-by-order') || 'Sort by Filename', value: 'sort-by-order' },
		{ name: get('reference') || "Use Global Actor's Inventory", value: 'reference' },
		{ name: get('dereference') || 'Restore Inventory', value: 'dereference' },
		{ name: get('reset') || 'Reset', value: 'reset' }
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
