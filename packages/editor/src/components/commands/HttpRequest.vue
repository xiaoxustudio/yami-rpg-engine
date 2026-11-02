<template>
	<WindowFrame id="httpRequest" :ref="controlRef('httpRequest')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.httpRequest.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.httpRequest-url.label') }}</div>
			<StringVar
				id="httpRequest-url"
				:ref="controlRef('httpRequest-url')"
				v-tip="t('components.httpRequest-url.tip')"
				v-focus
				v-model="form.url"
			/>
			<div class="text">{{ t('components.httpRequest-method.label') }}</div>
			<SelectBox
				:label="t('components.httpRequest-method.label')"
				id="httpRequest-method"
				v-tip="t('components.httpRequest-method.tip')"
				:ref="controlRef('httpRequest-method')"
				v-model="form.method"
			/>
			<div class="text">{{ t('components.httpRequest-header.label') }}</div>
			<ParamList
				id="httpRequest-header"
				v-tip="t('components.httpRequest-header.tip')"
				:ref="controlRef('httpRequest-header')"
				v-model="form.headers"
			/>
			<div class="text">{{ t('components.httpRequest-data.label') }}</div>
			<ParamList
				id="httpRequest-data"
				v-tip="t('components.httpRequest-data.tip')"
				:ref="controlRef('httpRequest-data')"
				v-model="form.data"
			/>
			<div class="text">{{ t('components.httpRequest-timeout.label') }}</div>
			<NumberBox
				:label="t('components.httpRequest-timeout.label')"
				id="httpRequest-timeout"
				:ref="controlRef('httpRequest-timeout')"
				v-tip="t('components.httpRequest-timeout.tip')"
				v-model="timeout"
			/>
			<div class="text">{{ t('components.httpRequest-responseType.label') }}</div>
			<SelectBox
				:label="t('components.httpRequest-responseType.label')"
				id="httpRequest-responseType"
				v-tip="t('components.httpRequest-responseType.tip')"
				:ref="controlRef('httpRequest-responseType')"
				v-model="form.responseType"
			/>
			<div class="text">{{ t('components.httpRequest-withCredentials.label') }}</div>
			<CheckBox
				class="standard"
				id="httpRequest-withCredentials"
				:ref="controlRef('httpRequest-withCredentials')"
				v-tip="t('components.httpRequest-withCredentials.tip')"
				v-model="withCredentials"
			/>
			<div class="text">{{ t('components.httpRequest-authUser.label') }}</div>
			<StringVar
				id="httpRequest-authUser"
				:ref="controlRef('httpRequest-authUser')"
				v-tip="t('components.httpRequest-authUser.tip')"
				v-model="form.authUser"
			/>
			<div class="text">{{ t('components.httpRequest-authPass.label') }}</div>
			<StringVar
				id="httpRequest-authPass"
				:ref="controlRef('httpRequest-authPass')"
				v-tip="t('components.httpRequest-authPass.tip')"
				v-model="form.authPass"
			/>
			<div class="text">{{ t('components.httpRequest-callback.label') }}</div>
			<CustomBox
				id="httpRequest-callback"
				:ref="controlRef('httpRequest-callback')"
				v-tip="t('components.httpRequest-callback.tip')"
				type="file"
				filter="event"
				v-model="form.callback"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
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
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'httpRequest'
	| 'httpRequest-authPass'
	| 'httpRequest-authUser'
	| 'httpRequest-callback'
	| 'httpRequest-data'
	| 'httpRequest-header'
	| 'httpRequest-method'
	| 'httpRequest-responseType'
	| 'httpRequest-timeout'
	| 'httpRequest-url'
	| 'httpRequest-withCredentials';

const { controls, controlRef } = useControlRefs<Id>();

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
	controls['httpRequest-method']?.loadItems?.([
		{ name: 'GET', value: 'GET' },
		{ name: 'POST', value: 'POST' },
		{ name: 'PUT', value: 'PUT' },
		{ name: 'DELETE', value: 'DELETE' },
		{ name: 'PATCH', value: 'PATCH' }
	]);
	controls['httpRequest-responseType']?.loadItems?.([
		{ name: 'JSON', value: 'json' },
		{ name: 'Text', value: 'text' },
		{ name: 'Blob', value: 'blob' },
		{ name: 'ArrayBuffer', value: 'arraybuffer' },
		{ name: 'Document', value: 'document' },
		{ name: 'Stream', value: 'stream' }
	]);
	controls['httpRequest-header']?.bind?.(RequestkeyValueBind);
	controls['httpRequest-data']?.bind?.(RequestkeyValueBind);
});
</script>

<style>
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
