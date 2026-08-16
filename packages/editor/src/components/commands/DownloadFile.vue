<template>
<WindowFrame id="downloadFile" @confirm="onConfirm">
	<template #title><TitleBar>downloadFile<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">URL</div><StringVar id="downloadFile-url" v-model="form.url" /> <div class="text">Header</div
			><ParamList id="downloadFile-header" /> <div class="text">Method</div
			><SelectBox id="downloadFile-method" v-model="form.method" /> <div class="text">Data</div
			><ParamList id="downloadFile-data" /> <div class="text">CallBack</div
			><CustomBox id="downloadFile-callback" type="file" filter="event" @input="onCallback" />
			<div class="text">RateCallBack</div
			><CustomBox id="downloadFile-rateCallback" type="file" filter="event" @input="onRateCallback" />
			<div class="text">IsBackground</div
			><CheckBox class="standard" id="downloadFile-isBackground" v-model="form.isBackground" @input="onIsBackgroundInput" />
			<div class="text">Path</div><StringVar id="downloadFile-isBackground-path" v-model="form.isBackgroundPath" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useDownloadFileCommandSchema } from '@app/composables/commands/useDownloadFileCommandSchema';
import { $ } from '@/util/dom.ts';
import { disable, enable } from '@/util/element-utils';
import { RequestkeyValueBind } from '@/module/command/requestURL.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useDownloadFileCommandSchema();

const onCallback = (value: unknown) => {
	form.callback = value;
};

const onRateCallback = (value: unknown) => {
	form.rateCallback = value;
};

const onIsBackgroundInput = (value: boolean) => {
	if (value) {
		enable($('#downloadFile-isBackground-path'));
	} else {
		disable($('#downloadFile-isBackground-path'));
	}
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#downloadFile-method')?.loadItems?.([
		{ name: 'GET', value: 'GET' },
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' },
		{ name: 'DELETE', value: 'DELETE' }
	]);
	$('#downloadFile-isBackground')?.relate?.([$('#downloadFile-isBackground-path')]);
	disable($('#downloadFile-isBackground-path'));
	$('#downloadFile-header')?.bind?.(RequestkeyValueBind);
	$('#downloadFile-data')?.bind?.(RequestkeyValueBind);
});

</script>
