<template>
	<WindowFrame
		id="event-search-string"
		:ref="registryRef(storesEls, 'event-search-string')"
		no-buttons
	>
		<template #title
			><TitleBar
				>{{ t('components.event-search-string.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.event-search-string-search.label') }}</div>
			<TextBox
				id="event-search-string-search"
				v-tip="t('components.event-search-string-search.tip')"
				:ref="registryRef(storesEls, 'event-search-string-search')"
			/>
			<div class="text">{{ t('components.event-search-string-case-insensitive.label') }}</div>
			<CheckBox
				id="event-search-string-case-insensitive"
				v-tip="t('components.event-search-string-case-insensitive.tip')"
				class="standard"
				v-model="caseInsensitive"
				:disabled="ciDisabled"
			/>
			<div class="text">{{ t('components.event-search-string-regex.label') }}</div>
			<CheckBox
				id="event-search-string-regex"
				v-tip="t('components.event-search-string-regex.tip')"
				class="standard"
				v-model="regex"
				:disabled="regexDisabled"
			/>
			<div class="text">{{ t('components.event-search-string-match-line.label') }}</div>
			<CheckBox
				id="event-search-string-match-line"
				v-tip="t('components.event-search-string-match-line.tip')"
				class="standard"
				v-model="matchLine"
			/>
			<div
				class="text"
				id="event-search-string-log"
				:ref="registryRef(storesEls, 'event-search-string-log')"
			></div>
		</div>
		<button
			id="event-search-string-previous"
			:ref="registryRef(storesEls, 'event-search-string-previous')"
			name="previous"
		>
			上一个
		</button>
		<button
			id="event-search-string-next"
			:ref="registryRef(storesEls, 'event-search-string-next')"
			name="next"
		>
			下一个
		</button>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { storesEls } from '@app/stores/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { SearchString, getSearchStringStore } from '@app/stores/search-string';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

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

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#event-search-string-previous {
	right: 108px;
	bottom: 10px;
}

#event-search-string-next {
	right: 10px;
	bottom: 10px;
}
</style>
