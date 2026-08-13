<template>
	<WindowFrame id="itemGetter" @confirm="onConfirm">
		<template #title><TitleBar>Actor<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="itemGetter-type" /> <div class="text">Actor</div
				><CustomBox id="itemGetter-actor" type="actor" /> <div class="text">Shortcut Key</div
				><SelectVar id="itemGetter-key" /> <div class="text">Item</div
				><CustomBox id="itemGetter-itemId" type="file" filter="item" />
				<div class="text">Variable</div
				><CustomBox id="itemGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ItemGetter } from '@/command/item-accessor-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	ItemGetter?.confirm?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
