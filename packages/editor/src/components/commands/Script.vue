<template>
	<WindowFrame id="script" :ref="registryRef(composableEls, 'script')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.script.title') }}
				<div
					class="text hidden"
					id="script-mark"
					:ref="registryRef(composableEls, 'script-mark')"
				>
					✱
				</div>
				<button
					id="script-change"
					:ref="registryRef(composableEls, 'script-change')"
					name="script-change-ts"
				>
					切换为TS
				</button>
				<div class="maximize" id="script-maximize" />
				<div class="close" /> </TitleBar
		></template>

		<div
			class="box"
			id="script-script"
			:ref="registryRef(composableEls, 'script-script')"
		></div>
		<!-- 代码着色用的「文本模板节点」（不再用 document.createElement('div') + render()）→ 模板提供、模块 cloneNode -->
		<div class="hidden">
			<div
				class="text"
				id="script-text-template"
				:ref="registryRef(composableEls, 'script-text-template')"
			></div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useScriptCommandSchema } from '@app/composables/commands/useScriptCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';

const { t } = useI18n();
const { save, initialize } = useScriptCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	initialize();
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
	/* 用于填补150%缩放时边框处的缝隙 */
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
