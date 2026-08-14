<template>
	<div ref="rootEl" class="box" id="log-message" :class="{ open: items.length !== 0 }" @click="onMessageClick">
		<log-item v-for="(item, index) in items" :key="index" :class="item.type" v-html="item.message" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { Log } from '@/log/log-window.ts';
import { File } from '@/file/file-system-core.ts';
import { attachElementApi } from '@/utils/attach-element-api';

const inspector = useInspectorStore();
const local = useLocalStore();

const items = ref<{ type: string; message: string; duration: number }[]>([]);
const rootEl = ref<HTMLElement | null>(null);

const update = (): void => {
	items.value = Log.list.slice();
};

const onMessageClick = (event: MouseEvent): void => {
	const path = (event.target as HTMLElement).closest?.('log-path') as HTMLElement | null;
	if (!path) return;
	const LINE = path.nextElementSibling;
	const COLUMN = LINE?.nextElementSibling;
	const file = File.route!(path.textContent ?? '');
	const line = parseInt(LINE?.textContent ?? '');
	const column = parseInt(COLUMN?.textContent ?? '');
	Log.openVSCode?.(file, line, column);
};

onMounted(() => {
	const el = rootEl.value;
	if (!el) return;
	attachElementApi(el, { update });
	update();
	inspector.syncState();
	local.syncState();
});
</script>
