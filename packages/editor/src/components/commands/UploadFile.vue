<template>
	<WindowFrame id="uploadFile" :ref="controlRef('uploadFile')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.uploadFile.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.uploadFile-url.label') }}</div>
			<StringVar
				id="uploadFile-url"
				:ref="controlRef('uploadFile-url')"
				v-tip="t('components.uploadFile-url.tip')"
				v-focus
				v-model="form.url"
			/>
			<div class="text">{{ t('components.uploadFile-path.label') }}</div>
			<StringVar
				id="uploadFile-path"
				:ref="controlRef('uploadFile-path')"
				v-tip="t('components.uploadFile-path.tip')"
				v-focus
				v-model="form.path"
			/>
			<div class="text">{{ t('components.uploadFile-method.label') }}</div>
			<SelectBox
				:label="t('components.uploadFile-method.label')"
				id="uploadFile-method"
				v-tip="t('components.uploadFile-method.tip')"
				:ref="controlRef('uploadFile-method')"
				v-model="form.method"
			/>
			<div class="text">{{ t('components.uploadFile-field.label') }}</div>
			<StringVar
				id="uploadFile-field"
				:ref="controlRef('uploadFile-field')"
				v-tip="t('components.uploadFile-field.tip')"
				v-model="form.field"
			/>
			<div class="text">{{ t('components.uploadFile-header.label') }}</div>
			<ParamList
				id="uploadFile-header"
				v-tip="t('components.uploadFile-header.tip')"
				:ref="controlRef('uploadFile-header')"
				v-model="form.header"
			/>
			<div class="text">{{ t('components.uploadFile-callback.label') }}</div>
			<CustomBox
				id="uploadFile-callback"
				:ref="controlRef('uploadFile-callback')"
				v-tip="t('components.uploadFile-callback.tip')"
				type="file"
				filter="event"
				v-model="form.callback"
			/>
			<div class="text">{{ t('components.uploadFile-rateCallback.label') }}</div>
			<CustomBox
				id="uploadFile-rateCallback"
				:ref="controlRef('uploadFile-rateCallback')"
				v-tip="t('components.uploadFile-rateCallback.tip')"
				type="file"
				filter="event"
				v-model="form.rateCallback"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
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
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'uploadFile'
	| 'uploadFile-callback'
	| 'uploadFile-field'
	| 'uploadFile-header'
	| 'uploadFile-method'
	| 'uploadFile-path'
	| 'uploadFile-rateCallback'
	| 'uploadFile-url';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useUploadFileCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	controls['uploadFile-method']?.loadItems?.([
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' }
	]);
	controls['uploadFile-header']?.bind?.(RequestkeyValueBind);
});
</script>

<style>
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
