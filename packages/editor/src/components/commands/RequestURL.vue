<template>
	<WindowFrame id="requestURL" :ref="boxRef('requestURL')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.requestURL.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.requestURL-url.label') }}</div>
			<StringVar
				id="requestURL-url"
				:ref="boxRef('requestURL-url')"
				v-tip="t('components.requestURL-url.tip')"
				v-focus
				v-model="form.url"
			/>
			<div class="text">{{ t('components.requestURL-header.label') }}</div>
			<ParamList
				id="requestURL-header"
				v-tip="t('components.requestURL-header.tip')"
				:ref="boxRef('requestURL-header')"
				v-model="form.headers"
			/>
			<div class="text">{{ t('components.requestURL-method.label') }}</div>
			<SelectBox
				:label="t('components.requestURL-method.label')"
				id="requestURL-method"
				v-tip="t('components.requestURL-method.tip')"
				:ref="boxRef('requestURL-method')"
				v-model="form.method"
			/>
			<div class="text">{{ t('components.requestURL-data.label') }}</div>
			<ParamList
				id="requestURL-data"
				v-tip="t('components.requestURL-data.tip')"
				:ref="boxRef('requestURL-data')"
				v-model="form.data"
			/>
			<div class="text">{{ t('components.requestURL-callback.label') }}</div>
			<CustomBox
				id="requestURL-callback"
				:ref="boxRef('requestURL-callback')"
				v-tip="t('components.requestURL-callback.tip')"
				type="file"
				filter="event"
				v-model="form.callback"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRequestURLCommandSchema } from '@app/composables/commands/useRequestURLCommandSchema';
import { RequestkeyValueBind } from '@app/composables/commands/useRequestURLCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

// 控件用局部模板 ref 回调（存**元素**：relate/hide/show 需要 DOM 元素），不再进全局注册表。
type ControlElement = HTMLElement & {
	loadItems?: (items: unknown[]) => unknown;
	bind?: (value: unknown) => unknown;
	write?: (value: unknown) => void;
	read?: () => unknown;
};
const boxes: Record<string, ControlElement | null> = {};
const boxRef = (id: string) => (el: unknown) => {
	if (el == null) {
		boxes[id] = null;
		return;
	}
	if (el instanceof HTMLElement) {
		boxes[id] = el as ControlElement;
		return;
	}
	const instance = el as { $el?: unknown; root?: unknown };
	const root = instance.$el ?? instance.root ?? null;
	boxes[id] = root instanceof HTMLElement ? (root as ControlElement) : null;
};

const { t } = useI18n();

const { form, save } = useRequestURLCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	boxes['requestURL-method']?.loadItems?.([
		{ name: 'GET', value: 'GET' },
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' },
		{ name: 'DELETE', value: 'DELETE' }
	]);
	boxes['requestURL-header']?.bind?.(RequestkeyValueBind);
	boxes['requestURL-data']?.bind?.(RequestkeyValueBind);
});
</script>

<style>
#requestURL {
	width: 324px;
	height: 360px;
}

#requestURL-header {
	height: 102px;
}

#requestURL-data {
	height: 102px;
}

#requestURL-confirm {
	right: 108px;
	bottom: 10px;
}

#requestURL-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
