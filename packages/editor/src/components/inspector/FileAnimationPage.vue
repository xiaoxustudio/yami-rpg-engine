<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileAnimation-sprites.label') || 'Sprites'
		}}</DetailSummary>
		<ParamList id="fileAnimation-sprites" class="inspector-list" flexible />
	</DetailBox>
</template>

<script setup lang="ts">
import '@app/inspector/file-animation-page.ts';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

onMounted(() => {
	const editor = Inspector.fileAnimation;
	if (!editor) return;

	const elSprites = document.getElementById('fileAnimation-sprites');
	if (elSprites) {
		elSprites.bind(editor.sprites);
		elSprites.on('change', Animation.listChange);
	}
});
</script>
