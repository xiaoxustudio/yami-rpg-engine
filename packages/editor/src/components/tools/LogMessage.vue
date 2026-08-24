<template>
	<div ref="rootEl" class="box" id="log-message" :class="{ open: items.length !== 0 }" @click="onMessageClick">
		<div class="log-item" v-for="(item, index) in items" :key="index" :class="item.type" v-html="item.message" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { Log } from '@app/log/log-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import { useToastService } from '@app/composables/useToastService';

const inspector = useInspectorStore();
const local = useLocalStore();
const toast = useToastService();

const items = ref<{ type: string; message: string; duration: number }[]>([]);
const rootEl = ref<HTMLElement | null>(null);

const update = (): void => {
	const next = Log.list.slice();
	const prev = items.value;
	if (next.length > prev.length) {
		const newest = next.slice(prev.length);
		for (const item of newest) {
			if (item.type === 'error') {
				toast.show(item.message, 'error');
			}
		}
	}
	items.value = next;
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
	const el = rootEl.value;
	if (!el) return;
	attachElementApi(el, { update });
	update();


});
</script>
