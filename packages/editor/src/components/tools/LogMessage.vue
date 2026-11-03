<template>
	<div class="box" id="log-message" :class="{ open: items.length !== 0 }" @click="onMessageClick">
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
import { onMounted, onUnmounted, ref } from 'vue';
import { Log } from '@app/log/log-window.ts';
import { File } from '@app/file/file-system-core.ts';
import {
	provideLogMessageBridge,
	resetLogMessageBridge,
	type LogMessageBridge
} from '@app/composables/log-message-bridge';
import { useToastService } from '@app/composables/useToastService';

const toast = useToastService();

const items = ref<{ type: string; message: string; duration: number }[]>([]);

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

/** 日志刷新由窗口自己实现，单例经桥调用（不再把 `update` 挂到根元素上）。 */
const bridgeApi: LogMessageBridge = { update };

onMounted(() => {
	provideLogMessageBridge(bridgeApi);
	onUnmounted(() => resetLogMessageBridge(bridgeApi));
	update();
});
</script>
