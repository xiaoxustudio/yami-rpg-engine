<template>
	<WindowFrame id="fileActor-skill" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fileActor-skill.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fileActor-skill-id.label') }}</div>
			<CustomBox
				id="fileActor-skill-id"
				v-tip="t('components.fileActor-skill-id.tip')"
				v-focus
				type="file"
				filter="skill"
				v-model="form.id"
			/>
			<div class="text">{{ t('components.fileActor-skill-key.label') }}</div>
			<SelectBox
				:label="t('components.fileActor-skill-key.label')"
				id="fileActor-skill-key"
				v-tip="t('components.fileActor-skill-key.tip')"
				ref="skillKeyRef"
				v-model="form.key"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	provideFileActorSkill,
	resetFileActorSkill,
	type FileActorSkillApi
} from '@app/composables/file-actor-tool-bridges';
import { Inspector } from '@app/inspector/inspector.ts';
import { fileActorSkillForm } from '@app/inspector/file-actor-page.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = fileActorSkillForm;

const onConfirm = () => {
	Inspector?.fileActor?.skills?.save?.();
};

/** 这个窗口只负责一件事：给单例把候选项灌进控件。 */
const skillKeyRef = ref<InstanceType<typeof SelectBox> | null>(null);

const bridgeApi: FileActorSkillApi = {
	loadKeys: (items) => {
		skillKeyRef.value?.loadItems(items);
	}
};

onMounted(() => {
	provideFileActorSkill(bridgeApi);
	onUnmounted(() => resetFileActorSkill(bridgeApi));
});
</script>

<style>
#fileActor-skill {
	width: 324px;
	height: 122px;
}

#fileActor-skill-confirm {
	right: 108px;
	bottom: 10px;
}

#fileActor-skill-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
