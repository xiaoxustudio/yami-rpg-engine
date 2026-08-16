<template>
<WindowFrame id="comment" @confirm="onConfirm">
	<template #title><TitleBar>Comment<div class="close" /></TitleBar></template>
	
		<TextArea id="comment-comment" v-model="form.comment" />
	
</WindowFrame>
</template>

<script setup lang="ts">

import { useCommentCommandSchema } from '@app/composables/commands/useCommentCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextArea from '@app/components/common/TextArea.vue';

const { form, save } = useCommentCommandSchema();

const onConfirm = () => {
	save();
};

</script>
