<template>
	<PageManager id="workspace-page-manager">
		<div class="page-frame" id="home" value="home">
			<div class="box" id="home-content">
				<div class="text" id="home-title">YAMI RPG EDITOR (Open Yami)</div>
				<div class="text" id="home-version"></div>
				<div class="box" id="home-start-list">
					<div class="item home-list-label" id="home-start-label">Start</div>
					<div class="item home-start-item" id="home-start-new" value="new">New Project</div>
					<div class="item home-start-item" id="home-start-open" value="open">Open Project</div>
				</div>
				<div class="box" id="home-recent-list" tabindex="-1">
					<div class="item home-list-label" id="home-recent-label">Recent</div>
					<div class="item home-recent-item" value="0"></div>
					<div class="item home-recent-item" value="1"></div>
					<div class="item home-recent-item" value="2"></div>
				</div>
			</div>
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
