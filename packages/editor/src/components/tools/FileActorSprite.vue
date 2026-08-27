<template>
	<WindowFrame id="fileActor-sprite" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fileActor-sprite.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.fileActor-sprite-id.label') }}</div>
			<SelectBox id="fileActor-sprite-id" v-model="form.id" />
			<div class="text">{{ t('components.fileActor-sprite-image.label') }}</div>
			<CustomBox
				id="fileActor-sprite-image"
				type="file"
				filter="image"
				v-model="form.image"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { fileActorSpriteForm } from '@app/inspector/file-actor-page.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = fileActorSpriteForm;

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Inspector?.fileActor?.sprites?.save?.();
};

onMounted(() => {});
</script>
