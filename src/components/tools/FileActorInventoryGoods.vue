<template>
	<window-frame id="fileActor-inventory-goods">
		<title-bar>Inventory<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="fileActor-inventory-type" />
				<text>Item</text
				><custom-box id="fileActor-inventory-item-id" type="file" filter="item" />
				<text>Quantity</text
				><number-box id="fileActor-inventory-item-quantity" min="1" max="10000" />
				<text>Equipment</text
				><custom-box
					id="fileActor-inventory-equipment-id"
					type="file"
					filter="equipment"
				/>
				<text>Money</text
				><number-box id="fileActor-inventory-money" min="1" max="100000000" />
			</grid-box>
			<button id="fileActor-inventory-confirm" name="confirm">Confirm</button>
			<button id="fileActor-inventory-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
