<template>
	<WindowFrame id="fileActor-skill" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.fileActor-skill.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.fileActor-skill-id.label') }}</div
				><CustomBox id="fileActor-skill-id" type="file" filter="skill" v-model="form.id" />
				<div class="text">{{ t('components.fileActor-skill-key.label') }}</div><SelectBox id="fileActor-skill-key" v-model="form.key" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { fileActorSkillForm } from '@app/inspector/file-actor-page.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = fileActorSkillForm;

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Inspector?.fileActor?.skills?.save?.();
};

onMounted(() => {


});
</script>
