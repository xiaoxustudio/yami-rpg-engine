<template>
	<WindowFrame id="setLoop"
				:ref="registryRef(fieldEls, 'setLoop')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setLoop.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setLoop-type.label') }}</div>
			<SelectBox id="setLoop-type"
				v-tip="t('components.setLoop-type.tip')"
				:ref="registryRef(fieldEls, 'setLoop-type')" v-focus v-model="form.type" />
			<div class="text">{{ t('components.setLoop-loop.label') }}</div>
			<SelectBox id="setLoop-loop"
				v-tip="t('components.setLoop-loop.tip')"
				:ref="registryRef(fieldEls, 'setLoop-loop')" v-model="form.loop" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetLoopCommandSchema } from '@app/composables/commands/useSetLoopCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetLoopCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setLoop-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' }
	]);
	fieldEls.get('setLoop-loop')?.loadItems?.([
		{ name: t('command.setLoop.once') || 'Once', value: false },
		{ name: t('command.setLoop.loop') || 'Loop', value: true }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setLoop {
	width: 324px;
	height: 122px;
}

#setLoop-confirm {
	right: 108px;
	bottom: 10px;
}

#setLoop-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
