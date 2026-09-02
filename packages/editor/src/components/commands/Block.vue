<template>
	<WindowFrame id="block" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.block.title') }}
				<div class="close" /></TitleBar
		></template>

		<TextBox id="block-note" v-focus v-model="note" />
		<CheckBox id="block-asynchronous" class="standard" v-model="asynchronous"
			><div class="text" id="block-asynchronous-label">Asynchronous</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBlockCommandSchema } from '@app/composables/commands/useBlockCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#block')?.on?.('closed', () => {
		reset();
	});
});
</script>
