<?php


if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
	die();
}

return [
	'css' => 'dist/registry.bundle.css',
	'js' => 'dist/registry.bundle.js',
	'rel' => [
		'im.v2.lib.date-formatter',
		'ui.vue3',
		'ui.lottie',
		'im.v2.lib.user',
		'im.v2.lib.logger',
		'ui.reactions-select',
		'main.core',
		'ui.vue3.components.reactions',
		'im.v2.lib.parser',
		'im.v2.application.core',
		'im.v2.component.elements',
		'main.core.events',
		'im.v2.const',
		'im.v2.lib.utils',
		'im.v2.lib.quote',
	],
	'skip_core' => false,
];