<template>
	<WindowFrame id="downloadFile" :ref="controlRef('downloadFile')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.downloadFile.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.downloadFile-url.label') }}</div>
			<StringVar
				id="downloadFile-url"
				:ref="controlRef('downloadFile-url')"
				v-tip="t('components.downloadFile-url.tip')"
				v-focus
				v-model="form.url"
			/>
			<div class="text">{{ t('components.downloadFile-header.label') }}</div>
			<ParamList
				id="downloadFile-header"
				v-tip="t('components.downloadFile-header.tip')"
				:ref="controlRef('downloadFile-header')"
				v-model="form.header"
			/>
			<div class="text">{{ t('components.downloadFile-method.label') }}</div>
			<SelectBox
				:label="t('components.downloadFile-method.label')"
				id="downloadFile-method"
				v-tip="t('components.downloadFile-method.tip')"
				:ref="controlRef('downloadFile-method')"
				v-model="form.method"
			/>
			<div class="text">{{ t('components.downloadFile-data.label') }}</div>
			<ParamList
				id="downloadFile-data"
				v-tip="t('components.downloadFile-data.tip')"
				:ref="controlRef('downloadFile-data')"
				v-model="form.data"
			/>
			<div class="text">{{ t('components.downloadFile-callback.label') }}</div>
			<CustomBox
				id="downloadFile-callback"
				:ref="controlRef('downloadFile-callback')"
				v-tip="t('components.downloadFile-callback.tip')"
				type="file"
				filter="event"
				v-model="form.callback"
			/>
			<div class="text">{{ t('components.downloadFile-rateCallback.label') }}</div>
			<CustomBox
				id="downloadFile-rateCallback"
				:ref="controlRef('downloadFile-rateCallback')"
				v-tip="t('components.downloadFile-rateCallback.tip')"
				type="file"
				filter="event"
				v-model="form.rateCallback"
			/>
			<div class="text">{{ t('components.downloadFile-isBackground.label') }}</div>
			<CheckBox
				class="standard"
				id="downloadFile-isBackground"
				v-tip="t('components.downloadFile-isBackground.tip')"
				:ref="controlRef('downloadFile-isBackground')"
				v-model="isBackground"
				@input="onIsBackgroundInput"
			/>
			<div class="text">{{ t('components.downloadFile-isBackground-path.label') }}</div>
			<StringVar
				id="downloadFile-isBackground-path"
				v-tip="t('components.downloadFile-isBackground-path.tip')"
				:ref="controlRef('downloadFile-isBackground-path')"
				v-model="form.isBackgroundPath"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
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
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	provideDownloadFileBridge,
	resetDownloadFileBridge,
	type DownloadFileBridge
} from '@app/composables/download-file-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'downloadFile-callback'
	| 'downloadFile-data'
	| 'downloadFile-header'
	| 'downloadFile-isBackground-path'
	| 'downloadFile-isBackground'
	| 'downloadFile-method'
	| 'downloadFile-rateCallback'
	| 'downloadFile-url'
	| 'downloadFile';

const { controls, controlRef } = useControlRefs<Id>();

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
		enable(controls['downloadFile-isBackground-path']);
	} else {
		disable(controls['downloadFile-isBackground-path']);
	}
};

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入时按 `isBackground` 开关「写入路径」。 */
const bridgeApi: DownloadFileBridge = {
	setPathEnabled: (enabled) => {
		const control = controls['downloadFile-isBackground-path'];
		if (enabled) control?.enable?.();
		else control?.disable?.();
	}
};

onMounted(() => {
	provideDownloadFileBridge(bridgeApi);
	onUnmounted(() => resetDownloadFileBridge(bridgeApi));
	controls['downloadFile-method']?.loadItems?.([
		{ name: 'GET', value: 'GET' },
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' },
		{ name: 'DELETE', value: 'DELETE' }
	]);
	controls['downloadFile-isBackground']?.relate?.([
		controlRoot(controls['downloadFile-isBackground-path'])
	]);
	disable(controls['downloadFile-isBackground-path']);
	controls['downloadFile-header']?.bind?.(RequestkeyValueBind);
	controls['downloadFile-data']?.bind?.(RequestkeyValueBind);
});
</script>

<style>
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
