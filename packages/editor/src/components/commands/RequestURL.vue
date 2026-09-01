<template>
	<WindowFrame id="requestURL" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.requestURL.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">URL</div>
			<StringVar id="requestURL-url" v-focus v-model="form.url" />
			<div class="text">Header</div>
			<ParamList id="requestURL-header" v-model="form.headers" />
			<div class="text">Method</div>
			<SelectBox id="requestURL-method" v-model="form.method" />
			<div class="text">Data</div>
			<ParamList id="requestURL-data" v-model="form.data" />
			<div class="text">CallBack</div>
			<CustomBox
				id="requestURL-callback"
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
import { $ } from '@app/utils/dom';
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
	$('#requestURL-method')?.loadItems?.([
		{ name: 'GET', value: 'GET' },
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' },
		{ name: 'DELETE', value: 'DELETE' }
	]);
	$('#requestURL-header')?.bind?.(RequestkeyValueBind);
	$('#requestURL-data')?.bind?.(RequestkeyValueBind);
});
</script>
