<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileAnimation-sprites.label') || 'Sprites'
		}}</DetailSummary>
		<ParamList id="fileAnimation-sprites"
				v-tip="t('components.fileAnimation-sprites.tip')" ref="elSprites" class="inspector-list" flexible />
	</DetailBox>
</template>

<script setup lang="ts">
import '@app/inspector/file-animation-page.ts';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const elSprites = ref<InstanceType<typeof ParamList> | null>(null);

onMounted(() => {
	const editor = Inspector.fileAnimation;
	if (!editor) return;

	if (elSprites.value) {
		elSprites.value.bind(editor.sprites);
		elSprites.value.on('change', Animation.listChange);
	}
});
</script>
