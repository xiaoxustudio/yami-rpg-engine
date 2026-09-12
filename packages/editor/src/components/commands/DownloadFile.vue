<template>
	<WindowFrame id="downloadFile"
				:ref="registryRef(fieldEls, 'downloadFile')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.downloadFile.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.downloadFile-url.label') }}</div>
			<StringVar id="downloadFile-url"
				:ref="registryRef(fieldEls, 'downloadFile-url')"
				v-tip="t('components.downloadFile-url.tip')" v-focus v-model="form.url" />
			<div class="text">{{ t('components.downloadFile-header.label') }}</div>
			<ParamList id="downloadFile-header"
				v-tip="t('components.downloadFile-header.tip')"
				:ref="registryRef(fieldEls, 'downloadFile-header')" v-model="form.header" />
			<div class="text">{{ t('components.downloadFile-method.label') }}</div>
			<SelectBox id="downloadFile-method"
				v-tip="t('components.downloadFile-method.tip')"
				:ref="registryRef(fieldEls, 'downloadFile-method')" v-model="form.method" />
			<div class="text">{{ t('components.downloadFile-data.label') }}</div>
			<ParamList id="downloadFile-data"
				v-tip="t('components.downloadFile-data.tip')"
				:ref="registryRef(fieldEls, 'downloadFile-data')" v-model="form.data" />
			<div class="text">{{ t('components.downloadFile-callback.label') }}</div>
			<CustomBox
				id="downloadFile-callback"
				:ref="registryRef(fieldEls, 'downloadFile-callback')"
				v-tip="t('components.downloadFile-callback.tip')"
				type="file"
				filter="event"
				v-model="form.callback"
			/>
			<div class="text">{{ t('components.downloadFile-rateCallback.label') }}</div>
			<CustomBox
				id="downloadFile-rateCallback"
				:ref="registryRef(fieldEls, 'downloadFile-rateCallback')"
				v-tip="t('components.downloadFile-rateCallback.tip')"
				type="file"
				filter="event"
				v-model="form.rateCallback"
			/>
			<div class="text">IsBackground</div>
			<CheckBox
				class="standard"
				id="downloadFile-isBackground"
				v-tip="t('components.downloadFile-isBackground.tip')"
				:ref="registryRef(fieldEls, 'downloadFile-isBackground')"
				v-model="isBackground"
				@input="onIsBackgroundInput"
			/>
			<div class="text">{{ t('components.downloadFile-isBackground-path.label') }}</div>
			<StringVar id="downloadFile-isBackground-path"
				v-tip="t('components.downloadFile-isBackground-path.tip')"
				:ref="registryRef(fieldEls, 'downloadFile-isBackground-path')" v-model="form.isBackgroundPath" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDownloadFileCommandSchema } from '@app/composables/commands/useDownloadFileCommandSchema';
import { disable, enable } from '@app/utils/element-utils';
import { RequestkeyValueBind } from '@app/composables/commands/useRequestURLCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useDownloadFileCommandSchema();

const isBackground = computed({
	get: () => form.isBackground as boolean,
	set: (value) => {
		form.isBackground = value;
	}
});

const onIsBackgroundInput = (value: boolean) => {
	if (value) {
		enable(fieldEls.get('downloadFile-isBackground-path'));
	} else {
		disable(fieldEls.get('downloadFile-isBackground-path'));
	}
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('downloadFile-method')?.loadItems?.([
		{ name: 'GET', value: 'GET' },
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' },
		{ name: 'DELETE', value: 'DELETE' }
	]);
	fieldEls.get('downloadFile-isBackground')?.relate?.([fieldEls.get('downloadFile-isBackground-path')]);
	disable(fieldEls.get('downloadFile-isBackground-path'));
	fieldEls.get('downloadFile-header')?.bind?.(RequestkeyValueBind);
	fieldEls.get('downloadFile-data')?.bind?.(RequestkeyValueBind);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#downloadFile {
	width: 324px;
	height: 430px;
}

#downloadFile-header {
	height: 102px;
}

#downloadFile-data {
	height: 102px;
}

#downloadFile-confirm {
	right: 108px;
	bottom: 10px;
}

#downloadFile-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
