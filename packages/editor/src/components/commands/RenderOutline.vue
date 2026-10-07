<template>
	<WindowFrame
		id="renderOutline"
		:ref="registryRef(fieldEls, 'renderOutline')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.renderOutline.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.renderOutline-operation.label') }}</div>
			<SelectBox
				:label="t('components.renderOutline-operation.label')"
				id="renderOutline-operation"
				v-tip="t('components.renderOutline-operation.tip')"
				:ref="registryRef(fieldEls, 'renderOutline-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.renderOutline-actor.label') }}</div>
			<CustomBox
				id="renderOutline-actor"
				v-tip="t('components.renderOutline-actor.tip')"
				:ref="registryRef(fieldEls, 'renderOutline-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.renderOutline-color.label') }}</div>
			<ColorBox
				:label="t('components.renderOutline-color.label')"
				id="renderOutline-color"
				v-tip="t('components.renderOutline-color.tip')"
				:ref="registryRef(fieldEls, 'renderOutline-color')"
				v-model="color"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRenderOutlineCommandSchema } from '@app/composables/commands/useRenderOutlineCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useRenderOutlineCommandSchema();

const color = computed({
	get: () => form.color as string,
	set: (value) => {
		form.color = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'renderOutline-operation',
		['add', 'remove', 'reset'],
		(items) => fieldEls.get('renderOutline-operation')?.loadItems?.(items),
		{
			add: 'command.renderOutline.add',
			remove: 'command.renderOutline.remove',
			reset: 'command.renderOutline.reset'
		}
	);
	fieldEls
		.get('renderOutline-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'add',
				targets: [fieldEls.get('renderOutline-actor'), fieldEls.get('renderOutline-color')]
			},
			{ case: 'remove', targets: [fieldEls.get('renderOutline-actor')] }
		]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#renderOutline {
	width: 324px;
	height: 146px;
}

#renderOutline-confirm {
	right: 108px;
	bottom: 10px;
}

#renderOutline-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
