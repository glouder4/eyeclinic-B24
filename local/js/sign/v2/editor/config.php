<?
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

return [
	'css' => 'dist/editor.bundle.css',
	'js' => 'dist/editor.bundle.js',
	'rel' => [
		'ui.dialogs.messagebox',
		'main.popup',
		'sign.backend',
		'date',
		'ui.stamp.uploader',
		'sign.v2.api',
		'crm.form.fields.selector',
		'crm.requisite.fieldset-viewer',
		'sign.ui',
		'color_picker',
		'sign.document',
		'main.core',
		'ui.draganddrop.draggable',
		'ui.buttons',
		'sign.tour',
		'ui.info-helper',
		'spotlight',
		'main.core.events',
	],
	'skip_core' => false,
];