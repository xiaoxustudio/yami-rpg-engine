<template>
	<WindowFrame id="setSkill" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setSkill.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setSkill-skill.label') }}</div>
			<CustomBox id="setSkill-skill"
				v-tip="t('components.setSkill-skill.tip')" v-focus type="skill" v-model="form.skill" />
			<div class="text">{{ t('components.setSkill-operation.label') }}</div>
			<SelectBox id="setSkill-operation"
				v-tip="t('components.setSkill-operation.tip')"
				:ref="registryRef(fieldEls, 'setSkill-operation')" v-model="form.operation" />
			<div class="text">{{ t('components.setSkill-cooldown.label') }}</div>
			<NumberVar
				id="setSkill-cooldown"
				v-tip="t('components.setSkill-cooldown.tip')"
				min="1"
				max="3600000"
				unit="ms"
				v-model="form.cooldown"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetSkillCommandSchema } from '@app/composables/commands/useSetSkillCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetSkillCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setSkill-operation')?.loadItems?.([
		{ name: 'Set Cooldown Time', value: 'set-cooldown' },
		{ name: 'Increase Cooldown Time', value: 'increase-cooldown' },
		{ name: 'Decrease Cooldown Time', value: 'decrease-cooldown' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setSkill {
	width: 324px;
	height: 146px;
}

#setSkill-confirm {
	right: 108px;
	bottom: 10px;
}

#setSkill-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
