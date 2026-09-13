<template>
	<WindowFrame id="script"
				:ref="registryRef(composableEls, 'script')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>Script
				<div class="text hidden" id="script-mark"
				:ref="registryRef(composableEls, 'script-mark')">✱</div>
				<button id="script-change"
				:ref="registryRef(composableEls, 'script-change')" name="script-change-ts">切换为TS</button>
				<div class="maximize" id="script-maximize" />
				<div class="close" /> </TitleBar
		></template>

		<div class="box" id="script-script"
				:ref="registryRef(composableEls, 'script-script')"></div>
		<!-- P1b：代码着色用的「文本模板节点」（原先是 document.createElement('div') + render()）→ 模板提供、模块 cloneNode -->
		<div class="hidden">
			<div class="text" id="script-text-template"
				:ref="registryRef(composableEls, 'script-text-template')"></div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
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
