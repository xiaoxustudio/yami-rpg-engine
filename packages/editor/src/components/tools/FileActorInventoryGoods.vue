<template>
	<WindowFrame id="fileActor-inventory-goods" buttons-id-prefix="fileActor-inventory">
		<template #title><TitleBar>Inventory<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="fileActor-inventory-type" />
				<div class="text">Item</div
				><CustomBox id="fileActor-inventory-item-id" type="file" filter="item" />
				<div class="text">Quantity</div
				><NumberBox id="fileActor-inventory-item-quantity" min="1" max="10000" />
				<div class="text">Equipment</div
				><CustomBox
					id="fileActor-inventory-equipment-id"
					type="file"
					filter="equipment"
				/>
				<div class="text">Money</div
				><NumberBox id="fileActor-inventory-money" min="1" max="100000000" />
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
