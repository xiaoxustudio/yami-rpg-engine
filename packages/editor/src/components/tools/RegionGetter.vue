<template>
		<WindowFrame ref="frame" id="regionGetter" @confirm="onConfirm">
		<template #title><TitleBar>Region<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="regionGetter-type" v-model="form.type" /> <div class="text">Region</div
				><CustomBox
					id="regionGetter-presetId"
					:model-value="form.presetId"
					type="preset-object"
					filter="region"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RegionGetter } from '@app/legacy/command/region-accessor-window.ts';
import {
	useRegionGetterWindow,
	type RegionGetterForm
} from '@app/composables/useRegionGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const regionGetter = useRegionGetterWindow();
const form = regionGetter.form;

const FIELD_BY_ID: Record<string, keyof RegionGetterForm> = {
	'regionGetter-type': 'type',
	'regionGetter-presetId': 'presetId'
};

const setForm = (data: Partial<RegionGetterForm>): void => {
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

const getForm = (): RegionGetterForm => {
	const data = { ...form } as RegionGetterForm;
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

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	RegionGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => regionGetter.onWindowClosed());
	}


});
</script>
