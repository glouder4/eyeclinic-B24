<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

return [
	'css' => 'dist/blank-selector.bundle.css',
	'js' => 'dist/blank-selector.bundle.js',
	'rel' => [
		'main.popup',
		'ui.uploader.tile-widget',
		'ui.uploader.core',
		'sign.v2.api',
		'main.core.events',
		'main.core',
		'main.loader',
	],
	'skip_core' => false,
];