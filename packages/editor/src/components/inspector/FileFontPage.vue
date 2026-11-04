<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileFont-info-grid.label') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileFont-info-grid">
			<div class="text">{{ t('components.fileFont-name.label') || 'Name' }}</div>
			<div class="text" id="fileFont-name" v-tip="t('components.fileFont-name.tip')">
				{{ form.name }}
			</div>
			<div class="text">{{ t('components.fileFont-size.label') || 'Size' }}</div>
			<div class="text" id="fileFont-size" v-tip="t('components.fileFont-size.tip')">
				{{ form.size }}
			</div>
		</div>
	</DetailBox>
	<DetailBox id="fileFont-font-detail" open>
		<DetailSummary>{{
			t('components.fileFont-font-grid.label') || 'Font Preview'
		}}</DetailSummary>
		<div class="detail-grid" id="fileFont-font-grid" ref="gridEl">
			<TextBox id="fileFont-content" v-model="form.text" />
			<div class="text fileFont-preview" id="fileFont-12px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-18px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-24px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-36px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-48px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-60px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-72px">{{ form.text }}</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useI18n } from 'vue-i18n';
import { useFileFontPage } from '@app/composables/useFileFontPage';
import { Inspector } from '@app/inspector/inspector.ts';
import {
	provideFileFontPageBridge,
	resetFileFontPageBridge,
	type FileFontPageBridge
} from '@app/composables/file-font-page-bridge';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const { form, sync } = useFileFontPage();

/** 预览区网格：字号由 `windowResize` 经桥写，预览节点也在这里取（不再登记进 inspectorEls）。 */
const gridEl = ref<HTMLElement | null>(null);

const bridgeApi: FileFontPageBridge = {
	update: () => {
		sync();
	},
	setPreviewFontSize: (size) => {
		if (gridEl.value) gridEl.value.style.fontSize = `${size}px`;
	}
};

onMounted(() => {
	const fileFont = Inspector.fileFont;
	if (!fileFont) return;
	// 预览节点以前用 `registryElements(inspectorEls, [])` 取 —— 空数组，永远是空的，
	// 于是 `FontFace` 加载完成后 hide/show 的那一套从来没生效过。这里按 DOM 取回来。
	fileFont.previews = [
		...(gridEl.value?.querySelectorAll<HTMLElement>('.fileFont-preview') ?? [])
	] as NonNullable<typeof fileFont.previews>;
	const el = inspectorEls.get('fileFont');
	// 页面根元素由页面管理器登记，`resize` 事件也由它派发；这里只挂监听，不再往元素上挂方法。
	if (el) el.addEventListener('resize', fileFont.windowResize);
	provideFileFontPageBridge(bridgeApi);
	onUnmounted(() => resetFileFontPageBridge(bridgeApi));
	sync();
});
</script>

<style>
#fileFont-font-grid {
	grid-gap: 20px;
	grid-template-columns: 1fr;
}

#fileFont-content {
	font-size: 12px;
}

#fileFont-12px {
	line-height: 1em;
	font-size: 1em;
}

#fileFont-18px {
	font-size: 1.5em;
	line-height: 1em;
}

#fileFont-24px {
	font-size: 2em;
	line-height: 1em;
}

#fileFont-36px {
	font-size: 3em;
	line-height: 1em;
}

#fileFont-48px {
	font-size: 4em;
	line-height: 1em;
}

#fileFont-60px {
	font-size: 5em;
	line-height: 1em;
}

#fileFont-72px {
	font-size: 6em;
	line-height: 1em;
}
</style>
