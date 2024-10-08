<?php

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

class CBPCalendar2Activity extends CBPActivity
{
	public function __construct($name)
	{
		parent::__construct($name);
		$this->arProperties = array(
			"Title" => "",
			"CalendarUser" => "",
			"CalendarName" => "",
			"CalendarDesrc" => "",
			"CalendarFrom" => "",
			"CalendarTo" => "",
			"CalendarTimezone" => "",
			"CalendarType" => "",
			"CalendarOwnerId" => "",
			"CalendarSection" => ""
		);
	}

	public function Execute()
	{
		if (!CModule::IncludeModule("calendar"))
		{
			return CBPActivityExecutionStatus::Closed;
		}

		$rootActivity = $this->GetRootActivity();
		$documentId = $rootActivity->GetDocumentId();

		$fromTs = $this->getCalendarFrom();
		$toTs = $this->getCalendarTo($fromTs);
		$calendarType = $this->getCalendarType();
		$calendarName = $this->getCalendarName();
		$calendarFio = $this->getCalendarFio();
		$calendarPhone = $this->getCalendarPhone();
		$calendarDescription = $this->getCalendarDescription();

		$arFields = [
			"CAL_TYPE" => $calendarType,
			"NAME" => $calendarName ?: GetMessage('EC_DEFAULT_EVENT_NAME_V2'),
			"FIO" => $calendarFio ?: GetMessage('EC_DEFAULT_EVENT_NAME_V2'),
			"PHONE" => $calendarPhone ?: GetMessage('EC_DEFAULT_EVENT_NAME_V2'),

			"DESCRIPTION" => $calendarDescription,
			"SKIP_TIME" => date('H:i', $fromTs) == '00:00' && date('H:i', $toTs) == '00:00',
			"IS_MEETING" => false,
			"RRULE" => false,
			"TZ_FROM" => $this->CalendarTimezone,
			"TZ_TO" => $this->CalendarTimezone
		];

		if ($fromTs == $toTs && !$arFields["SKIP_TIME"])
		{
			$toTs += 3600 /* HOUR LENGTH*/;
		}

		$arFields['DATE_FROM'] = CCalendar::Date($fromTs);
		$arFields['DATE_TO'] = CCalendar::Date($toTs);

		if ($this->CalendarSection && (int)$this->CalendarSection > 0 && CCalendarSect::GetById((int)$this->CalendarSection))
		{
			$arFields['SECTIONS'] = [(int)$this->CalendarSection];
		}

		if ($this->CalendarOwnerId || ($arFields["CAL_TYPE"] !== "user" && $arFields["CAL_TYPE"] !== "group"))
		{
			$arFields["OWNER_ID"] = $this->CalendarOwnerId;
			if (!$arFields['SKIP_TIME'] && !$this->CalendarTimezone)
			{
				unset($arFields["TZ_FROM"], $arFields["TZ_TO"]);
			}

			CCalendar::SaveEvent([
				'userId' => CBPHelper::ExtractUsers($this->CalendarUser, $documentId, true),
				'arFields' => $arFields,
				'autoDetectSection' => true,
				'autoCreateSection' => true
			]);
		}
		else
		{
			$arCalendarUser = CBPHelper::ExtractUsers($this->CalendarUser, $documentId);
			foreach ($arCalendarUser as $calendarUser)
			{
				$arFields["CAL_TYPE"] = "user";
				$arFields["OWNER_ID"] = $calendarUser;

				if (!$arFields['SKIP_TIME'] && !$this->CalendarTimezone)
				{
					$tzName = CCalendar::GetUserTimezoneName($calendarUser);
					$arFields["TZ_FROM"] = $arFields["TZ_TO"] = $tzName;
				}

				CCalendar::SaveEvent([
					'userId' => $calendarUser,
					'arFields' => $arFields,
					'autoDetectSection' => true,
					'autoCreateSection' => true,
				]);
			}
		}

		return CBPActivityExecutionStatus::Closed;
	}

