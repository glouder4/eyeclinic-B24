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