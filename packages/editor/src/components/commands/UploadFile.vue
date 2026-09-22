<template>
	<WindowFrame id="uploadFile" :ref="registryRef(fieldEls, 'uploadFile')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.uploadFile.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.uploadFile-url.label') }}</div>
			<StringVar
				id="uploadFile-url"
				:ref="registryRef(fieldEls, 'uploadFile-url')"
				v-tip="t('components.uploadFile-url.tip')"
				v-focus
				v-model="form.url"
			/>
			<div class="text">{{ t('components.uploadFile-path.label') }}</div>
			<StringVar
				id="uploadFile-path"
				:ref="registryRef(fieldEls, 'uploadFile-path')"
				v-tip="t('components.uploadFile-path.tip')"
				v-focus
				v-model="form.path"
			/>
			<div class="text">{{ t('components.uploadFile-method.label') }}</div>
			<SelectBox
				id="uploadFile-method"
				v-tip="t('components.uploadFile-method.tip')"
				:ref="registryRef(fieldEls, 'uploadFile-method')"
				v-model="form.method"
			/>
			<div class="text">{{ t('components.uploadFile-field.label') }}</div>
			<StringVar
				id="uploadFile-field"
				:ref="registryRef(fieldEls, 'uploadFile-field')"
				v-tip="t('components.uploadFile-field.tip')"
				v-model="form.field"
			/>
			<div class="text">{{ t('components.uploadFile-header.label') }}</div>
			<ParamList
				id="uploadFile-header"
				v-tip="t('components.uploadFile-header.tip')"
				:ref="registryRef(fieldEls, 'uploadFile-header')"
				v-model="form.header"
			/>
			<div class="text">{{ t('components.uploadFile-callback.label') }}</div>
			<CustomBox
				id="uploadFile-callback"
				:ref="registryRef(fieldEls, 'uploadFile-callback')"
				v-tip="t('components.uploadFile-callback.tip')"
				type="file"
				filter="event"
				v-model="form.callback"
			/>
			<div class="text">{{ t('components.uploadFile-rateCallback.label') }}</div>
			<CustomBox
				id="uploadFile-rateCallback"
				:ref="registryRef(fieldEls, 'uploadFile-rateCallback')"
				v-tip="t('components.uploadFile-rateCallback.tip')"
				type="file"
				filter="event"
				v-model="form.rateCallback"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUploadFileCommandSchema } from '@app/composables/commands/useUploadFileCommandSchema';
import { RequestkeyValueBind } from '@app/composables/commands/useRequestURLCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useUploadFileCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('uploadFile-method')?.loadItems?.([
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' }
	]);
	fieldEls.get('uploadFile-header')?.bind?.(RequestkeyValueBind);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#uploadFile {
	width: 324px;
	height: 430px;
}

#uploadFile-header {
	height: 102px;
}

#uploadFile-confirm {
	right: 108px;
	bottom: 10px;
}

#uploadFile-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
