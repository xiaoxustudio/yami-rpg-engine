<template>
<WindowFrame id="showText">
	<TitleBar>Show Text<div class="close" /></TitleBar>
	<div class="content-frame">
		<CustomBox id="showText-target" type="actor" />
		<TextBox id="showText-parameters" />
		<TextArea
			id="showText-content"
			menu="tag-local-var tag-global-var tag-localization"
		 />
		<button id="showText-confirm" name="confirm">Confirm</button>
		<button id="showText-cancel" name="cancel">Cancel</button>
	</div>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
