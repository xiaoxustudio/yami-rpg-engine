<template>
	<!-- 匹配 - 分支 -->
	<WindowFrame id="switch-branch" @confirm="onConfirm">
		<template #title><TitleBar>Branch<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Cases</div><ParamList id="switch-branch-conditions" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { $ } from '@/util/dom.ts';
import { on } from '@/util/element-utils.ts';
import { SwitchBranch } from '@/command/match-branch-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	SwitchBranch?.confirm?.();
};

onMounted(() => {
	on($('#switch-branch'), 'closed', () => SwitchBranch.windowClosed?.(new Event('closed')));
	on($('#switch-branch-confirm'), 'click', () => SwitchBranch.confirm?.(new Event('click')));
});
</script>