	public static function ValidateProperties($arTestProperties = array(), CBPWorkflowTemplateUser $user = null)
	{
		$arErrors = array();

		if (!array_key_exists("CalendarUser", $arTestProperties) || count($arTestProperties["CalendarUser"]) <= 0)
			$arErrors[] = array("code" => "NotExist", "parameter" => "CalendarUser", "message" => GetMessage("BPSNMA_EMPTY_CALENDARUSER"));
		if (!array_key_exists("CalendarName", $arTestProperties) || $arTestProperties["CalendarName"] == '')
			$arErrors[] = array("code" => "NotExist", "parameter" => "CalendarName", "message" => GetMessage("BPSNMA_EMPTY_CALENDARNAME"));
		if (!array_key_exists("CalendarFrom", $arTestProperties) || $arTestProperties["CalendarFrom"] == '')
			$arErrors[] = array("code" => "NotExist", "parameter" => "CalendarFrom", "message" => GetMessage("BPSNMA_EMPTY_CALENDARFROM"));

		return array_merge($arErrors, parent::ValidateProperties($arTestProperties, $user));
	}

	public static function GetPropertiesDialog($documentType, $activityName, $arWorkflowTemplate, $arWorkflowParameters, $arWorkflowVariables, $arCurrentValues = null, $formName = "")
	{
		global $USER;
		CModule::IncludeModule("calendar");
		$runtime = CBPRuntime::GetRuntime();

		$arMap = array(
			"CalendarType" => "calendar_type",
			"CalendarOwnerId" => "calendar_owner_id",
			"CalendarSection" => "calendar_section",
			"CalendarUser" => "calendar_user",
			"CalendarName" => "calendar_name",
			"CalendarDesrc" => "calendar_desrc",
			"CalendarFrom" => "calendar_from",
			"CalendarTo" => "calendar_to",
			"CalendarTimezone" => "calendar_timezone"
		);

		if (!is_array($arWorkflowParameters))
			$arWorkflowParameters = array();
		if (!is_array($arWorkflowVariables))
			$arWorkflowVariables = array();

		if (!is_array($arCurrentValues))
		{
			$arCurrentActivity = &CBPWorkflowTemplateLoader::FindActivityByName($arWorkflowTemplate, $activityName);
			if (is_array($arCurrentActivity["Properties"]))
			{
				foreach ($arMap as $k => $v)
				{
					if (array_key_exists($k, $arCurrentActivity["Properties"]))
					{
						if ($k == "CalendarUser")
							$arCurrentValues[$arMap[$k]] = CBPHelper::UsersArrayToString($arCurrentActivity["Properties"][$k], $arWorkflowTemplate, $documentType);
						else
							$arCurrentValues[$arMap[$k]] = $arCurrentActivity["Properties"][$k];
					}
					else
					{
						$arCurrentValues[$arMap[$k]] = "";
					}
				}
			}
			else
			{
				foreach ($arMap as $k => $v)
					$arCurrentValues[$arMap[$k]] = "";
			}
		}

		if (!$arCurrentValues["calendar_timezone"])
		{
			$userId = $USER->GetId();
			$tzName = CCalendar::GetUserTimezoneName($userId);
			$arCurrentValues["calendar_timezone"] = $tzName;
		}

		return $runtime->ExecuteResourceFile(
			__FILE__,
			"properties_dialog.php",
			array(
				"arCurrentValues" => $arCurrentValues,
				"formName" => $formName,
				"timezoneList" => CCalendar::GetTimezoneList()
			)
		);
	}

