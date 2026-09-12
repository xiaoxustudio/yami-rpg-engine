<template>
	<WindowFrame id="renderOutline" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.renderOutline.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.renderOutline-operation.label') }}</div>
			<SelectBox id="renderOutline-operation"
				v-tip="t('components.renderOutline-operation.tip')"
				:ref="registryRef(fieldEls, 'renderOutline-operation')" v-focus v-model="form.operation" />
			<div class="text">{{ t('components.renderOutline-actor.label') }}</div>
			<CustomBox id="renderOutline-actor"
				v-tip="t('components.renderOutline-actor.tip')"
				:ref="registryRef(fieldEls, 'renderOutline-actor')" type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.renderOutline-color.label') }}</div>
			<ColorBox id="renderOutline-color"
				v-tip="t('components.renderOutline-color.tip')"
				:ref="registryRef(fieldEls, 'renderOutline-color')" v-model="color" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
	fieldEls.get('renderOutline-operation')?.loadItems?.([
		{ name: t('command.renderOutline.add') || 'Add', value: 'add' },
		{ name: t('command.renderOutline.remove') || 'Remove', value: 'remove' },
		{ name: t('command.renderOutline.reset') || 'Reset', value: 'reset' }
	]);
	fieldEls.get('renderOutline-operation')
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
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
