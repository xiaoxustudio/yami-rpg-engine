<template>
	<WindowFrame ref="frame" id="actorGetter" @confirm="onConfirm">
		<template #title><TitleBar>Actor<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="actorGetter-type" /> <div class="text">Member ID</div
				><NumberVar id="actorGetter-memberId" min="0" max="10000" />
				<div class="text">Actor</div
				><CustomBox id="actorGetter-actorId" type="file" filter="actor" />
				<div class="text">Data ID</div
				><CustomBox id="actorGetter-presetId" type="preset-object" filter="actor" />
				<div class="text">Variable</div
				><CustomBox id="actorGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ActorGetter } from '@/command/actor-accessor-window.ts';
import { useActorGetterWindow, type ActorGetterForm } from '@app/composables/useActorGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const actorGetter = useActorGetterWindow();
const form = actorGetter.form;

const setForm = (data: Partial<ActorGetterForm>): void => {
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

const getForm = (): ActorGetterForm => {
	const data = { ...form } as ActorGetterForm;
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

const FIELD_BY_ID: Record<string, keyof ActorGetterForm> = {
	'actorGetter-type': 'type',
	'actorGetter-memberId': 'memberId',
	'actorGetter-actorId': 'actorId',
	'actorGetter-presetId': 'presetId',
	'actorGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	ActorGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => actorGetter.onWindowClosed());
	}


});
</script>
