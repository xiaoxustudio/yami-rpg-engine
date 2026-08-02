<template>
<WindowFrame id="setInventory">
	<TitleBar>Set Inventory<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="setInventory-actor" type="actor" />
			<text>Operation</text><select-box id="setInventory-operation" />
			<text>Money</text
			><number-var id="setInventory-money" min="1" max="100000000" />
			<text>Item</text
			><file-var id="setInventory-itemId" type="file" filter="item" />
			<text>Quantity</text
			><number-var id="setInventory-quantity" min="1" max="10000" />
			<text>Equipment</text
			><file-var id="setInventory-equipmentId" type="file" filter="equipment" />
			<text>Equipment</text
			><custom-box id="setInventory-equipment" type="equipment" />
			<text>Order A</text
			><number-var id="setInventory-order1" min="0" max="10000" />
			<text>Order B</text
			><number-var id="setInventory-order2" min="0" max="10000" />
			<text>Global Actor</text
			><custom-box id="setInventory-refActor" type="actor" />
		</grid-box>
		<button id="setInventory-confirm" name="confirm">Confirm</button>
		<button id="setInventory-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
