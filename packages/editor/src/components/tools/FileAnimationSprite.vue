<template>
	<WindowFrame id="fileAnimation-sprite" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fileAnimation-sprite.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fileAnimation-sprite-name.label') }}</div>
			<TextBox id="fileAnimation-sprite-name"
				v-tip="t('components.fileAnimation-sprite-name.tip')" v-focus v-model="form.name" />
			<div class="text">{{ t('components.fileAnimation-sprite-image.label') }}</div>
			<CustomBox
				id="fileAnimation-sprite-image"
				v-tip="t('components.fileAnimation-sprite-image.tip')"
				v-focus
				type="file"
				filter="image"
				v-model="form.image"
			/>
			<div class="text">{{ t('components.fileAnimation-sprite-hframes.label') }}</div>
			<NumberBox id="fileAnimation-sprite-hframes"
				v-tip="t('components.fileAnimation-sprite-hframes.tip')" min="1" max="256" v-model="form.hframes" />
			<div class="text">{{ t('components.fileAnimation-sprite-vframes.label') }}</div>
			<NumberBox id="fileAnimation-sprite-vframes"
				v-tip="t('components.fileAnimation-sprite-vframes.tip')" min="1" max="256" v-model="form.vframes" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { fileAnimationSpriteForm } from '@app/inspector/file-animation-page.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const form = fileAnimationSpriteForm;

const onConfirm = () => {
	Inspector?.fileAnimation?.sprites?.save?.();
};

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#fileAnimation-sprite {
	width: 324px;
	height: 170px;
}

#fileAnimation-sprite-confirm {
	right: 108px;
	bottom: 10px;
}

#fileAnimation-sprite-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

