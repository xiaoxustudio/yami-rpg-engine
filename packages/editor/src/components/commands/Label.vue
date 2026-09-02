<template>
	<WindowFrame id="label" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.label.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Label Name</div>
			<TextBox id="label-name" v-focus v-model="name" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLabelCommandSchema } from '@app/composables/commands/useLabelCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const { form, save } = useLabelCommandSchema();

const name = computed({
	get: () => form.name as string,
	set: (value) => {
		form.name = value;
	}
});

const onConfirm = () => {
	save();
};
</script>
