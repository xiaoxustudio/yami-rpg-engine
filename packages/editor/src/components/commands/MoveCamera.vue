<template>
	<WindowFrame id="moveCamera"
				:ref="registryRef(fieldEls, 'moveCamera')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.moveCamera.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.moveCamera-mode.label') }}</div>
			<SelectBox id="moveCamera-mode"
				v-tip="t('components.moveCamera-mode.tip')"
				:ref="registryRef(fieldEls, 'moveCamera-mode')" v-focus v-model="form.mode" />
			<div class="text">{{ t('components.moveCamera-position.label') }}</div>
			<CustomBox id="moveCamera-position"
				v-tip="t('components.moveCamera-position.tip')"
				:ref="registryRef(fieldEls, 'moveCamera-position')" type="position" v-model="form.position" />
			<div class="text">{{ t('components.moveCamera-actor.label') }}</div>
			<CustomBox id="moveCamera-actor"
				v-tip="t('components.moveCamera-actor.tip')"
				:ref="registryRef(fieldEls, 'moveCamera-actor')" type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.moveCamera-easingId.label') }}</div>
			<SelectBox id="moveCamera-easingId"
				:ref="registryRef(fieldEls, 'moveCamera-easingId')" name="easing" v-model="form.easingId" />
			<div class="text">{{ t('components.moveCamera-duration.label') }}</div>
			<NumberBox
				id="moveCamera-duration"
				:ref="registryRef(fieldEls, 'moveCamera-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.moveCamera-wait.label') }}</div>
			<SelectBox id="moveCamera-wait"
				:ref="registryRef(fieldEls, 'moveCamera-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMoveCameraCommandSchema } from '@app/composables/commands/useMoveCameraCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useMoveCameraCommandSchema();

const duration = computed({
	get: () => form.duration as number | string,
	set: (value) => {
		form.duration = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('moveCamera-mode', ['position', 'actor'], (items) =>
		fieldEls.get('moveCamera-mode')?.loadItems?.(items),
		{ 'position': 'command.moveCamera.position', 'actor': 'command.moveCamera.actor' }
	);
	fieldEls.get('moveCamera-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'position', targets: [fieldEls.get('moveCamera-position')] },
			{ case: 'actor', targets: [fieldEls.get('moveCamera-actor')] }
		]);
	useLocalizedOptions('moveCamera-wait', [true, false], (items) =>
		fieldEls.get('moveCamera-wait')?.loadItems?.(items)
	);
	fieldEls.get('moveCamera')?.on?.('open', () => {
		fieldEls.get('moveCamera-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#moveCamera {
	width: 324px;
	height: 194px;
}

#moveCamera-confirm {
	right: 108px;
	bottom: 10px;
}

#moveCamera-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