	public static function GetPropertiesDialogValues($documentType, $activityName, &$arWorkflowTemplate, &$arWorkflowParameters, &$arWorkflowVariables, $arCurrentValues, &$arErrors)
	{
		$arErrors = array();

		$runtime = CBPRuntime::GetRuntime();

		$arMap = array(
			"calendar_user" => "CalendarUser",
			"calendar_name" => "CalendarName",
			"calendar_desrc" => "CalendarDesrc",
			"calendar_from" => "CalendarFrom",
			"calendar_to" => "CalendarTo",
			"calendar_type" => "CalendarType",
			"calendar_owner_id" => "CalendarOwnerId",
			"calendar_section" => "CalendarSection",
			"calendar_timezone" => "CalendarTimezone"
		);

		$arProperties = array();
		foreach ($arMap as $key => $value)
		{
			if ($key == "calendar_user")
				continue;
			$arProperties[$value] = $arCurrentValues[$key];
		}

		$arProperties["CalendarUser"] = CBPHelper::UsersStringToArray($arCurrentValues["calendar_user"], $documentType, $arErrors);
		if (count($arErrors) > 0)
			return false;

		$arErrors = self::ValidateProperties($arProperties, new CBPWorkflowTemplateUser(CBPWorkflowTemplateUser::CurrentUser));
		if (count($arErrors) > 0)
			return false;

		$arCurrentActivity = &CBPWorkflowTemplateLoader::FindActivityByName($arWorkflowTemplate, $activityName);
		$arCurrentActivity["Properties"] = $arProperties;

		return true;
	}

	private function getCalendarFrom()
	{
		$calendarFrom = $this->CalendarFrom;
		if (is_array($calendarFrom))
		{
			$calendarFrom = current(CBPHelper::makeArrayFlat($calendarFrom));
		}

		if (
			is_scalar($calendarFrom)
			|| (is_object($calendarFrom) && method_exists($calendarFrom, '__toString'))
		)
		{
			$calendarFrom = (string)$calendarFrom;
		}
		else
		{
			$calendarFrom = '';
		}

		return CCalendar::Timestamp($calendarFrom);
	}

	private function getCalendarTo($calendarFrom)
	{
		$calendarTo = $this->CalendarTo;
		// $calendarTo == '' (php 7.4: (0 == ''))
		if ($calendarTo === 0 || CBPHelper::isEmptyValue($calendarTo))
		{
			return $calendarFrom;
		}

		if (is_array($calendarTo))
		{
			$calendarTo = current(CBPHelper::makeArrayFlat($calendarTo));
		}

		if (
			is_scalar($calendarTo)
			|| (is_object($calendarTo) && method_exists($calendarTo, '__toString'))
		)
		{
			$calendarTo = (string)$calendarTo;
		}
		else
		{
			$calendarTo = '';
		}

		return CCalendar::Timestamp($calendarTo);
	}

	private function getCalendarType(): string
	{
		$calendarType = $this->CalendarType;
		if (is_array($calendarType))
		{
			$calendarType = current(\CBPHelper::makeArrayFlat($calendarType));
		}
		$types = ['user', 'company_calendar', 'group', 'resource', 'location'];

		if (in_array($calendarType, $types, true))
		{
			return $calendarType;
		}

		return 'user';
	}

	/**
	 * @return mixed|string|null
	 */
	private function getCalendarName(): string
	{
		$name = $this->CalendarName;
		if (is_array($name))
		{
			$name = current(\CBPHelper::makeArrayFlat($name));
		}

		return trim((string)$name);
	}
	private function getCalendarFio(): string
	{
		$fio = $this->CalendarFio;
		if (is_array($fio))
		{
			$fio = current(\CBPHelper::makeArrayFlat($fio));
		}

		return trim((string)$fio);
	}

	private function getCalendarPhone(): string
	{
		$phone = $this->CalendarPhone;
		if (is_array($phone))
		{
			$phone = current(\CBPHelper::makeArrayFlat($phone));
		}

		return trim((string)$phone);
	}


	/**
	 * @return mixed|null
	 */
	private function getCalendarDescription()
	{
		$description = $this->CalendarDesrc;
		if (is_array($description))
		{
			$description = current(\CBPHelper::makeArrayFlat($description));
		}

		return trim((string)$description);
	}
}
