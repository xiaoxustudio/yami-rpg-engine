<template>
	<window-frame id="event-search-string">
		<title-bar>Search String<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text></text><text-box id="event-search-string-search" /> <text></text
				><check-box id="event-search-string-case-insensitive" class="standard" />
				<text></text><check-box id="event-search-string-regex" class="standard" />
				<text></text
				><check-box id="event-search-string-match-line" class="standard" />
				<text id="event-search-string-log"></text>
			</grid-box>
			<button id="event-search-string-previous" name="previous">上一个</button>
			<button id="event-search-string-next" name="next">下一个</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
