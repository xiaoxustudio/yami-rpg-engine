<template>
	<WindowFrame id="block" :ref="registryRef(fieldEls, 'block')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.block.title') }}
				<div class="close" /></TitleBar
		></template>

		<TextBox
			id="block-note"
			:placeholder="t('components.block-note.placeholder')"
			:ref="registryRef(fieldEls, 'block-note')"
			v-tip="t('components.block-note.tip')"
			v-focus
			v-model="note"
		/>
		<CheckBox
			id="block-asynchronous"
			:ref="registryRef(fieldEls, 'block-asynchronous')"
			class="standard"
			v-model="asynchronous"
			><div
				class="text"
				id="block-asynchronous-label"
				:ref="registryRef(fieldEls, 'block-asynchronous-label')"
				v-tip="t('components.block-asynchronous-label.tip')"
			>
				{{ t('components.block-asynchronous-label.content') }}
			</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBlockCommandSchema } from '@app/composables/commands/useBlockCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const { form, save, reset } = useBlockCommandSchema();

const note = computed({
	get: () => form.note as string,
	set: (value) => {
		form.note = value;
	}
});

const asynchronous = computed({
	get: () => form.asynchronous as boolean,
	set: (value) => {
		form.asynchronous = value;
	}
});

defineExpose({ form });

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('block')?.on?.('closed', () => {
		reset();
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#block {
	width: 520px;
	height: 98px;
}

#block-note {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 500px;
}

#block-asynchronous {
	position: absolute;
	left: 10px;
	bottom: 10px;
}

#block-confirm {
	right: 108px;
	bottom: 10px;
}

#block-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
