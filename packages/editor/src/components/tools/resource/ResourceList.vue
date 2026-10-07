<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ResourceRow } from '@app/stores/resource';

interface Props {
	rows: ResourceRow[];
}

defineProps<Props>();

const emit = defineEmits<{
	download: [key: string];
	pause: [key: string];
	remove: [key: string];
}>();

const { t } = useI18n();

const downloadLabel = (row: ResourceRow): string =>
	row.phase === 'decompressing'
		? t('confirmation.resource-decompression')
		: t('confirmation.resource-download');

const progressBarStyle = (row: ResourceRow) => ({
	width: `${row.progress}%`,
	background:
		row.phase === 'decompressing'
			? 'linear-gradient(90deg, #2196f3, #42a5f5)'
			: 'linear-gradient(90deg, #4caf50, #66bb6a)'
});
</script>

<template>
	<div
		v-for="row in rows"
		:key="row.key"
		:id="`resource-item-${row.value}`"
		class="box resource-item"
		style="
			display: flex;
			flex-direction: column;
			padding: 10px;
			margin: 5px 0;
			border: 1px solid var(--border-color);
			border-radius: 4px;
		"
	>
		<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px">
			<div class="text" style="flex: 0 0 auto">{{ row.value }}:&emsp;</div>
			<div class="text-box" style="flex: 1">
				<input class="text-box-input" type="text" readonly :value="row.version" />
			</div>
			<button
				:id="`resource-item-${row.value}-download`"
				name="resource-download"
				:class="{ disabled: row.installed || row.phase !== 'idle' }"
				@click="emit('download', row.key)"
			>
				{{ downloadLabel(row) }}
			</button>
			<button
				v-show="row.phase === 'downloading'"
				:id="`resource-item-${row.value}-pause`"
				name="pause"
				@click="emit('pause', row.key)"
			>
				{{ t('confirmation.resource-pause') }}
			</button>
			<button
				:id="`resource-item-${row.value}-delete`"
				name="delete"
				:class="{ disabled: !row.installed && !row.hasTemp }"
				@click="emit('remove', row.key)"
			>
				{{ t('common.delete') }}
			</button>
		</div>
		<div
			v-show="row.phase !== 'idle'"
			:id="`resource-item-${row.value}-progress`"
			style="display: flex; flex-direction: column; gap: 4px"
		>
			<div style="display: flex; align-items: center; gap: 8px">
				<div
					style="
						flex: 1;
						height: 20px;
						background: var(--panel-background);
						border: 1px solid var(--border-color);
						border-radius: 3px;
						overflow: hidden;
					"
				>
					<div
						:id="`resource-item-${row.value}-progress-bar`"
						:style="progressBarStyle(row)"
						style="height: 100%; transition: width 0.3s"
					/>
				</div>
				<div
					:id="`resource-item-${row.value}-progress-text`"
					class="text"
					style="flex: 0 0 auto; min-width: 50px; text-align: right"
				>
					{{ row.progress }}%
				</div>
			</div>
			<div
				:id="`resource-item-${row.value}-speed`"
				class="text"
				style="font-size: 12px; color: #888"
			>
				{{ row.speedText }}
			</div>
		</div>
		<div
			:id="`resource-item-${row.value}-size`"
			class="text"
			style="font-size: 12px; color: #888; margin-top: 4px"
		>
			{{ row.sizeText }}
		</div>
	</div>
</template>
