<template>
	<WindowFrame id="fileActor-skill" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fileActor-skill.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fileActor-skill-id.label') }}</div>
			<CustomBox id="fileActor-skill-id"
				v-tip="t('components.fileActor-skill-id.tip')" v-focus type="file" filter="skill" v-model="form.id" />
			<div class="text">{{ t('components.fileActor-skill-key.label') }}</div>
			<SelectBox id="fileActor-skill-key"
				v-tip="t('components.fileActor-skill-key.tip')"
				:ref="registryRef(inspectorEls, 'fileActor-skill-key')" v-model="form.key" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
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

onMounted(() => {});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
