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

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#comment {
	width: 720px;
	height: 238px;
}

#comment-comment {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 700px;
	height: 160px;
	background-color: var(--input-background);
}

#comment-confirm {
	right: 108px;
	bottom: 10px;
}

#comment-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
