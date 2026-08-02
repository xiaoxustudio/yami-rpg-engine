<template>
	<WindowFrame id="event-search-string">
		<TitleBar>Search String<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text></text><TextBox id="event-search-string-search" /> <text></text
				><CheckBox id="event-search-string-case-insensitive" class="standard" />
				<text></text><CheckBox id="event-search-string-regex" class="standard" />
				<text></text
				><CheckBox id="event-search-string-match-line" class="standard" />
				<text id="event-search-string-log"></text>
			</grid-box>
			<button id="event-search-string-previous" name="previous">上一个</button>
			<button id="event-search-string-next" name="next">下一个</button>
		</content-frame>
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
	inspector.syncState();
	local.syncState();
});
</script>
