<template>
	<WindowFrame
		id="changeActorMotion"
		:ref="registryRef(fieldEls, 'changeActorMotion')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.changeActorMotion.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorMotion-actor.label') }}</div>
			<CustomBox
				id="changeActorMotion-actor"
				:ref="registryRef(fieldEls, 'changeActorMotion-actor')"
				v-tip="t('components.changeActorMotion-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeActorMotion-type.label') }}</div>
			<SelectBox
				id="changeActorMotion-type"
				v-tip="t('components.changeActorMotion-type.tip')"
				:ref="registryRef(fieldEls, 'changeActorMotion-type')"
				v-model="form.type"
			/>
			<div class="text">{{ t('components.changeActorMotion-motion.label') }}</div>
			<CustomBox
				id="changeActorMotion-motion"
				:ref="registryRef(fieldEls, 'changeActorMotion-motion')"
				v-tip="t('components.changeActorMotion-motion.tip')"
				type="enum-string"
				v-model="form.motion"
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
import { useChangeActorMotionCommandSchema } from '@app/composables/commands/useChangeActorMotionCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorMotionCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'changeActorMotion-type',
		['idle', 'move'],
		(items) => fieldEls.get('changeActorMotion-type')?.loadItems?.(items),
		{ idle: 'command.changeActorMotion.type.idle', move: 'command.changeActorMotion.type.move' }
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#changeActorMotion {
	width: 324px;
	height: 146px;
}

#changeActorMotion-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorMotion-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
