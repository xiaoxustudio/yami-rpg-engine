<template>
	<!-- 瓦片地图访问器窗口 -->
	<WindowFrame ref="frame" id="tilemapGetter">
		<template #title><TitleBar>{{ t('components.tilemapGetter.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.tilemapGetter-type.label') }}</div><SelectBox id="tilemapGetter-type" /> <div class="text">{{ t('components.tilemapGetter-presetId.label') }}</div
				><CustomBox
					id="tilemapGetter-presetId"
					type="preset-object"
					filter="tilemap"
				/>
				<div class="text">{{ t('components.tilemapGetter-variable.label') }}</div
				><CustomBox id="tilemapGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	useTilemapGetterWindow,
	type TilemapGetterForm
} from '@app/composables/useTilemapGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const tilemapGetter = useTilemapGetterWindow();
const form = tilemapGetter.form;

const setForm = (data: Partial<TilemapGetterForm>): void => {
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

const getForm = (): TilemapGetterForm => {
	const data = { ...form } as TilemapGetterForm;
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

const FIELD_BY_ID: Record<string, keyof TilemapGetterForm> = {
	'tilemapGetter-type': 'type',
	'tilemapGetter-presetId': 'presetId',
	'tilemapGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => tilemapGetter.onWindowClosed());
	}


});
</script>
