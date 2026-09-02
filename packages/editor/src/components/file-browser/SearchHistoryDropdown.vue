<template>
	<Teleport to="body">
		<div
			v-show="visible"
			class="browser-search-history-dropdown"
			:style="dropdownStyle"
			@mousedown.prevent
		>
			<div
				v-for="keyword in keywords"
				:key="keyword"
				class="browser-search-item"
				:style="itemStyle(keyword)"
				@click="onItemClick(keyword)"
				@mouseenter="hover = keyword"
				@mouseleave="hover = ''"
			>
				<span>{{ keyword }}</span>
				<div
					class="box close-button browser-search-delete-button"
					style="top: 50%; transform: translateY(-50%)"
					@click="onDeleteClick(keyword, $event)"
				>
					&#x2716;
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { computed, onBeforeUnmount, onMounted, reactive, ref, type CSSProperties } from 'vue';
import {
	registerSearchHistoryDropdown,
	BrowserSearchHistory
} from '@app/module/browser-search-history.ts';

const visible = ref(false);
const keywords = ref<string[]>([]);
const hover = ref('');
const dark = ref(document.documentElement.classList.contains('dark'));
const position = reactive({
	left: '0px',
	top: '0px',
	width: '0px'
});

let input: HTMLInputElement | null = null;
let themeObserver: MutationObserver | null = null;
let outsideHandler: ((event: Event) => void) | null = null;

const dropdownStyle = computed<CSSProperties>(() => ({
	position: 'absolute',
	zIndex: 9999,
	padding: '2px 0',
	maxHeight: '300px',
	overflow: 'auto',
	overflowX: 'hidden',
	fontSize: '12px',
	scrollbarWidth: 'none',
	msOverflowStyle: 'none',
	background: dark.value ? '#383838' : '#f0f0f0',
	border: dark.value ? '1px solid #181818' : '1px solid #c0c0c0',
	boxShadow: dark.value ? '0 6px 18px rgba(0, 0, 0, 0.5)' : '0 6px 18px rgba(0, 0, 0, 0.15)',
	color: dark.value ? '#d8d8d8' : '#000000',
	left: position.left,
	top: position.top,
	width: position.width,
	boxSizing: 'border-box'
}));

const itemStyle = (keyword: string): CSSProperties => ({
	position: 'relative',
	padding: '2px 26px 2px 8px',
	lineHeight: '18px',
	minHeight: '18px',
	cursor: 'pointer',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	color: dark.value ? '#d8d8d8' : '#000000',
	transition: 'background 0.2s ease',
	background:
		hover.value === keyword ? (dark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : ''
});

const show = (target: HTMLInputElement): void => {
	input = target;
	const histories = BrowserSearchHistory.histories;
	if (histories.length === 0) {
		visible.value = false;
		return;
	}
	keywords.value = histories.slice(0, BrowserSearchHistory.getLimit!());
	const anchor = input.closest?.('text-box') ?? input;
	const rect = anchor.getBoundingClientRect();
	position.width = `${rect.width}px`;
	position.left = `${rect.left + window.scrollX}px`;
	position.top = `${rect.bottom + window.scrollY}px`;
	visible.value = true;
	if (outsideHandler) {
		document.removeEventListener('mousedown', outsideHandler);
		outsideHandler = null;
	}
	setTimeout(() => {
		outsideHandler = (event: Event) => {
			const el = document.querySelector('.browser-search-history-dropdown');
			if (el && !el.contains(event.target as Node) && event.target !== input) {
				hide();
			}
		};
		document.addEventListener('mousedown', outsideHandler);
	}, 0);
};

const hide = (): void => {
	visible.value = false;
	if (outsideHandler) {
		document.removeEventListener('mousedown', outsideHandler);
		outsideHandler = null;
	}
};

const onItemClick = (keyword: string): void => {
	if (!input) return;
	input.value = keyword;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.focus();
	hide();
};

const onDeleteClick = (keyword: string, event: MouseEvent): void => {
	event.preventDefault();
	event.stopPropagation();
	BrowserSearchHistory.remove!(keyword);
	if (BrowserSearchHistory.histories.length === 0) {
		hide();
	} else {
		show(input!);
	}
};

onMounted(() => {
	registerSearchHistoryDropdown({ show, hide });
	themeObserver = new MutationObserver(() => {
		dark.value = document.documentElement.classList.contains('dark');
	});
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class']
	});
});

onBeforeUnmount(() => {
	registerSearchHistoryDropdown(null);
	themeObserver?.disconnect();
	themeObserver = null;
	if (outsideHandler) {
		document.removeEventListener('mousedown', outsideHandler);
		outsideHandler = null;
	}
});

defineExpose({ show, hide });
</script>
