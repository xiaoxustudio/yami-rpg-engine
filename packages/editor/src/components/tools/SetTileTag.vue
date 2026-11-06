<template>
	<WindowFrame id="setTileTag" ref="frame" @confirm="onConfirm" @closed="onWindowClosed">
		<template #title
			><TitleBar
				>{{ t('components.setTileTag.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTileTag-tag.label') }}</div>
			<NumberBox
				:label="t('components.setTileTag-tag.label')"
				id="setTileTag-tag"
				v-tip="t('components.setTileTag-tag.tip')"
				ref="tagRef"
				min="0"
				max="99999"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { SetTileTag } from '@app/module/set-tile-tag.ts';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	provideSetTileTag,
	resetSetTileTag,
	type SetTileTagApi
} from '@app/composables/tool-window-bridges';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const onConfirm = () => {
	SetTileTag?.confirm?.();
};

const { t } = useI18n();

const tagRef = ref<InstanceType<typeof NumberBox> | null>(null);

const bridgeApi: SetTileTagApi = {
	setTag: (tag) => {
		tagRef.value?.write?.(tag);
	},
	getTag: () => tagRef.value?.read?.()
};

/** 关闭时通知单例（原来靠注册表取根元素挂监听）。 */
const onWindowClosed = () => {
	SetTileTag?.windowClosed?.();
};

onMounted(() => {
	provideSetTileTag(bridgeApi);
	onUnmounted(() => resetSetTileTag(bridgeApi));
});
</script>

<style>
#setTileTag {
	width: 324px;
	height: 98px;
}

#setTileTag-confirm {
	right: 108px;
	bottom: 10px;
}

#setTileTag-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
