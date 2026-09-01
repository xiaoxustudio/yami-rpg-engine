<template>
	<WindowFrame id="showText" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.showText.title') }}
				<div class="close" /></TitleBar
		></template>

		<CustomBox id="showText-target" v-focus type="actor" v-model="form.target" />
		<TextBox id="showText-parameters" v-model="form.parameters" />
		<TextArea
			id="showText-content"
			v-focus
			menu="tag-local-var tag-global-var tag-localization"
			v-model="form.content"
		/>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useShowTextCommandSchema } from '@app/composables/commands/useShowTextCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const { form, save } = useShowTextCommandSchema();

const onConfirm = () => {
	save();
};
</script>
