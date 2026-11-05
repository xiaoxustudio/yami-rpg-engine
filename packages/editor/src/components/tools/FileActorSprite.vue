<template>
	<WindowFrame id="fileActor-sprite" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fileActor-sprite.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fileActor-sprite-id.label') }}</div>
			<SelectBox
				:label="t('components.fileActor-sprite-id.label')"
				id="fileActor-sprite-id"
				v-tip="t('components.fileActor-sprite-id.tip')"
				ref="spriteIdRef"
				v-focus
				v-model="form.id"
			/>
			<div class="text">{{ t('components.fileActor-sprite-image.label') }}</div>
			<CustomBox
				id="fileActor-sprite-image"
				v-tip="t('components.fileActor-sprite-image.tip')"
				v-focus
				type="file"
				filter="image"
				v-model="form.image"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	provideFileActorSprite,
	resetFileActorSprite,
	type FileActorSpriteApi
} from '@app/composables/file-actor-tool-bridges';
import { Inspector } from '@app/inspector/inspector.ts';
import { fileActorSpriteForm } from '@app/inspector/file-actor-page.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = fileActorSpriteForm;

const onConfirm = () => {
	Inspector?.fileActor?.sprites?.save?.();
};

/** 这个窗口只负责一件事：给单例把候选项灌进控件。 */
const spriteIdRef = ref<InstanceType<typeof SelectBox> | null>(null);

const bridgeApi: FileActorSpriteApi = {
	loadIds: (items) => {
		spriteIdRef.value?.loadItems(items);
	}
};

onMounted(() => {
	provideFileActorSprite(bridgeApi);
	onUnmounted(() => resetFileActorSprite(bridgeApi));
});
</script>

<style>
#fileActor-sprite {
	width: 324px;
	height: 122px;
}

#fileActor-sprite-confirm {
	right: 108px;
	bottom: 10px;
}

#fileActor-sprite-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
