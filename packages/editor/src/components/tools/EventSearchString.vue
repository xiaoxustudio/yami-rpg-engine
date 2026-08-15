<template>
	<WindowFrame id="event-search-string" no-buttons>
		<template #title><TitleBar>Search String<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text"></div><TextBox id="event-search-string-search" /> <div class="text"></div
				><CheckBox id="event-search-string-case-insensitive" class="standard" />
				<div class="text"></div><CheckBox id="event-search-string-regex" class="standard" />
				<div class="text"></div
				><CheckBox id="event-search-string-match-line" class="standard" />
				<div class="text" id="event-search-string-log"></div>
			</div>
			<button id="event-search-string-previous" name="previous">上一个</button>
			<button id="event-search-string-next" name="next">下一个</button>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
