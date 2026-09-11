<template>
	<!-- 技能访问器窗口 -->
	<WindowFrame ref="frame" id="skillGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.skillGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.skillGetter-type.label') }}</div>
			<SelectBox id="skillGetter-type"
				:ref="fieldRef('skillGetter-type')" v-focus v-model="form.type" />
			<div class="text">{{ t('components.skillGetter-actor.label') }}</div>
			<CustomBox id="skillGetter-actor"
				:ref="fieldRef('skillGetter-actor')" type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.skillGetter-key.label') }}</div>
			<SelectVar id="skillGetter-key"
				:ref="fieldRef('skillGetter-key')" v-focus v-model="form.key" />
			<div class="text">{{ t('components.skillGetter-skillId.label') }}</div>
			<CustomBox
				id="skillGetter-skillId"
				:ref="fieldRef('skillGetter-skillId')"
				v-focus
				type="file"
				filter="skill"
				v-model="form.skillId"
			/>
			<div class="text">{{ t('components.skillGetter-variable.label') }}</div>
			<CustomBox
				id="skillGetter-variable"
				:ref="fieldRef('skillGetter-variable')"
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
import { SkillGetter } from '@app/commands/accessors/skill-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
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

// P5b 批次 2：把控件实例登记给访问器模块的 initialize()（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
SkillGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	SkillGetter?.confirm?.(new Event('click'));
};

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
