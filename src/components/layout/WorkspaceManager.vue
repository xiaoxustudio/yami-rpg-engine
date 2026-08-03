<template>
	<PageManager id="workspace-page-manager">
		<div class="page-frame" id="home" value="home">
			<box id="home-content">
				<text id="home-title">YAMI RPG EDITOR (Open Yami)</text>
				<text id="home-version"></text>
				<box id="home-start-list">
					<item id="home-start-label" class="home-list-label">Start</item>
					<item id="home-start-new" class="home-start-item" value="new">New Project</item>
					<item id="home-start-open" class="home-start-item" value="open">Open Project</item>
				</box>
				<box id="home-recent-list" tabindex="-1">
					<item id="home-recent-label" class="home-list-label">Recent</item>
					<item class="home-recent-item" value="0"></item>
					<item class="home-recent-item" value="1"></item>
					<item class="home-recent-item" value="2"></item>
				</box>
			</box>
		</div>
		<div class="page-frame" value="directory"></div>
		<div class="page-frame" value="scene"></div>
		<div class="page-frame" value="ui"></div>
		<div class="page-frame" value="animation"></div>
		<div class="page-frame" value="particle"></div>
	</PageManager>
</template>

<script setup lang="ts">
import PageManager from '@app/components/common/PageManager.vue';
</script>
