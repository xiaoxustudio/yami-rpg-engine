<template>
	<WindowFrame id="fileEvent-parameter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fileEvent-parameter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fileEvent-parameter-type.label') }}</div>
			<SelectBox id="fileEvent-parameter-type" v-focus v-model="form.type" />
			<div class="text">{{ t('components.fileEvent-parameter-key.label') }}</div>
			<TextBox id="fileEvent-parameter-key" v-focus v-model="form.key" />
			<div class="text">{{ t('components.fileEvent-parameter-note.label') }}</div>
			<TextArea id="fileEvent-parameter-note" v-model="form.note" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { fileEventParameterForm } from '@app/inspector/file-event-page.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = fileEventParameterForm;

const onConfirm = () => {
	Inspector?.fileEvent?.parameters?.save?.();
};

onMounted(() => {});
</script>
