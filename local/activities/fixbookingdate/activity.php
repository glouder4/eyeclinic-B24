<?php
namespace CustomActivities;

use Bitrix\Main\Type\DateTime;

class FixBookingDateActivity extends \CBPActivity
{
    public function __construct($name)
    {
        parent::__construct($name);
        $this->arProperties = [
            "Title" => "",
            "BookingDate" => "", // Входное поле
            "FixedDate" => "",  // Выходное поле
        ];
    }

    public function Execute()
    {
        if (empty($this->BookingDate)) {
            $this->FixedDate = null;
            return CBPActivityExecutionStatus::Closed;
        }

        $bitrixTimeZone = \CTimeZone::GetOption(); // Получаем часовой пояс из настроек
        $date = DateTime::createFromFormat('Y-m-d H:i:s', $this->BookingDate, new \DateTimeZone('UTC'));
        $date->setTimezone(new \DateTimeZone($bitrixTimeZone));
        $this->FixedDate = $date->format('Y-m-d H:i:s');

        return CBPActivityExecutionStatus::Closed;
    }

    public static function GetPropertiesDialog($documentType, $activityName, $arWorkflowTemplate, $arWorkflowParameters, $arWorkflowVariables, $arCurrentValues = null, $formName = "")
    {
        // Логика отрисовки интерфейса
        return "";
    }

    public static function ValidateProperties($arTestProperties = [], $user = null)
    {
        // Проверка перед сохранением
        $errors = [];
        if (empty($arTestProperties['BookingDate'])) {
            $errors[] = ["code" => "EmptyBookingDate", "message" => "Не указана дата бронирования"];
        }
        return array_merge($errors, parent::ValidateProperties($arTestProperties, $user));
    }
}