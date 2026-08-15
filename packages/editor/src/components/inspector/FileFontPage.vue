<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileFont-info-grid') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileFont-info-grid">
			<div class="text">{{ local.getLabel('fileFont-name') || 'Name' }}</div><div class="text" id="fileFont-name"></div> <div class="text">{{ local.getLabel('fileFont-size') || 'Size' }}</div
			><div class="text" id="fileFont-size"></div>
		</div>
	</DetailBox>
	<DetailBox id="fileFont-font-detail" open>
		<DetailSummary>{{ local.getLabel('fileFont-font-grid') || 'Font Preview' }}</DetailSummary>
		<div class="detail-grid" id="fileFont-font-grid">
			<TextBox id="fileFont-content" @input="onTextInput" />
			<div class="text fileFont-preview" id="fileFont-12px"></div>
			<div class="text fileFont-preview" id="fileFont-18px"></div>
			<div class="text fileFont-preview" id="fileFont-24px"></div>
			<div class="text fileFont-preview" id="fileFont-36px"></div>
			<div class="text fileFont-preview" id="fileFont-48px"></div>
			<div class="text fileFont-preview" id="fileFont-60px"></div>
			<div class="text fileFont-preview" id="fileFont-72px"></div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { useFileFontPage } from '@app/composables/useFileFontPage';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import TextBox from '@app/components/common/TextBox.vue';

const local = useLocalStore();

const { onTextInput } = useFileFontPage();
</script>
