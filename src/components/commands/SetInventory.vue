<template>
<WindowFrame id="setInventory">
	<TitleBar>Set Inventory<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="setInventory-actor" type="actor" />
			<text>Operation</text><SelectBox id="setInventory-operation" />
			<text>Money</text
			><NumberVar id="setInventory-money" min="1" max="100000000" />
			<text>Item</text
			><FileVar id="setInventory-itemId" type="file" filter="item" />
			<text>Quantity</text
			><NumberVar id="setInventory-quantity" min="1" max="10000" />
			<text>Equipment</text
			><FileVar id="setInventory-equipmentId" type="file" filter="equipment" />
			<text>Equipment</text
			><CustomBox id="setInventory-equipment" type="equipment" />
			<text>Order A</text
			><NumberVar id="setInventory-order1" min="0" max="10000" />
			<text>Order B</text
			><NumberVar id="setInventory-order2" min="0" max="10000" />
			<text>Global Actor</text
			><CustomBox id="setInventory-refActor" type="actor" />
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
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
