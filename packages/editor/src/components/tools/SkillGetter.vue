<template>
	<!-- 技能访问器窗口 -->
	<WindowFrame ref="frame" id="skillGetter">
		<template #title><TitleBar>{{ t('components.skillGetter.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.skillGetter-type.label') }}</div><SelectBox id="skillGetter-type" /> <div class="text">{{ t('components.skillGetter-actor.label') }}</div
				><CustomBox id="skillGetter-actor" type="actor" /> <div class="text">{{ t('components.skillGetter-key.label') }}</div
				><SelectVar id="skillGetter-key" /> <div class="text">{{ t('components.skillGetter-skillId.label') }}</div
				><CustomBox id="skillGetter-skillId" type="file" filter="skill" />
				<div class="text">{{ t('components.skillGetter-variable.label') }}</div
				><CustomBox id="skillGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSkillGetterWindow, type SkillGetterForm } from '@app/composables/useSkillGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const skillGetter = useSkillGetterWindow();
const form = skillGetter.form;

const setForm = (data: Partial<SkillGetterForm>): void => {
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

const getForm = (): SkillGetterForm => {
	const data = { ...form } as SkillGetterForm;
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

const FIELD_BY_ID: Record<string, keyof SkillGetterForm> = {
	'skillGetter-type': 'type',
	'skillGetter-actor': 'actor',
	'skillGetter-key': 'key',
	'skillGetter-skillId': 'skillId',
	'skillGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => skillGetter.onWindowClosed());
	}


});
</script>
