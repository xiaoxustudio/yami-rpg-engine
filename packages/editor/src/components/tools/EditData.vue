<template>
	<WindowFrame id="edit-data" :ref="registryRef(moduleEls, 'edit-data')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.edit-data.title') }}
				<div
					class="text hidden"
					id="edit-data-mark"
					:ref="registryRef(moduleEls, 'edit-data-mark')"
				>
					✱
				</div>
				<div class="maximize" id="edit-data-maximize" />
				<div class="close" /> </TitleBar
		></template>

		<div
			class="box"
			id="edit-data-current"
			:ref="registryRef(moduleEls, 'edit-data-current')"
		></div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { EditDataInstance } from '@app/module/editdata.ts';
import { onMounted } from 'vue';
import { moduleEls } from '@app/module/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';

const onConfirm = () => {
	EditDataInstance?.save?.();
};

const { t } = useI18n();

onMounted(() => {});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#edit-data {
	width: 720px;
	height: calc(238px * 1.5);
	/* 输入提示框可溢出 */
	overflow: visible;
}

#edit-data-current {
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

#edit-data-confirm {
	right: 108px;
	bottom: 10px;
}

#edit-data-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
