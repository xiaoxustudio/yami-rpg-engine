<template>
	<WindowFrame ref="frame" id="itemGetter" @confirm="onConfirm">
		<template #title><TitleBar>Actor<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="itemGetter-type" /> <div class="text">Actor</div
				><CustomBox id="itemGetter-actor" type="actor" /> <div class="text">Shortcut Key</div
				><SelectVar id="itemGetter-key" /> <div class="text">Item</div
				><CustomBox id="itemGetter-itemId" type="file" filter="item" />
				<div class="text">Variable</div
				><CustomBox id="itemGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ItemGetter } from '@app/legacy/command/item-accessor-window.ts';
import { useItemGetterWindow, type ItemGetterForm } from '@app/composables/useItemGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const itemGetter = useItemGetterWindow();
const form = itemGetter.form;

const setForm = (data: Partial<ItemGetterForm>): void => {
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

const getForm = (): ItemGetterForm => {
	const data = { ...form } as ItemGetterForm;
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

const FIELD_BY_ID: Record<string, keyof ItemGetterForm> = {
	'itemGetter-type': 'type',
	'itemGetter-actor': 'actor',
	'itemGetter-key': 'key',
	'itemGetter-itemId': 'itemId',
	'itemGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	ItemGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => itemGetter.onWindowClosed());
	}


});
</script>
