<template>
	<WindowFrame id="event-search-string" no-buttons>
		<template #title
			><TitleBar
				>{{ t('components.event-search-string.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text"></div>
			<TextBox id="event-search-string-search" />
			<div class="text"></div>
			<CheckBox
				id="event-search-string-case-insensitive"
				class="standard"
				v-model="caseInsensitive"
				:disabled="ciDisabled"
			/>
			<div class="text"></div>
			<CheckBox
				id="event-search-string-regex"
				class="standard"
				v-model="regex"
				:disabled="regexDisabled"
			/>
			<div class="text"></div>
			<CheckBox id="event-search-string-match-line" class="standard" v-model="matchLine" />
			<div class="text" id="event-search-string-log"></div>
		</div>
		<button id="event-search-string-previous" name="previous">上一个</button>
		<button id="event-search-string-next" name="next">下一个</button>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { SearchString, getSearchStringStore } from '@app/stores/search-string';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

const searchStore = getSearchStringStore();

const caseInsensitive = computed({
	get: () => searchStore.searchMode.caseInsensitive,
	set: (value) => searchStore.setMode('caseInsensitive', value)
});
const regex = computed({
	get: () => searchStore.searchMode.regex,
	set: (value) => searchStore.setMode('regex', value)
});
const matchLine = computed({
	get: () => searchStore.searchMode.matchLine,
	set: (value) => searchStore.setMode('matchLine', value)
});
const ciDisabled = computed(() => searchStore.searchMode.regex);
const regexDisabled = computed(() => searchStore.searchMode.caseInsensitive);

watch(
	() => searchStore.searchMode,
	() => SearchString.refresh(),
	{ deep: true }
);

onMounted(() => {});
</script>
