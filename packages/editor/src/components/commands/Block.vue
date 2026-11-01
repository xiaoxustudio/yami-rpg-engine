<template>
	<WindowFrame id="block" @confirm="onConfirm" @closed="reset">
		<template #title
			><TitleBar
				>{{ t('components.block.title') }}
				<div class="close" /></TitleBar
		></template>

		<TextBox
			id="block-note"
			:placeholder="t('components.block-note.placeholder')"
			v-tip="t('components.block-note.tip')"
			v-focus
			v-model="note"
		/>
		<CheckBox id="block-asynchronous" class="standard" v-model="asynchronous"
			><div
				class="text"
				id="block-asynchronous-label"
				v-tip="t('components.block-asynchronous-label.tip')"
			>
				{{ t('components.block-asynchronous-label.content') }}
			</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

const onConfirm = () => {
	save();
};

defineExpose({ form });
</script>
