<template>
	<WindowFrame id="useItem" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.useItem.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.useItem-actor.label') }}</div>
			<CustomBox id="useItem-actor"
				v-tip="t('components.useItem-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.useItem-mode.label') }}</div>
			<SelectBox id="useItem-mode"
				v-tip="t('components.useItem-mode.tip')"
				:ref="registryRef(fieldEls, 'useItem-mode')" v-model="form.mode" />
			<div class="text">{{ t('components.useItem-key.label') }}</div>
			<SelectBox id="useItem-key"
				v-tip="t('components.useItem-key.tip')"
				:ref="registryRef(fieldEls, 'useItem-key')" v-focus v-model="form.key" />
			<div class="text">{{ t('components.useItem-itemId.label') }}</div>
			<CustomBox
				id="useItem-itemId"
				v-tip="t('components.useItem-itemId.tip')"
				:ref="registryRef(fieldEls, 'useItem-itemId')"
				v-focus
				type="file"
				filter="item"
				v-model="form.itemId"
			/>
			<div class="text">{{ t('components.useItem-item.label') }}</div>
			<CustomBox id="useItem-item"
				v-tip="t('components.useItem-item.tip')"
				:ref="registryRef(fieldEls, 'useItem-item')" type="item" v-model="form.item" />
			<div class="text">{{ t('components.useItem-wait.label') }}</div>
			<SelectBox id="useItem-wait"
				:ref="registryRef(fieldEls, 'useItem-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUseItemCommandSchema } from '@app/composables/commands/useUseItemCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useUseItemCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('useItem-mode')?.loadItems?.([
		{ name: 'By Shortcut Key', value: 'by-key' },
		{ name: 'By Item ID', value: 'by-id' },
		{ name: 'By Item Instance', value: 'by-item' }
	]);
	fieldEls.get('useItem-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'by-key', targets: [fieldEls.get('useItem-key')] },
			{ case: 'by-id', targets: [fieldEls.get('useItem-itemId')] },
			{ case: 'by-item', targets: [fieldEls.get('useItem-item')] }
		]);
	fieldEls.get('useItem-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#useItem {
	width: 324px;
	height: 170px;
}

#useItem-confirm {
	right: 108px;
	bottom: 10px;
}

#useItem-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
