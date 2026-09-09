<template>
	<!-- 技能访问器窗口 -->
	<WindowFrame ref="frame" id="skillGetter">
		<template #title
			><TitleBar
				>{{ t('components.skillGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.skillGetter-type.label') }}</div>
			<SelectBox id="skillGetter-type" v-focus v-model="form.type" />
			<div class="text">{{ t('components.skillGetter-actor.label') }}</div>
			<CustomBox id="skillGetter-actor" type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.skillGetter-key.label') }}</div>
			<SelectVar id="skillGetter-key" v-focus v-model="form.key" />
			<div class="text">{{ t('components.skillGetter-skillId.label') }}</div>
			<CustomBox
				id="skillGetter-skillId"
				v-focus
				type="file"
				filter="skill"
				v-model="form.skillId"
			/>
			<div class="text">{{ t('components.skillGetter-variable.label') }}</div>
			<CustomBox
				id="skillGetter-variable"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSkillGetterWindow } from '@app/composables/useSkillGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const skillGetter = useSkillGetterWindow();
const form = skillGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => skillGetter.onWindowClosed());
	}
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#skillGetter {
	width: 324px;
	height: 146px;
}

#skillGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#skillGetter-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
