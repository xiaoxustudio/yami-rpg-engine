<template>
	<WindowFrame id="changeActorSprite" :ref="controlRef('changeActorSprite')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorSprite.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorSprite-actor.label') }}</div>
			<CustomBox
				id="changeActorSprite-actor"
				:ref="controlRef('changeActorSprite-actor')"
				v-tip="t('components.changeActorSprite-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeActorSprite-animationId.label') }}</div>
			<CustomBox
				id="changeActorSprite-animationId"
				:ref="controlRef('changeActorSprite-animationId')"
				v-tip="t('components.changeActorSprite-animationId.tip')"
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.changeActorSprite-spriteId.label') }}</div>
			<SelectBox
				:label="t('components.changeActorSprite-spriteId.label')"
				id="changeActorSprite-spriteId"
				:ref="controlRef('changeActorSprite-spriteId')"
				v-tip="t('components.changeActorSprite-spriteId.tip')"
				v-model="form.spriteId"
			/>
			<div class="text">{{ t('components.changeActorSprite-image.label') }}</div>
			<CustomBox
				id="changeActorSprite-image"
				:ref="controlRef('changeActorSprite-image')"
				v-tip="t('components.changeActorSprite-image.tip')"
				type="file"
				filter="image"
				v-model="form.image"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorSpriteCommandSchema } from '@app/composables/commands/useChangeActorSpriteCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';
import {
	provideChangeActorSpriteBridge,
	resetChangeActorSpriteBridge,
	type ChangeActorSpriteBridge
} from '@app/composables/change-actor-sprite-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'changeActorSprite-actor'
	| 'changeActorSprite-animationId'
	| 'changeActorSprite-image'
	| 'changeActorSprite-spriteId'
	| 'changeActorSprite';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, writeHandler } = useChangeActorSpriteCommandSchema();

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 换候选项后要回写旧值（`write2` 只改值不派发 input）。 */
const bridgeApi: ChangeActorSpriteBridge = {
	reloadSprite: (items) => {
		controls['changeActorSprite-spriteId']?.loadItems?.(items);
		controls['changeActorSprite-spriteId']?.write2?.(
			controls['changeActorSprite-spriteId']?.read?.() as string
		);
	}
};

onMounted(() => {
	provideChangeActorSpriteBridge(bridgeApi);
	onUnmounted(() => resetChangeActorSpriteBridge(bridgeApi));
});
</script>

<style>
#changeActorSprite {
	width: 324px;
	height: 170px;
}

#changeActorSprite-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorSprite-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
