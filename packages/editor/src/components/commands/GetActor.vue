<template>
<WindowFrame ref="frame" id="getActor" @confirm="onConfirm">
	<template #title><TitleBar>Get Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Write to Variable</div
			><CustomBox
				id="getActor-variable"
				type="variable"
				filter="object"
				:model-value="form.variable"
			/><div class="text">Position</div
			><CustomBox id="getActor-position" type="position" :model-value="form.position" /><div class="text">Area</div
			><SelectBox id="getActor-area" :model-value="form.area" /><div class="text">Size</div
			><NumberVar
				id="getActor-size"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				:model-value="form.size"
			/><div class="text">Radius</div
			><NumberVar
				id="getActor-radius"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
				:model-value="form.radius"
			 /><div class="text">Selector</div
			><SelectBox id="getActor-selector" :model-value="form.selector" /><div class="text">Team</div
			><SelectVar id="getActor-teamId" :model-value="form.teamId" /><div class="text">Condition</div
			><SelectBox id="getActor-condition" :model-value="form.condition" /><div class="text">Attribute</div
			><SelectBox id="getActor-attribute" :model-value="form.attribute" /><div class="text">Attribute 2</div
			><SelectBox id="getActor-divisor" :model-value="form.divisor" /><div class="text">Activation</div
			><SelectBox id="getActor-activation" :model-value="form.activation" /><div class="text">Exclusion</div
			><SelectBox id="getActor-exclusion" :model-value="form.exclusion" /><div class="text">Exclusion Actor</div
			><CustomBox
				id="getActor-exclusionActor"
				type="actor"
				:model-value="form.exclusionActor"
			/><div class="text">Exclusion Team</div
			><SelectVar id="getActor-exclusionTeamId" :model-value="form.exclusionTeamId" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Command } from '@/command/command-object.ts';
import type { GetActorForm } from '@/module/command/getActor.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const form = reactive<GetActorForm>({
	variable: { type: 'local', key: '' },
	position: { type: 'absolute', x: 0, y: 0 },
	area: 'square',
	size: 1,
	radius: 0.5,
	selector: 'enemy',
	teamId: '',
	condition: 'nearest',
	attribute: '',
	divisor: '',
	activation: 'active',
	exclusion: 'none',
	exclusionActor: { type: 'trigger' },
	exclusionTeamId: ''
});

const setForm = (data: Partial<GetActorForm>): void => {
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

const getForm = (): GetActorForm => {
	const data = { ...form } as GetActorForm;
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

const FIELD_BY_ID: Record<string, keyof GetActorForm> = {
	'getActor-variable': 'variable',
	'getActor-position': 'position',
	'getActor-area': 'area',
	'getActor-size': 'size',
	'getActor-radius': 'radius',
	'getActor-selector': 'selector',
	'getActor-teamId': 'teamId',
	'getActor-condition': 'condition',
	'getActor-attribute': 'attribute',
	'getActor-divisor': 'divisor',
	'getActor-activation': 'activation',
	'getActor-exclusion': 'exclusion',
	'getActor-exclusionActor': 'exclusionActor',
	'getActor-exclusionTeamId': 'exclusionTeamId'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.getActor?.save?.();
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
