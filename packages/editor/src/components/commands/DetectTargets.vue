<template>
	<WindowFrame id="detectTargets" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.detectTargets.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="detectTargets-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Distance</div>
			<NumberVar
				id="detectTargets-distance"
				v-focus
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.distance"
			/>
			<div class="text">Selector</div>
			<SelectBox id="detectTargets-selector" v-model="form.selector" />
			<div class="text">In Sight</div>
			<SelectBox id="detectTargets-inSight" v-model="form.inSight" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDetectTargetsCommandSchema } from '@app/composables/commands/useDetectTargetsCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#detectTargets-selector')?.loadItems?.([
		{ name: 'Enemy', value: 'enemy' },
		{ name: 'Friend', value: 'friend' },
		{ name: 'Team Member', value: 'team' },
		{ name: 'Team Member Except Self', value: 'team-except-self' },
		{ name: 'Any Except Self', value: 'any-except-self' },
		{ name: 'Any', value: 'any' }
	]);
	$('#detectTargets-inSight')?.loadItems?.([
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
