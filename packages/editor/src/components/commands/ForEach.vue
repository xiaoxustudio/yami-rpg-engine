<template>
<WindowFrame ref="frame" id="forEach" @confirm="onConfirm">
	<template #title><TitleBar>For Each<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Data</div
			><SelectBox id="forEach-data" :model-value="form.data" /> <div class="text">List Variable</div
			><CustomBox
				id="forEach-list"
				type="variable"
				filter="object"
				:model-value="form.list"
			/>
			<div class="text">Actor</div
			><CustomBox id="forEach-actor" type="actor" :model-value="form.actor" />
			<div class="text">Parent Element</div
			><CustomBox id="forEach-element" type="element" :model-value="form.element" />
			<div class="text">Attribute Group</div
			><CustomBox
				id="forEach-attribute-groupId"
				type="attribute-group"
				:model-value="form.attributeGroupId"
			/>
			<div class="text">Enum Group</div
			><CustomBox
				id="forEach-enum-groupId"
				type="enum-group"
				:model-value="form.enumGroupId"
			/>
			<div class="text">Write to Variable</div
			><CustomBox
				id="forEach-variable"
				type="variable"
				filter="object"
				:model-value="form.variable"
			/>
			<div class="text">Write Save Index</div
			><CustomBox
				id="forEach-saveIndex"
				type="variable"
				filter="number"
				:model-value="form.saveIndex"
			/>
			<div class="text">Touch Id</div
			><CustomBox
				id="forEach-touchId"
				type="variable"
				filter="number"
				:model-value="form.touchId"
			/>
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalStore } from '@app/stores/local';
import { onMounted, reactive, ref } from 'vue';
import { Command } from '@/command/command-object.ts';
import type { ForEachForm } from '@/module/command/forEach.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { attachElementApi } from '@/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const form = reactive<ForEachForm>({
	data: 'list',
	list: { type: 'local', key: '' },
	actor: { type: 'trigger' },
	element: { type: 'trigger' },
	attributeGroupId: '',
	enumGroupId: '',
	variable: { type: 'local', key: '' },
	saveIndex: { type: 'local', key: '' },
	touchId: { type: 'local', key: '' }
});

const setForm = (data: Partial<ForEachForm>): void => {
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

const getForm = (): ForEachForm => {
	const data = { ...form } as ForEachForm;
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

const FIELD_BY_ID: Record<string, keyof ForEachForm> = {
	'forEach-data': 'data',
	'forEach-list': 'list',
	'forEach-actor': 'actor',
	'forEach-element': 'element',
	'forEach-attribute-groupId': 'attributeGroupId',
	'forEach-enum-groupId': 'enumGroupId',
	'forEach-variable': 'variable',
	'forEach-saveIndex': 'saveIndex',
	'forEach-touchId': 'touchId'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.forEach?.save?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}


});
</script>
