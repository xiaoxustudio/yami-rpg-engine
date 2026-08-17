<template>
	<!-- 变量访问器窗口 -->
	<WindowFrame ref="frame" id="variableGetter" @confirm="onConfirm">
		<template #title><TitleBar>Variable<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="variableGetter-type" /> <div class="text">Actor</div
				><CustomBox id="variableGetter-actor" type="actor" /> <div class="text">Skill</div
				><CustomBox id="variableGetter-skill" type="skill" /> <div class="text">State</div
				><CustomBox id="variableGetter-state" type="state" /> <div class="text">Equipment</div
				><CustomBox id="variableGetter-equipment" type="equipment" />
				<div class="text">Item</div><CustomBox id="variableGetter-item" type="item" />
				<div class="text">Element</div><CustomBox id="variableGetter-element" type="element" />
				<div class="text">Key</div><TextBox id="variableGetter-common-key" /> <div class="text">Key</div
				><SelectVar id="variableGetter-preset-key" /> <div class="text">Key</div
				><CustomBox id="variableGetter-global-key" type="global-variable" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import {
	useVariableGetterWindow,
	type VariableGetterForm
} from '@app/composables/useVariableGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const variableGetter = useVariableGetterWindow();
const form = variableGetter.form;

const setForm = (data: Partial<VariableGetterForm>): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		if (!(field in data)) continue;
		const control = document.getElementById(id) as
			| (HTMLElement & { write?: (value: unknown) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): VariableGetterForm => {
	const data = { ...form } as VariableGetterForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = document.getElementById(id) as
			| (HTMLElement & { read?: () => unknown })
			| null;
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const FIELD_BY_ID: Record<string, keyof VariableGetterForm> = {
	'variableGetter-type': 'type',
	'variableGetter-actor': 'actor',
	'variableGetter-skill': 'skill',
	'variableGetter-state': 'state',
	'variableGetter-equipment': 'equipment',
	'variableGetter-item': 'item',
	'variableGetter-element': 'element',
	'variableGetter-common-key': 'commonKey',
	'variableGetter-preset-key': 'presetKey',
	'variableGetter-global-key': 'globalKey'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	VariableGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => variableGetter.onWindowClosed());
	}
});
</script>
