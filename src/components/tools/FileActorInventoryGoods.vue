<template>
	<WindowFrame id="fileActor-inventory-goods">
		<TitleBar>Inventory<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Type</text><SelectBox id="fileActor-inventory-type" />
				<text>Item</text
				><CustomBox id="fileActor-inventory-item-id" type="file" filter="item" />
				<text>Quantity</text
				><NumberBox id="fileActor-inventory-item-quantity" min="1" max="10000" />
				<text>Equipment</text
				><CustomBox
					id="fileActor-inventory-equipment-id"
					type="file"
					filter="equipment"
				/>
				<text>Money</text
				><NumberBox id="fileActor-inventory-money" min="1" max="100000000" />
			</div>
			<button id="fileActor-inventory-confirm" name="confirm">Confirm</button>
			<button id="fileActor-inventory-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
