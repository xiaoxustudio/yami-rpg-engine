<template>
		<WindowFrame ref="frame" id="positionGetter" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.positionGetter.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.positionGetter-type.label') }}</div><SelectBox id="positionGetter-type" /> <div class="text">{{ t('components.positionGetter-common-x.label') }}</div
				><NumberVar
					id="positionGetter-common-x"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				/>
				<div class="text">{{ t('components.positionGetter-common-y.label') }}</div
				><NumberVar
					id="positionGetter-common-y"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				/>
				<div class="text">{{ t('components.positionGetter-actor.label') }}</div><CustomBox id="positionGetter-actor" type="actor" />
				<div class="text">{{ t('components.positionGetter-trigger.label') }}</div><CustomBox id="positionGetter-trigger" type="trigger" />
				<div class="text">{{ t('components.positionGetter-light.label') }}</div><CustomBox id="positionGetter-light" type="light" />
				<div class="text">{{ t('components.positionGetter-region.label') }}</div><CustomBox id="positionGetter-region" type="region" />
				<div class="text">{{ t('components.positionGetter-region-mode.label') }}</div><SelectBox id="positionGetter-region-mode" />
				<div class="text">{{ t('components.positionGetter-objectId.label') }}</div
				><CustomBox
					id="positionGetter-objectId"
					type="preset-object"
					filter="any"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { PositionGetter } from '@app/commands/accessors/position-accessor-window.ts';
import {
	usePositionGetterWindow,
	type PositionGetterForm
} from '@app/composables/usePositionGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const positionGetter = usePositionGetterWindow();
const form = positionGetter.form;

const setForm = (data: Partial<PositionGetterForm>): void => {
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

const getForm = (): PositionGetterForm => {
	const data = { ...form } as PositionGetterForm;
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

const FIELD_BY_ID: Record<string, keyof PositionGetterForm> = {
	'positionGetter-type': 'type',
	'positionGetter-common-x': 'x',
	'positionGetter-common-y': 'y',
	'positionGetter-actor': 'actor',
	'positionGetter-trigger': 'trigger',
	'positionGetter-light': 'light',
	'positionGetter-region': 'region',
	'positionGetter-region-mode': 'mode',
	'positionGetter-objectId': 'objectId'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	PositionGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => positionGetter.onWindowClosed());
	}


});
</script>
