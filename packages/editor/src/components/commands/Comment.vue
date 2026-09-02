<template>
	<WindowFrame id="comment" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.comment.title') }}
				<div class="close" /></TitleBar
		></template>

		<TextArea id="comment-comment" v-focus v-model="comment" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCommentCommandSchema } from '@app/composables/commands/useCommentCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextArea from '@app/components/common/TextArea.vue';

const { t } = useI18n();

const { form, save } = useCommentCommandSchema();

const comment = computed({
	get: () => form.comment as string,
	set: (value) => {
		form.comment = value;
	}
});

const onConfirm = () => {
	save();
};
</script>
