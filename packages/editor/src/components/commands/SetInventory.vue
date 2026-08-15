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

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.setInventory?.save?.();
};

</script>
