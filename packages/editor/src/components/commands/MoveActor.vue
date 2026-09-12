<template>
	<WindowFrame id="moveActor" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.moveActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="moveActor-actor"
				v-tip="t('components.moveActor-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">Mode</div>
			<SelectBox id="moveActor-mode"
				v-tip="t('components.moveActor-mode.tip')"
				:ref="registryRef(fieldEls, 'moveActor-mode')" v-model="form.mode" />
			<div class="text">Angle</div>
			<NumberVar
				id="moveActor-angle"
				v-tip="t('components.moveActor-angle.tip')"
				:ref="registryRef(fieldEls, 'moveActor-angle')"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
				v-model="form.angle"
			/>
			<div class="text">Destination</div>
			<CustomBox id="moveActor-destination"
				v-tip="t('components.moveActor-destination.tip')"
				:ref="registryRef(fieldEls, 'moveActor-destination')" type="position" v-model="form.destination" />
			<div class="text">Wait</div>
			<SelectBox id="moveActor-wait"
				:ref="registryRef(fieldEls, 'moveActor-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMoveActorCommandSchema } from '@app/composables/commands/useMoveActorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useMoveActorCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('moveActor-mode')?.loadItems?.([
		{ name: t('command.moveActor.mode.stop') || 'Stop', value: 'stop' },
		{ name: t('command.moveActor.mode.keep') || 'Keep', value: 'keep' },
		{ name: t('command.moveActor.mode.straight') || 'Straight', value: 'straight' },
		{ name: t('command.moveActor.mode.navigate') || 'Navigate', value: 'navigate' },
		{
			name: t('command.moveActor.mode.navigate-bypass') || 'Navigate - Bypass Actors',
			value: 'navigate-bypass'
		},
		{ name: t('command.moveActor.mode.teleport') || 'Teleport', value: 'teleport' }
	]);
	fieldEls.get('moveActor-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'keep', targets: [fieldEls.get('moveActor-angle')] },
			{
				case: ['straight', 'navigate', 'navigate-bypass'],
				targets: [fieldEls.get('moveActor-destination'), fieldEls.get('moveActor-wait')]
			},
			{ case: 'teleport', targets: [fieldEls.get('moveActor-destination')] }
		]);
	fieldEls.get('moveActor-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#moveActor {
	width: 324px;
	height: 170px;
}

#moveActor-confirm {
	right: 108px;
	bottom: 10px;
}

#moveActor-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
