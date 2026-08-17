<template>
<WindowFrame id="httpRequest" @confirm="onConfirm">
	<template #title><TitleBar>httpRequest<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">URL</div><StringVar id="httpRequest-url" v-model="form.url" /> <div class="text">Method</div
			><SelectBox id="httpRequest-method" v-model="form.method" /> <div class="text">Header</div
			><ParamList id="httpRequest-header" /> <div class="text">Data</div
			><ParamList id="httpRequest-data" /> <div class="text">TimeOut</div
			><NumberBox id="httpRequest-timeout" v-model="form.timeout" /> <div class="text">ResponseType</div
			><SelectBox id="httpRequest-responseType" v-model="form.responseType" /> <div class="text">WithCredentials</div
			><CheckBox class="standard" id="httpRequest-withCredentials" v-model="form.withCredentials" />
			<div class="text">AuthUser</div><StringVar id="httpRequest-authUser" v-model="form.authUser" />
			<div class="text">AuthPass</div><StringVar id="httpRequest-authPass" v-model="form.authPass" />
			<div class="text">CallBack</div
			><CustomBox id="httpRequest-callback" type="file" filter="event" @input="onCallback" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useHttpRequestCommandSchema } from '@app/composables/commands/useHttpRequestCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { RequestkeyValueBind } from '@app/legacy/module/command/requestURL.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { form, save } = useHttpRequestCommandSchema();

const onCallback = (value: unknown) => {
	form.callback = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#httpRequest-method')?.loadItems?.([
		{ name: 'GET', value: 'GET' },
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' },
		{ name: 'DELETE', value: 'DELETE' },
		{ name: 'PATCH', value: 'PATCH' }
	]);
	$('#httpRequest-responseType')?.loadItems?.([
		{ name: 'JSON', value: 'json' },
		{ name: 'Text', value: 'text' },
		{ name: 'Blob', value: 'blob' },
		{ name: 'ArrayBuffer', value: 'arraybuffer' },
		{ name: 'Document', value: 'document' },
		{ name: 'Stream', value: 'stream' }
	]);
	$('#httpRequest-header')?.bind?.(RequestkeyValueBind);
	$('#httpRequest-data')?.bind?.(RequestkeyValueBind);
});

</script>
