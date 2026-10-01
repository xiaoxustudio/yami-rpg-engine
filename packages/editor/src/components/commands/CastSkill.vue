<template>
	<WindowFrame id="castSkill" :ref="registryRef(fieldEls, 'castSkill')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.castSkill.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.castSkill-actor.label') }}</div>
			<CustomBox
				id="castSkill-actor"
				:ref="registryRef(fieldEls, 'castSkill-actor')"
				v-tip="t('components.castSkill-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.castSkill-mode.label') }}</div>
			<SelectBox
				:label="t('components.castSkill-mode.label')"
				id="castSkill-mode"
				v-tip="t('components.castSkill-mode.tip')"
				:ref="registryRef(fieldEls, 'castSkill-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.castSkill-key.label') }}</div>
			<SelectBox
				:label="t('components.castSkill-key.label')"
				id="castSkill-key"
				v-tip="t('components.castSkill-key.tip')"
				:ref="registryRef(fieldEls, 'castSkill-key')"
				v-focus
				v-model="form.key"
			/>
			<div class="text">{{ t('components.castSkill-keyVar.label') }}</div>
			<StringVar
				id="castSkill-keyVar"
				v-tip="t('components.castSkill-keyVar.tip')"
				:ref="registryRef(fieldEls, 'castSkill-keyVar')"
				v-model="form.keyVar"
			/>
			<div class="text">{{ t('components.castSkill-skillId.label') }}</div>
			<CustomBox
				id="castSkill-skillId"
				v-tip="t('components.castSkill-skillId.tip')"
				:ref="registryRef(fieldEls, 'castSkill-skillId')"
				v-focus
				type="file"
				filter="skill"
				v-model="form.skillId"
			/>
			<div class="text">{{ t('components.castSkill-skill.label') }}</div>
			<CustomBox
				id="castSkill-skill"
				v-tip="t('components.castSkill-skill.tip')"
				:ref="registryRef(fieldEls, 'castSkill-skill')"
				type="skill"
				v-model="form.skill"
			/>
			<div class="text">{{ t('components.castSkill-wait.label') }}</div>
			<SelectBox
				:label="t('components.castSkill-wait.label')"
				id="castSkill-wait"
				:ref="registryRef(fieldEls, 'castSkill-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCastSkillCommandSchema } from '@app/composables/commands/useCastSkillCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useCastSkillCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('castSkill-mode', ['by-key', 'by-id', 'by-skill', 'by-variable'], (items) =>
		fieldEls.get('castSkill-mode')?.loadItems?.(items)
	);
	fieldEls
		.get('castSkill-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'by-key', targets: [fieldEls.get('castSkill-key')] },
			{ case: 'by-id', targets: [fieldEls.get('castSkill-skillId')] },
			{ case: 'by-skill', targets: [fieldEls.get('castSkill-skill')] },
			{ case: 'by-variable', targets: [fieldEls.get('castSkill-keyVar')] }
		]);
	useLocalizedOptions('castSkill-wait', [true, false], (items) =>
		fieldEls.get('castSkill-wait')?.loadItems?.(items)
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#castSkill {
	width: 324px;
	height: 196px;
}

#castSkill-confirm {
	right: 108px;
	bottom: 10px;
}

#castSkill-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
