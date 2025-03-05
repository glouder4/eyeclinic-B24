<?php
use Bitrix\Main\Type\DateTime;
define('BX_REST_LOG', true);
    //die();

    AddEventHandler("main", "OnBeforeProlog", "MyOnBeforePrologHandler", 50);

    function MyOnBeforePrologHandler()
    {
        CJSCore::RegisterExt(
            "embedding",
            array(
                "js" => "/local/embedding/embedding.js",
                "css" => "/local/embedding/embedding.css",
                "rel" => Array("ajax", "popup", "ls", "fx"),
                "skip_core" => false,
            )
        );

        CJSCore::Init('embedding');
    }

AddEventHandler('crm', 'OnBeforeCrmDealUpdate', 'FixDealBookingDate');
function pre($o) {

    $bt = debug_backtrace();
    $bt = $bt[0];
    $dRoot = $_SERVER["DOCUMENT_ROOT"];
    $dRoot = str_replace("/", "\\", $dRoot);
    $bt["file"] = str_replace($dRoot, "", $bt["file"]);
    $dRoot = str_replace("\\", "/", $dRoot);
    $bt["file"] = str_replace($dRoot, "", $bt["file"]);
    ?>
    <div style='font-size:9pt; color:#000; background:#fff; border:1px dashed #000;text-align: left!important;'>
        <div style='padding:3px 5px; background:#99CCFF; font-weight:bold;'>File: <?= $bt["file"] ?> [<?= $bt["line"] ?>]</div>
        <pre style='padding:5px;'><? print_r($o) ?></pre>
    </div>
    <?
}
function FixDealBookingDate(&$arFields)
{
    if (isset($arFields['UF_BOOKING_DATE'])) {
        // Получаем временную зону из настроек Bitrix
        $bitrixTimeZone = \CTimeZone::GetOption(); // Например, "Asia/Yekaterinburg"

        // Преобразуем дату из UTC в временную зону, указанную в настройках
        $date = DateTime::createFromFormat('Y-m-d H:i:s', $arFields['UF_BOOKING_DATE'], new \DateTimeZone('UTC'));
        $date->setTimezone(new \DateTimeZone($bitrixTimeZone));
        $arFields['UF_BOOKING_DATE'] = $date->format('Y-m-d H:i:s');
    }
}