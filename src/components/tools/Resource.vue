<template>
		<WindowFrame id="resource">
		<TitleBar>
			<close></close>
		</TitleBar>
		<content-frame>
			<box style="display: flex; flex-direction: column; height: 100%">
				<box
					id="resource-node-info"
					style="
						padding: 12px;
						margin: 10px;
						background: var(--panel-background);
						border: 1px solid var(--border-color);
						border-radius: 4px;
						flex-shrink: 0;
					"
				>
					<div
						id="resource-current-node"
						style="
							font-size: 13px;
							line-height: 1.8;
							color: var(--text-color);
							margin-bottom: 4px;
						"
					>
						当前节点: 加载中...
					</div>
					<div
						id="resource-node-ping"
						style="font-size: 13px; line-height: 1.8; color: var(--text-color-weak)"
					>
						Ping: --
					</div>
				</box>
				<box id="resource-content" style="flex: 1; overflow: auto" />
				<grid-box style="flex-shrink: 0">
					<button id="resource-check-version">check version</button>
					<button id="resource-open-dir">open dir</button>
				</grid-box>
			</box>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
