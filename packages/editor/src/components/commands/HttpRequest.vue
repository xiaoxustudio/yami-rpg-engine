<template>
	<WindowFrame id="httpRequest" :ref="registryRef(fieldEls, 'httpRequest')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.httpRequest.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.httpRequest-url.label') }}</div>
			<StringVar
				id="httpRequest-url"
				:ref="registryRef(fieldEls, 'httpRequest-url')"
				v-tip="t('components.httpRequest-url.tip')"
				v-focus
				v-model="form.url"
			/>
			<div class="text">{{ t('components.httpRequest-method.label') }}</div>
			<SelectBox
				:label="t('components.httpRequest-method.label')"
				id="httpRequest-method"
				v-tip="t('components.httpRequest-method.tip')"
				:ref="registryRef(fieldEls, 'httpRequest-method')"
				v-model="form.method"
			/>
			<div class="text">{{ t('components.httpRequest-header.label') }}</div>
			<ParamList
				id="httpRequest-header"
				v-tip="t('components.httpRequest-header.tip')"
				:ref="registryRef(fieldEls, 'httpRequest-header')"
				v-model="form.headers"
			/>
			<div class="text">{{ t('components.httpRequest-data.label') }}</div>
			<ParamList
				id="httpRequest-data"
				v-tip="t('components.httpRequest-data.tip')"
				:ref="registryRef(fieldEls, 'httpRequest-data')"
				v-model="form.data"
			/>
			<div class="text">{{ t('components.httpRequest-timeout.label') }}</div>
			<NumberBox
				:label="t('components.httpRequest-timeout.label')"
				id="httpRequest-timeout"
				:ref="registryRef(fieldEls, 'httpRequest-timeout')"
				v-tip="t('components.httpRequest-timeout.tip')"
				v-model="timeout"
			/>
			<div class="text">{{ t('components.httpRequest-responseType.label') }}</div>
			<SelectBox
				:label="t('components.httpRequest-responseType.label')"
				id="httpRequest-responseType"
				v-tip="t('components.httpRequest-responseType.tip')"
				:ref="registryRef(fieldEls, 'httpRequest-responseType')"
				v-model="form.responseType"
			/>
			<div class="text">{{ t('components.httpRequest-withCredentials.label') }}</div>
			<CheckBox
				class="standard"
				id="httpRequest-withCredentials"
				:ref="registryRef(fieldEls, 'httpRequest-withCredentials')"
				v-tip="t('components.httpRequest-withCredentials.tip')"
				v-model="withCredentials"
			/>
			<div class="text">{{ t('components.httpRequest-authUser.label') }}</div>
			<StringVar
				id="httpRequest-authUser"
				:ref="registryRef(fieldEls, 'httpRequest-authUser')"
				v-tip="t('components.httpRequest-authUser.tip')"
				v-model="form.authUser"
			/>
			<div class="text">{{ t('components.httpRequest-authPass.label') }}</div>
			<StringVar
				id="httpRequest-authPass"
				:ref="registryRef(fieldEls, 'httpRequest-authPass')"
				v-tip="t('components.httpRequest-authPass.tip')"
				v-model="form.authPass"
			/>
			<div class="text">{{ t('components.httpRequest-callback.label') }}</div>
			<CustomBox
				id="httpRequest-callback"
				:ref="registryRef(fieldEls, 'httpRequest-callback')"
				v-tip="t('components.httpRequest-callback.tip')"
				type="file"
				filter="event"
				v-model="form.callback"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHttpRequestCommandSchema } from '@app/composables/commands/useHttpRequestCommandSchema';
import { RequestkeyValueBind } from '@app/composables/commands/useRequestURLCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save } = useHttpRequestCommandSchema();

const timeout = computed({
	get: () => form.timeout as number | string,
	set: (value) => {
		form.timeout = value;
	}
});
const withCredentials = computed({
	get: () => form.withCredentials as boolean,
	set: (value) => {
		form.withCredentials = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('httpRequest-method')?.loadItems?.([
		{ name: 'GET', value: 'GET' },
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' },
		{ name: 'DELETE', value: 'DELETE' },
		{ name: 'PATCH', value: 'PATCH' }
	]);
	fieldEls.get('httpRequest-responseType')?.loadItems?.([
		{ name: 'JSON', value: 'json' },
		{ name: 'Text', value: 'text' },
		{ name: 'Blob', value: 'blob' },
		{ name: 'ArrayBuffer', value: 'arraybuffer' },
		{ name: 'Document', value: 'document' },
		{ name: 'Stream', value: 'stream' }
	]);
	fieldEls.get('httpRequest-header')?.bind?.(RequestkeyValueBind);
	fieldEls.get('httpRequest-data')?.bind?.(RequestkeyValueBind);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#httpRequest {
	width: 324px;
	height: 530px;
}

#httpRequest-header {
	height: 102px;
}

#httpRequest-data {
	height: 102px;
}

#httpRequest-confirm {
	right: 108px;
	bottom: 10px;
}

#httpRequest-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
