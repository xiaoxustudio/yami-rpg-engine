<template>
<WindowFrame id="setItem">
	<template #title><TitleBar>Set Item<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Item</div><CustomBox id="setItem-item" type="item" />
			<div class="text">Operation</div><SelectBox id="setItem-operation" />
			<div class="text">Quantity</div><NumberVar id="setItem-quantity" min="1" max="10000" />
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
