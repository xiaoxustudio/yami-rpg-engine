<template>
	<WindowFrame id="setElement" :ref="registryRef(fieldEls, 'setElement')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setElement-element.label') }}</div>
			<CustomBox
				id="setElement-element"
				:ref="registryRef(fieldEls, 'setElement-element')"
				v-tip="t('components.setElement-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setElement-operation.label') }}</div>
			<SelectBox
				id="setElement-operation"
				v-tip="t('components.setElement-operation.tip')"
				:ref="registryRef(fieldEls, 'setElement-operation')"
				v-model="form.operation"
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
import { useSetElementCommandSchema } from '@app/composables/commands/useSetElementCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetElementCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setElement-operation',
		[
			'hide',
			'show',
			'disable-pointer-events',
			'enable-pointer-events',
			'skip-pointer-events',
			'move-to-first',
			'move-to-last'
		],
		(items) => fieldEls.get('setElement-operation')?.loadItems?.(items),
		{
			hide: 'command.setElement.hide',
			show: 'command.setElement.show',
			'disable-pointer-events': 'command.setElement.disable-pointer-events',
			'enable-pointer-events': 'command.setElement.enable-pointer-events',
			'skip-pointer-events': 'command.setElement.skip-pointer-events',
			'move-to-first': 'command.setElement.move-to-first',
			'move-to-last': 'command.setElement.move-to-last'
		}
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setElement {
	width: 324px;
	height: 122px;
}

#setElement-confirm {
	right: 108px;
	bottom: 10px;
}

#setElement-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
