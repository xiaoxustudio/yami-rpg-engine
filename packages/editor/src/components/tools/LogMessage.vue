<template>
	<div
		ref="rootEl"
		class="box"
		id="log-message"
		:class="{ open: items.length !== 0 }"
		@click="onMessageClick"
	>
		<div
			class="log-item"
			v-for="(item, index) in items"
			:key="index"
			:class="item.type"
			v-html="item.message"
		/>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { logEls } from '@app/log/element-registry';
import { registerElement } from '@app/utils/element-registry';
import { Log } from '@app/log/log-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import { useToastService } from '@app/composables/useToastService';

const toast = useToastService();

const items = ref<{ type: string; message: string; duration: number }[]>([]);
const rootEl = ref<HTMLElement | null>(null);

// 日志消息允许的样式 span（供点击跳转 VSCode 使用），其余 HTML 一律转义防注入
const escapeHtml = (value: unknown): string =>
	String(value ?? '').replace(/[&<>"']/g, (c) =>
		c === '&'
			? '&amp;'
			: c === '<'
				? '&lt;'
				: c === '>'
					? '&gt;'
					: c === '"'
						? '&quot;'
						: '&#39;'
	);

const sanitizeLogMessage = (message: unknown): string =>
	escapeHtml(message).replace(
		/&lt;span class=&quot;(log-path|log-strong|log-num|log-weak)&quot;&gt;|&lt;\/span&gt;/g,
		(tag) => {
			if (tag === '&lt;/span&gt;') return '</span>';
			const match = tag.match(/log-(?:path|strong|num|weak)/);
			return `<span class="${match![0]}">`;
		}
	);

const update = (): void => {
	const next = Log.list.slice();
	const prev = items.value;
	if (next.length > prev.length) {
		const newest = next.slice(prev.length);
		for (const item of newest) {
			if (item.type === 'error') {
				toast.show(escapeHtml(item.message), 'error');
			}
		}
	}
	// oxlint-disable-next-line no-map-spread
	items.value = next.map((item: { type: string; message: string; duration: number }) => ({
		...item,
		message: sanitizeLogMessage(item.message)
	}));
};

const onMessageClick = (event: MouseEvent): void => {
	const path = (event.target as HTMLElement).closest?.('.log-path') as HTMLElement | null;
	if (!path) return;
	const LINE = path.nextElementSibling;
	const COLUMN = LINE?.nextElementSibling;
	const file = File.route!(path.textContent ?? '');
	const line = parseInt(LINE?.textContent ?? '');
	const column = parseInt(COLUMN?.textContent ?? '');
	Log.openVSCode?.(file, line, column);
};

onMounted(() => {
	registerElement(logEls, 'log-message', rootEl.value);
	const el = rootEl.value;
	if (!el) return;
	attachElementApi(el, { update });
	update();
});
</script>
