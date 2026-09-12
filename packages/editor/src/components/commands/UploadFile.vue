<template>
	<WindowFrame id="uploadFile" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.uploadFile.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">URL</div>
			<StringVar id="uploadFile-url" v-focus v-model="form.url" />
			<div class="text">LocalPath</div>
			<StringVar id="uploadFile-path" v-focus v-model="form.path" />
			<div class="text">Method</div>
			<SelectBox id="uploadFile-method"
				:ref="registryRef(fieldEls, 'uploadFile-method')" v-model="form.method" />
			<div class="text">Field</div>
			<StringVar id="uploadFile-field" v-model="form.field" />
			<div class="text">Header</div>
			<ParamList id="uploadFile-header"
				:ref="registryRef(fieldEls, 'uploadFile-header')" v-model="form.header" />
			<div class="text">CallBack</div>
			<CustomBox
				id="uploadFile-callback"
				type="file"
				filter="event"
				v-model="form.callback"
			/>
			<div class="text">RateCallBack</div>
			<CustomBox
				id="uploadFile-rateCallback"
				type="file"
				filter="event"
				v-model="form.rateCallback"
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
