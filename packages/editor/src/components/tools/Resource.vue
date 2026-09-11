<template>
	<WindowFrame id="resource" no-buttons>
		<template #title
			><TitleBar> <div class="close"></div> </TitleBar
		></template>

		<div class="box" style="display: flex; flex-direction: column; height: 100%">
			<div
				class="box"
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
					{{ resource.nodeText }}
				</div>
				<div
					id="resource-node-ping"
					:style="{
						fontSize: '13px',
						lineHeight: 1.8,
						color: resource.pingColor
					}"
				>
					{{ resource.pingText }}
				</div>
			</div>
			<div class="box" id="resource-content" style="flex: 1; overflow: auto">
				<ResourceList
					:rows="resource.rows"
					@download="onDownload"
					@pause="onPause"
					@remove="onRemove"
				/>
			</div>
			<div class="grid-box" style="flex-shrink: 0">
				<button id="resource-check-version" @click="onCheckVersion">
					{{ t('confirmation.resource-check-version') }}
				</button>
				<button id="resource-open-dir" @click="onOpenDir">
					{{ t('confirmation.resource-open-dir') }}
				</button>
			</div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ResourceList from './resource/ResourceList.vue';
import { Resources } from '@app/module/resource';
import { getResourceStore } from '@app/stores/resource';

const { t } = useI18n();
const resource = getResourceStore();

// R1 数据化：行与节点信息都走 store，按钮标签走 i18n，故不再需要
// 旧的 `attachElementApi(root, { update })` + initI18n 时给 #menu/#resource 打补丁那套。
const onDownload = (key: string): void => Resources.download(key);
const onPause = (key: string): void => Resources.pause(key);
const onRemove = (key: string): void => Resources.remove(key);
const onCheckVersion = (): void => void Resources.checkVersion();
const onOpenDir = (): void => Resources.openDir();
</script>

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#resource {
	width: 520px;
	height: 700px;
}

#resource-check-version {
	right: 108px;
	bottom: 10px;
}

#resource-open-dir {
	right: 10px;
	bottom: 10px;
}
</style>
