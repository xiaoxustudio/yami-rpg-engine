<template>
	<WindowFrame ref="frame" id="setList" @confirm="onConfirm">
		<template #title><TitleBar>Set List<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="setList-variable"
					type="variable"
					filter="object"
					:model-value="form.variable"
				/>
				<div class="text">Operation</div
				><SelectBox id="setList-operation" :model-value="form.operation" />
				<div class="text">Numbers</div
				><CustomBox
					id="setList-numbers"
					type="array"
					filter="number"
					:model-value="form.numbers"
				/>
				<div class="text">Strings</div
				><CustomBox
					id="setList-strings"
					type="array"
					filter="string"
					:model-value="form.strings"
				/>
				<div class="text">Index</div
				><NumberVar
					id="setList-index"
					min="0"
					max="1000000000"
					:model-value="form.index"
				/>
				<div class="text">Boolean</div
				><SelectBox id="setList-boolean" :model-value="form.boolean" /> <div class="text">Number</div
				><NumberBox
					id="setList-number"
					min="-1000000000"
					max="1000000000"
					decimals="10"
					:model-value="form.number"
				/>
				<div class="text">String</div
				><TextArea id="setList-string" :model-value="form.string" /> <div class="text">Variable</div
				><CustomBox
					id="setList-operand"
					type="variable"
					filter="all"
					:model-value="form.operand"
				/>
				<div class="text">Separator</div
				><TextAreaVar id="setList-separator" :model-value="form.separator" />
				<div class="text">Attribute Group</div
				><CustomBox
					id="setList-attribute-groupId"
					type="attribute-group"
					:model-value="form.attributeGroupId"
				/>
				<div class="text">Enum Group</div
				><CustomBox
					id="setList-enum-groupId"
					type="enum-group"
					:model-value="form.enumGroupId"
				/> <div class="text">Actor</div
				><CustomBox id="setList-actor" type="actor" :model-value="form.actor" /> <div class="text">Default</div
				><CheckBox
					id="setList-index-skip-check"
					class="standard"
					:model-value="form.indexSkipCheck"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Command } from '@/command/command-object.ts';
import type { SetListForm } from '@/module/command/setList.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const form = reactive<SetListForm>({
	variable: { type: 'local', key: '' },
	operation: 'set-empty',
	numbers: [],
	strings: [],
	index: 0,
	boolean: false,
	number: 0,
	string: '',
	operand: { type: 'local', key: '' },
	separator: '',
	attributeGroupId: '',
	enumGroupId: '',
	actor: { type: 'trigger' },
	indexSkipCheck: true
});

const setForm = (data: Partial<SetListForm>): void => {
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

const getForm = (): SetListForm => {
	const data = { ...form } as SetListForm;
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

const FIELD_BY_ID: Record<string, keyof SetListForm> = {
	'setList-variable': 'variable',
	'setList-operation': 'operation',
	'setList-numbers': 'numbers',
	'setList-strings': 'strings',
	'setList-index': 'index',
	'setList-boolean': 'boolean',
	'setList-number': 'number',
	'setList-string': 'string',
	'setList-operand': 'operand',
	'setList-separator': 'separator',
	'setList-attribute-groupId': 'attributeGroupId',
	'setList-enum-groupId': 'enumGroupId',
	'setList-actor': 'actor',
	'setList-index-skip-check': 'indexSkipCheck'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.setList?.save?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
	inspector.syncState();
	local.syncState();
});
</script>
