<template>
	<WindowFrame id="castSkill" :ref="controlRef('castSkill')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.castSkill.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.castSkill-actor.label') }}</div>
			<CustomBox
				id="castSkill-actor"
				:ref="controlRef('castSkill-actor')"
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
				:ref="controlRef('castSkill-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.castSkill-key.label') }}</div>
			<SelectBox
				:label="t('components.castSkill-key.label')"
				id="castSkill-key"
				v-tip="t('components.castSkill-key.tip')"
				:ref="controlRef('castSkill-key')"
				v-focus
				v-model="form.key"
			/>
			<div class="text">{{ t('components.castSkill-keyVar.label') }}</div>
			<StringVar
				id="castSkill-keyVar"
				v-tip="t('components.castSkill-keyVar.tip')"
				:ref="controlRef('castSkill-keyVar')"
				v-model="form.keyVar"
			/>
			<div class="text">{{ t('components.castSkill-skillId.label') }}</div>
			<CustomBox
				id="castSkill-skillId"
				v-tip="t('components.castSkill-skillId.tip')"
				:ref="controlRef('castSkill-skillId')"
				v-focus
				type="file"
				filter="skill"
				v-model="form.skillId"
			/>
			<div class="text">{{ t('components.castSkill-skill.label') }}</div>
			<CustomBox
				id="castSkill-skill"
				v-tip="t('components.castSkill-skill.tip')"
				:ref="controlRef('castSkill-skill')"
				type="skill"
				v-model="form.skill"
			/>
			<div class="text">{{ t('components.castSkill-wait.label') }}</div>
			<SelectBox
				:label="t('components.castSkill-wait.label')"
				id="castSkill-wait"
				:ref="controlRef('castSkill-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCastSkillCommandSchema } from '@app/composables/commands/useCastSkillCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	provideCastSkillBridge,
	resetCastSkillBridge,
	type CastSkillBridge
} from '@app/composables/cast-skill-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'castSkill-actor'
	| 'castSkill-key'
	| 'castSkill-keyVar'
	| 'castSkill-mode'
	| 'castSkill-skill'
	| 'castSkill-skillId'
	| 'castSkill-wait'
	| 'castSkill';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useCastSkillCommandSchema();

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入时要候选项，但 schema 不该知道控件 id。 */
const bridgeApi: CastSkillBridge = {
	loadItems: (items) => {
		controls['castSkill-key']?.loadItems?.(items);
	}
};

onMounted(() => {
	provideCastSkillBridge(bridgeApi);
	onUnmounted(() => resetCastSkillBridge(bridgeApi));
	useLocalizedOptions('castSkill-mode', ['by-key', 'by-id', 'by-skill', 'by-variable'], (items) =>
		controls['castSkill-mode']?.loadItems?.(items)
	);
	controls['castSkill-mode']?.enableHiddenMode?.();
	controls['castSkill-mode']?.relate?.([
		{ case: 'by-key', targets: [controlRoot(controls['castSkill-key'])] },
		{ case: 'by-id', targets: [controlRoot(controls['castSkill-skillId'])] },
		{ case: 'by-skill', targets: [controlRoot(controls['castSkill-skill'])] },
		{ case: 'by-variable', targets: [controlRoot(controls['castSkill-keyVar'])] }
	]);
	useLocalizedOptions('castSkill-wait', [true, false], (items) =>
		controls['castSkill-wait']?.loadItems?.(items)
	);
});
</script>

<style>
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
