<template>
	<WindowFrame ref="frame" id="angleGetter" @confirm="onConfirm">
		<template #title><TitleBar>Angle<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="angleGetter-type" /> <div class="text">Position</div
				><CustomBox id="angleGetter-position-position" type="position" />
				<div class="text">Degrees</div
				><NumberVar
					id="angleGetter-common-degrees"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AngleGetter } from '@/command/angle-accessor-window.ts';
import {
	useAngleGetterWindow,
	type AngleGetterForm
} from '@app/composables/useAngleGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const angleGetter = useAngleGetterWindow();
const form = angleGetter.form;

const setForm = (data: Partial<AngleGetterForm>): void => {
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

const getForm = (): AngleGetterForm => {
	const data = { ...form } as AngleGetterForm;
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

const FIELD_BY_ID: Record<string, keyof AngleGetterForm> = {
	'angleGetter-type': 'type',
	'angleGetter-position-position': 'position',
	'angleGetter-common-degrees': 'degrees'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	AngleGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => angleGetter.onWindowClosed());
	}


});
</script>
