<template>
	<WindowFrame id="fileAnimation-sprite" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fileAnimation-sprite.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fileAnimation-sprite-name.label') }}</div>
			<TextBox id="fileAnimation-sprite-name" v-focus v-model="form.name" />
			<div class="text">{{ t('components.fileAnimation-sprite-image.label') }}</div>
			<CustomBox
				id="fileAnimation-sprite-image"
				v-focus
				type="file"
				filter="image"
				v-model="form.image"
			/>
			<div class="text">{{ t('components.fileAnimation-sprite-hframes.label') }}</div>
			<NumberBox id="fileAnimation-sprite-hframes" min="1" max="256" v-model="form.hframes" />
			<div class="text">{{ t('components.fileAnimation-sprite-vframes.label') }}</div>
			<NumberBox id="fileAnimation-sprite-vframes" min="1" max="256" v-model="form.vframes" />
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
