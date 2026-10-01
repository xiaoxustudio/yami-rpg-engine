<template>
	<WindowFrame id="setLoop" :ref="registryRef(fieldEls, 'setLoop')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setLoop.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setLoop-type.label') }}</div>
			<SelectBox
				:label="t('components.setLoop-type.label')"
				id="setLoop-type"
				v-tip="t('components.setLoop-type.tip')"
				:ref="registryRef(fieldEls, 'setLoop-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.setLoop-loop.label') }}</div>
			<SelectBox
				:label="t('components.setLoop-loop.label')"
				id="setLoop-loop"
				v-tip="t('components.setLoop-loop.tip')"
				:ref="registryRef(fieldEls, 'setLoop-loop')"
				v-model="form.loop"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
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
	useLocalizedOptions(
		'setLoop-loop',
		[false, true],
		(items) => fieldEls.get('setLoop-loop')?.loadItems?.(items),
		{ false: 'command.setLoop.once', true: 'command.setLoop.loop' }
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
