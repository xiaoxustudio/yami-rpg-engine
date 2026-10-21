<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileScript-info-grid.label') || 'File Info'
		}}</DetailSummary>
		<div class="detail-grid" id="fileScript-info-grid">
			<div class="text">{{ t('components.fileScript-name.label') || 'Name' }}</div>
			<div class="text" id="fileScript-name" v-tip="t('components.fileScript-name.tip')">
				{{ form.name }}
			</div>
			<div class="text">{{ t('components.fileScript-size.label') || 'Size' }}</div>
			<div class="text" id="fileScript-size" v-tip="t('components.fileScript-size.tip')">
				{{ form.size }}
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScript-overview.label') || 'Overview' }}</DetailSummary>
		<div class="box" id="fileScript-overview" ref="overviewEl" @update="syncOverview">
			<PluginOverview :meta="overviewMeta" detailed />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useFileScriptPage } from '@app/composables/useFileScriptPage';
import { useEventListener } from '@app/composables/useEventListener';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { Inspector } from '@app/inspector/inspector.ts';
import type { PluginMetaShape } from '@app/plugin/plugin.ts';
import PluginOverview from '@app/components/tools/PluginOverview.vue';

const { t } = useI18n();

const { form, sync } = useFileScriptPage();

const overviewEl = ref<HTMLElement | null>(null);
const overviewMeta = ref<PluginMetaShape | null>(null);

const syncOverview = (): void => {
	overviewMeta.value = Inspector.fileScript?.meta ?? null;
};

/**
 * `localize` 是全局事件，改走 composable（挂/摘成对，不再靠模块级 `localizeHandler`
 * 加 `onBeforeUnmount` 手工配对）。
 *
 * 两点**必须保留**的原有语义，否则是行为变更：
 *   1. **注册时机**：原实现只在 `onMounted` 且 `Inspector.fileScript` 已就绪时才挂。
 *      `useEventListener` 只能在 setup 期调用，故用 `enabled`（初始 false → 挂载时置真）
 *      把首次注册推迟到那一刻；置真的赋值会触发内部 watch 完成注册。
 *   2. **不做方法提取**：调 `Inspector.fileScript?.windowLocalize(e)` 会把 `this` 隐式绑成
 *      `Inspector.fileScript`，而原实现是取一次方法、以普通函数身份注册的。故先存
 *      `localizeHandler`，触发时按普通函数调用。
 */
const localizeHandler = ref<((event: Event) => void) | null>(null);
const localizeEnabled = ref(false);

useEventListener(window, 'localize', (event) => localizeHandler.value?.(event), {
	enabled: localizeEnabled
});

onMounted(() => {
	const fileScript = Inspector.fileScript;
	if (fileScript) {
		fileScript.overview = overviewEl.value;
		const onLocalize = fileScript.windowLocalize;
		localizeHandler.value = onLocalize;
		localizeEnabled.value = true;
	}
	const el = inspectorEls.get('fileScript');
	if (el) {
		attachElementApi(el, { update: sync });
	}
	sync();
});
</script>

<style>
#fileScript-overview {
	display: block;
	margin: 4px;
	padding: 4px 10px;
	width: calc(100% - 8px);

	user-select: text;
	overflow: hidden;
	white-space: pre-wrap;
	text-overflow: ellipsis;
	background-color: var(--input-background);
	border-top: var(--input-border-dark);
	border-left: var(--input-border-light);
	border-right: var(--input-border-light);
	border-bottom: var(--input-border-light);
	border-radius: 2px;
}
</style>
