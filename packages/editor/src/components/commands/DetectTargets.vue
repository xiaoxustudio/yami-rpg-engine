<template>
	<WindowFrame id="detectTargets"
				:ref="registryRef(fieldEls, 'detectTargets')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.detectTargets.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.detectTargets-actor.label') }}</div>
			<CustomBox id="detectTargets-actor"
				:ref="registryRef(fieldEls, 'detectTargets-actor')"
				v-tip="t('components.detectTargets-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.detectTargets-distance.label') }}</div>
			<NumberVar
				id="detectTargets-distance"
				:ref="registryRef(fieldEls, 'detectTargets-distance')"
				v-tip="t('components.detectTargets-distance.tip')"
				v-focus
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.distance"
			/>
			<div class="text">{{ t('components.detectTargets-selector.label') }}</div>
			<SelectBox id="detectTargets-selector"
				v-tip="t('components.detectTargets-selector.tip')"
				:ref="registryRef(fieldEls, 'detectTargets-selector')" v-model="form.selector" />
			<div class="text">{{ t('components.detectTargets-inSight.label') }}</div>
			<SelectBox id="detectTargets-inSight"
				v-tip="t('components.detectTargets-inSight.tip')"
				:ref="registryRef(fieldEls, 'detectTargets-inSight')" v-model="form.inSight" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDetectTargetsCommandSchema } from '@app/composables/commands/useDetectTargetsCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useDetectTargetsCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('detectTargets-selector')?.loadItems?.([
		{ name: 'Enemy', value: 'enemy' },
		{ name: 'Friend', value: 'friend' },
		{ name: 'Team Member', value: 'team' },
		{ name: 'Team Member Except Self', value: 'team-except-self' },
		{ name: 'Any Except Self', value: 'any-except-self' },
		{ name: 'Any', value: 'any' }
	]);
	fieldEls.get('detectTargets-inSight')?.loadItems?.([
		{ name: 'Enabled', value: true },
		{ name: 'Disabled', value: false }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#detectTargets {
	width: 324px;
	height: 170px;
}

#detectTargets-confirm {
	right: 108px;
	bottom: 10px;
}

#detectTargets-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
