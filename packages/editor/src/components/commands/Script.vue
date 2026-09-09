<template>
	<WindowFrame id="script" @confirm="onConfirm">
		<template #title
			><TitleBar
				>Script
				<div class="text hidden" id="script-mark">✱</div>
				<button id="script-change" name="script-change-ts">切换为TS</button>
				<div class="maximize" id="script-maximize" />
				<div class="close" /> </TitleBar
		></template>

		<div class="box" id="script-script"></div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useScriptCommandSchema } from '@app/composables/commands/useScriptCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';

const { save, initialize } = useScriptCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	initialize();
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#script {
	width: 720px;
	height: calc(238px * 1.5);
	/* 输入提示框可溢出 */
	overflow: visible;
}

#script-script {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 700px;
	height: calc(238px * 1.15);
	/* 用于填补150%缩放时边框处的缝�?*/
	background-color: var(--input-background);
	border: var(--fieldset-border);
	border-radius: 2px;
}

#script-change {
	margin-left: 20px;
	margin-top: 5px;
}

#script-confirm {
	right: 108px;
	bottom: 10px;
}

#script-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
