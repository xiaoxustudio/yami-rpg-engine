<template>
	<WindowFrame id="if-branch" @confirm="onConfirm">
		<template #title><TitleBar>Branch<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Mode</div><SelectBox id="if-branch-mode" /> <div class="text">Conditions</div
				><ParamList id="if-branch-conditions" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { $ } from '@/util/dom.ts';
import { on } from '@/util/element-utils.ts';
import { IfBranch } from '@/command/conditional-branch-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	IfBranch?.confirm?.();
};

onMounted(() => {
	const modeEl = $('#if-branch-mode');
	if (!modeEl) return;
	modeEl.loadItems([
		{ name: 'Meet All', value: 'all' },
		{ name: 'Meet Any', value: 'any' }
	]);
	on($('#if-branch'), 'closed', () => IfBranch.windowClosed?.(new Event('closed')));
	on($('#if-branch-confirm'), 'click', () => IfBranch.confirm?.(new Event('click')));
});
</script>
