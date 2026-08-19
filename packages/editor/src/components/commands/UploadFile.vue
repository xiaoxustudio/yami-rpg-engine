<template>
	<WindowFrame id="uploadFile" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.uploadFile.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">URL</div><StringVar id="uploadFile-url" v-model="form.url" /> <div class="text">LocalPath</div
				><StringVar id="uploadFile-path" v-model="form.path" /> <div class="text">Method</div
				><SelectBox id="uploadFile-method" v-model="form.method" /> <div class="text">Field</div
				><StringVar id="uploadFile-field" v-model="form.field" /> <div class="text">Header</div
				><ParamList id="uploadFile-header" /> <div class="text">CallBack</div
				><CustomBox id="uploadFile-callback" type="file" filter="event" @input="onCallback" />
				<div class="text">RateCallBack</div
				><CustomBox id="uploadFile-rateCallback" type="file" filter="event" @input="onRateCallback" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUploadFileCommandSchema } from '@app/composables/commands/useUploadFileCommandSchema';
import { $ } from '@app/utils/dom';
import { RequestkeyValueBind } from '@app/legacy/module/command/requestURL.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useUploadFileCommandSchema();

const onCallback = (value: unknown) => {
	form.callback = value;
};

const onRateCallback = (value: unknown) => {
	form.rateCallback = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#uploadFile-method')?.loadItems?.([
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' }
	]);
	$('#uploadFile-header')?.bind?.(RequestkeyValueBind);
});

</script>
