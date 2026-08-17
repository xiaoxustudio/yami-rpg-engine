<template>
	<!-- 状态访问器窗口 -->
	<WindowFrame ref="frame" id="stateGetter">
		<template #title><TitleBar>Actor<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="stateGetter-type" /> <div class="text">Actor</div
				><CustomBox id="stateGetter-actor" type="actor" /> <div class="text">State</div
				><CustomBox id="stateGetter-stateId" type="file" filter="state" />
				<div class="text">Variable</div
				><CustomBox id="stateGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useStateGetterWindow, type StateGetterForm } from '@app/composables/useStateGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const stateGetter = useStateGetterWindow();
const form = stateGetter.form;

const setForm = (data: Partial<StateGetterForm>): void => {
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

const getForm = (): StateGetterForm => {
	const data = { ...form } as StateGetterForm;
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

const FIELD_BY_ID: Record<string, keyof StateGetterForm> = {
	'stateGetter-type': 'type',
	'stateGetter-actor': 'actor',
	'stateGetter-stateId': 'stateId',
	'stateGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => stateGetter.onWindowClosed());
	}


});
</script>
