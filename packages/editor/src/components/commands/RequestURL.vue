<template>
	<WindowFrame id="requestURL" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.requestURL.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">URL</div>
			<StringVar id="requestURL-url"
				v-tip="t('components.requestURL-url.tip')" v-focus v-model="form.url" />
			<div class="text">Header</div>
			<ParamList id="requestURL-header"
				v-tip="t('components.requestURL-header.tip')"
				:ref="registryRef(fieldEls, 'requestURL-header')" v-model="form.headers" />
			<div class="text">Method</div>
			<SelectBox id="requestURL-method"
				v-tip="t('components.requestURL-method.tip')"
				:ref="registryRef(fieldEls, 'requestURL-method')" v-model="form.method" />
			<div class="text">Data</div>
			<ParamList id="requestURL-data"
				v-tip="t('components.requestURL-data.tip')"
				:ref="registryRef(fieldEls, 'requestURL-data')" v-model="form.data" />
			<div class="text">CallBack</div>
			<CustomBox
				id="requestURL-callback"
				v-tip="t('components.requestURL-callback.tip')"
				type="file"
				filter="event"
				v-model="form.callback"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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

const { t } = useI18n();

const { form, save } = useRequestURLCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('requestURL-method')?.loadItems?.([
		{ name: 'GET', value: 'GET' },
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' },
		{ name: 'DELETE', value: 'DELETE' }
	]);
	fieldEls.get('requestURL-header')?.bind?.(RequestkeyValueBind);
	fieldEls.get('requestURL-data')?.bind?.(RequestkeyValueBind);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
