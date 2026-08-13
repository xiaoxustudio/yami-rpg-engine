<template>
	<!-- 设置数量窗口 -->
	<WindowFrame id="setQuantity" @confirm="onConfirm">
		<template #title><TitleBar>Set Quantity<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Quantity</div><NumberBox id="setQuantity-quantity" min="1" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { SetQuantity } from '@/tools/set-number-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	SetQuantity?.confirm?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
