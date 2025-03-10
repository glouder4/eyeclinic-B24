<?php
namespace Bitrix\Calendar\Controller;

use Bitrix\Calendar\Access\ActionDictionary;
use Bitrix\Calendar\Access\EventAccessController;
use Bitrix\Calendar\Access\Model\EventModel;
use Bitrix\Calendar\Core\Managers\Accessibility;
use Bitrix\Calendar\Rooms;
use Bitrix\Calendar\Internals;
use Bitrix\Calendar\Ui\CalendarFilter;
use Bitrix\Calendar\UserField\ResourceBooking;
use Bitrix\Calendar\UserSettings;
use Bitrix\Calendar\Util;
use Bitrix\Main\Error;
use Bitrix\Main\Localization\Loc;
use Bitrix\Calendar\Integration\Bitrix24Manager;
use Bitrix\Intranet;
use Bitrix\Main\Loader;

\CModule::IncludeModule('im');

Loc::loadMessages($_SERVER['DOCUMENT_ROOT'].BX_ROOT.'/modules/calendar/lib/controller/calendarajax.php');

function stripWhitespaces($string)
{
    $old_string = $string;
    $string = strip_tags($string);
    $string = preg_replace('/([^\pL\pN\pP\pS\pZ])|([\xC2\xA0])/u', ' ', $string);
    $string = str_replace('  ', ' ', $string);
    $string = trim($string);

    if ($string === $old_string) {
        return $string;
    } else {
        return stripWhitespaces($string);
    }
}

class ArtMaxEventEmbending{
    protected $eventId = null;

    static function updateEventFields(array $event, array $fields): void
    {
        global $DB;

        if (!$fields)
        {
            return;
        }
        \CTimeZone::Disable();



        $strSql = "UPDATE b_calendar_event SET ".
            $DB->PrepareUpdate("b_calendar_event", $fields)
            . " WHERE ID=" . (int)$event['ID'];
        $DB->Query($strSql);
        //echo $strSql."<br/>";

        \CTimeZone::Enable();
    }
    public static function GetByID($ID, $table = 'b_calendar_event',$return_reccurence = false)
    {
        global $DB; //`b_calendar_event`
        $strSql = "SELECT * FROM $table WHERE `ID` = $ID";
        $res = $DB->Query($strSql, false, "Ошибка");

        if ($record = $res->fetch()) {
            return $record;
        }
        else
            return false;
    }
    public static function getEventByReccurenceId($reccurence_id) //RECURRENCE_ID
    {
        global $DB;
        $strSql = "SELECT * FROM `b_calendar_event` WHERE `RECURRENCE_ID` = $reccurence_id AND `CAL_TYPE` = 'company_calendar' ORDER BY `b_calendar_event`.`ID` DESC LIMIT 1";
        $res = $DB->Query($strSql, false, "Ошибка");

        if($record = $res->fetch()){
            return $record;
        }
        else return false;
    }
    public static function createDeal($title,$price,$contactId,$serviceDoctor,$lead_id,$serviceName,$region,$dateFrom,$duration = 30)
    {
        global $USER_FIELD_MANAGER;
        $fieldsInfo = \CCrmDeal::GetFieldsInfo();
        foreach ($fieldsInfo as $code => &$field)
        {
            $field['CAPTION'] = \CCrmDeal::GetFieldCaption($code);
        }

        $userType = new \CCrmUserType(
            $USER_FIELD_MANAGER,
            \CCrmDeal::$sUFEntityID
        );
        $userType->PrepareFieldsInfo($fieldsInfo);

        $LeadFieldsInfo = \CCrmLead::GetFieldsInfo();
        $typesID = array_keys( \CCrmFieldMulti::GetEntityTypeInfos() );
        foreach($typesID as $typeID)
        {
            $LeadFieldsInfo[$typeID] = [
                'TYPE' => 'crm_multifield',
                'ATTRIBUTES' => [\CCrmFieldInfoAttr::Multiple]
            ];
        }

        foreach ($LeadFieldsInfo as $code => &$field)
        {
            $field['CAPTION'] = \CCrmLead::GetFieldCaption($code);
        }

        $userType = new \CCrmUserType(
            $USER_FIELD_MANAGER,
            \CCrmLead::$sUFEntityID
        );
        $userType->PrepareFieldsInfo($LeadFieldsInfo);

        foreach ($LeadFieldsInfo['UF_CRM_1678096558']['ITEMS'] as $lead_region_item){
            if( $lead_region_item['ID'] == $region ){
                $region = $lead_region_item['VALUE'];
                break;
            }
        }

        $serviceDoctorID = null;
        foreach ($fieldsInfo['UF_CRM_1655488213455']['ITEMS'] as $key => $doctor_item) {
            if (stripWhitespaces($doctor_item['VALUE']) == stripWhitespaces($serviceDoctor)) {
                $serviceDoctorID = $doctor_item['ID'];
                break;
            }
        }
        foreach ($fieldsInfo['UF_CRM_6405B9B55548C']['ITEMS'] as $key => $region_item) {
            if (stripWhitespaces($region_item['VALUE']) == stripWhitespaces($region)) {
                $region = $region_item['ID'];
                break;
            }
        }

        $entityFields = [
            'TITLE'    => 'Сделка: '.$title,
            'STAGE_ID' => 'NEW',
            'PROBABILITY' => '100',
            'CURRENCY_ID' => 'RUB',
            'UF_CRM_1655487439761' => $price,
            'CONTACT_IDS' => [
                $contactId,
            ],
            "LEAD_ID" => $lead_id,
            "UF_CRM_1590412209544" => ["user|13|".$dateFrom."|30|".$serviceName],
            "UF_CRM_1655488213455" => $serviceDoctorID,
            "UF_CRM_6405B9B55548C" => [$region],
            'OPENED' => 'Y',
            'ASSIGNED_BY_ID' => \CCrmSecurityHelper::GetCurrentUserID(),
            'SOURCE_ID' => 'OTHER',
        ];


        $entityObject = new \CCrmDeal( true );

        $entityId = $entityObject->Add(
            $entityFields,
            $bUpdateSearch = true,
            $arOptions = [
                'CURRENT_USER' => \CCrmSecurityHelper::GetCurrentUserID(),
                'DISABLE_USER_FIELD_CHECK' => false,
                'DISABLE_REQUIRED_USER_FIELD_CHECK' => false,
            ]
        );
        //echo "dID: ";
        //print_r($entityId);
        if ( !$entityId )
        {
            print_r($entityFields);
        }
        // Явный вызов событий, связанных с роботом
        \Bitrix\Crm\Automation\Factory::runOnAdd(\CCrmOwnerType::Deal, $entityId);

        return $entityId;
    }
    public static function updateDeal($deal_id,$title,$price,$contactId,$serviceDoctor,$lead_id,$serviceName,$region,$dateFrom,$duration = 30)
    {
        global $USER_FIELD_MANAGER;
        $fieldsInfo = \CCrmDeal::GetFieldsInfo();
        foreach ($fieldsInfo as $code => &$field)
        {
            $field['CAPTION'] = \CCrmDeal::GetFieldCaption($code);
        }

        $userType = new \CCrmUserType(
            $USER_FIELD_MANAGER,
            \CCrmDeal::$sUFEntityID
        );
        $userType->PrepareFieldsInfo($fieldsInfo);

        $LeadFieldsInfo = \CCrmLead::GetFieldsInfo();
        $typesID = array_keys( \CCrmFieldMulti::GetEntityTypeInfos() );
        foreach($typesID as $typeID)
        {
            $LeadFieldsInfo[$typeID] = [
                'TYPE' => 'crm_multifield',
                'ATTRIBUTES' => [\CCrmFieldInfoAttr::Multiple]
            ];
        }

        foreach ($LeadFieldsInfo as $code => &$field)
        {
            $field['CAPTION'] = \CCrmLead::GetFieldCaption($code);
        }

        $userType = new \CCrmUserType(
            $USER_FIELD_MANAGER,
            \CCrmLead::$sUFEntityID
        );
        $userType->PrepareFieldsInfo($LeadFieldsInfo);

        foreach ($LeadFieldsInfo['UF_CRM_1678096558']['ITEMS'] as $lead_region_item){
            if( $lead_region_item['ID'] == $region ){
                $region = $lead_region_item['VALUE'];
                break;
            }
        }

        $serviceDoctorID = null;
        foreach ($fieldsInfo['UF_CRM_1655488213455']['ITEMS'] as $key => $doctor_item) {
            if (stripWhitespaces($doctor_item['VALUE']) == stripWhitespaces($serviceDoctor)) {
                $serviceDoctorID = $doctor_item['ID'];
                break;
            }
        }
        foreach ($fieldsInfo['UF_CRM_6405B9B55548C']['ITEMS'] as $key => $region_item) {
            if (stripWhitespaces($region_item['VALUE']) == stripWhitespaces($region)) {
                $region = $region_item['ID'];
                break;
            }
        }

        $entityFields = [
            'TITLE' => 'Сделка: '.$title,
            'UF_CRM_1655487439761' => $price,
            "UF_CRM_1590412209544" => ["user|13|".$dateFrom."|30|".$serviceName],
            "UF_CRM_1655488213455" => $serviceDoctorID,
            "UF_CRM_6405B9B55548C" => [$region],
            "LEAD_ID" => $lead_id,
            //"UF_CRM_1655488213455" => $serviceDoctor,
            'CONTACT_IDS' => [
                $contactId,
            ],
        ];

        $entityObject = new \CCrmDeal( true );

        $res = $entityObject->Update(
            $deal_id,
            $entityFields,
            $bCompare = true,
            $bUpdateSearch = true,
            $arOptions = [
                'CURRENT_USER' => \CCrmSecurityHelper::GetCurrentUserID(),
                'REGISTER_SONET_EVENT' => true,
                'ENABLE_SYSTEM_EVENTS' => true,
                'SYNCHRONIZE_STAGE_SEMANTICS' => true,
                'DISABLE_USER_FIELD_CHECK' => false,
                'DISABLE_REQUIRED_USER_FIELD_CHECK' => false,
            ]
        );
        echo $deal_id;
        echo "<pre>";
            print_r($entityFields);
        echo "</pre>";
        //die();
    }
    public static function createLeadContact($userId,$name,$phone)
    {
        $contactFields = [
            'NAME'        => $name,
            "FM"          => [
                "PHONE" => [
                    "n0" => [
                        "VALUE"      => $phone,
                        "VALUE_TYPE" => "WORK",
                    ],
                ],
            ],
            'COMPANY_IDS' => [],
            // Технические поля
            "OPENED" => "Y", // "Доступен для всех" = Да
            "ASSIGNED_BY_ID" => $userId,

            // Поля для маркетинга
            'SOURCE_ID' => 'WEB',
        ];


        $contactEntity = new \CCrmContact( true );

        $contactId = $contactEntity->Add(
            $contactFields,
            $bUpdateSearch = true,
            $arOptions = [
                'CURRENT_USER' => \CCrmSecurityHelper::GetCurrentUserID(),
            ]
        );

        return $contactId;
    }
    public static function createEventLead($title,$service_region,$contactFrom,$phone,$userId,$sum) //OPPORTUNITY_WITH_CURRENCY
    {
        $oLead = new \CCrmLead(false);
        $arFields = array(
            "TITLE" => $title." ".$phone,
            "NAME" => $title,
            "STATUS_ID" => 'CONVERTED',
            "OPENED" => "Y",
            "COMMENTS" => "",
            "OPPORTUNITY" => $sum,
            "STATUS_SEMANTIC_ID" => "S",
            "COMPANY_TITLE" => "",
            "UF_CRM_1678096558" => [$service_region], // Регион
            "UF_CRM_1723449198981" => $contactFrom,
            "SOURCE_ID" => "SELF",
            "FM" => Array(
                'PHONE' => array(
                    'n0' => array(
                        'VALUE' => $phone,
                        'VALUE_TYPE' => 'WORK'
                    )
                ) ,
            ) ,
        );
        $LEAD_ID = $oLead->Add($arFields, true, array(
            'CURRENT_USER' => $userId
        ));

        return $LEAD_ID;
    }
    public static function deleteLead($id)
    {
        $leadEntity = new \CCrmLead( true );

        $deleteResult = $leadEntity->Delete(
            $id,
            [
                'CURRENT_USER' => \CCrmSecurityHelper::GetCurrentUserID(),
                'PROCESS_BIZPROC' => true,
                'ENABLE_DEFERRED_MODE' => \Bitrix\Crm\Settings\LeadSettings::getCurrent()->isDeferredCleaningEnabled(),
                'ENABLE_DUP_INDEX_INVALIDATION' => true
            ]
        );

        if ( !$deleteResult )
        {
            // Операция не удалась
            var_dump($leadEntity->LAST_ERROR);
        }
    }
    public function setEventId($event_id) {
        $this->eventId = $event_id;

        return true;
    }
    public function createEvent($entryFields,$arUFFields,$recurrenceEventMode,$currentEventDate,$sendInvitesAgain,$requestUid,$doCheckOccupancy)
    {
        $newId = \CCalendar::SaveEvent([
            'arFields' => $entryFields,
            'UF' => $arUFFields,
            'silentErrorMode' => false,
            'recursionEditMode' => $recurrenceEventMode,
            'currentEventDateFrom' => $currentEventDate,
            'sendInvitesToDeclined' => $sendInvitesAgain,
            'requestUid' => $requestUid,
            'checkLocationOccupancy' => $doCheckOccupancy,
        ]);

        return $newId;
    }

    public static function updateBookingResource($id,$params)
    {
        global $DB;

        if (!$params)
        {
            return;
        }

        $strSql = "UPDATE b_calendar_resource SET ".
            $DB->PrepareUpdate("b_calendar_resource", $params)
            . " WHERE ID=" . (int)$id . "; ";
        $DB->Query($strSql);


        \CTimeZone::Enable();
    }
    public static function getBookingResource($parent_id): array
    {
        global $DB;
        $strSql = "SELECT * FROM `b_calendar_resource` WHERE `PARENT_ID` = $parent_id";

        $res = $DB->Query($strSql, false, "Ошибка");

        $arResult = [];
        while ($record = $res->fetch()){
            $arResult[]=$record;
        }
        return $arResult;
    }
    public static function updateLead($lead_id,$arFields)
    {
        $lead_fields = \CCrmLead::GetByID($lead_id, false);
        $leadEntity = new \CCrmLead(true);

        if (isset($lead_fields['ID'])) {

            $leadEntity->Update($lead_id, $arFields,
                true,
                true,
                array('DISABLE_USER_FIELD_CHECK' => true));

                $lead_fields = \CCrmLead::GetByID($lead_id, false);
                return $lead_fields;
        }
        else return false;
    }
    public static function updateContact($id,$name,$phone)
    {
        $contactEntity = new \CCrmContact(true);

        $dbCont = \CCrmFieldMulti::GetList(
            array('ID' => 'asc'), //сортировка
            array(
                'ELEMENT_ID' => $id,
                'ENTITY_ID' => "CONTACT", //"CONTACT","LEAD","DEAL"
                'TYPE_ID' => "PHONE",
            ) //фильтр
        );
        if ($phoneData = $dbCont->Fetch()) {
            $contactFields = [
                'NAME' => $name,
                "FM" => array(
                    "PHONE" => [
                        $phoneData['ID'] => [
                            "VALUE" => $phone,
                            "VALUE_TYPE" => "WORK",
                        ],
                    ],
                )
            ];

            $contactEntity->Update($id, $contactFields);
        }
    }
    public static function getContactData($id)
    {
        $fields = \CCrmContact::GetByID($id, false);
        $dbCont = \CCrmFieldMulti::GetList(
            array('ID' => 'asc'), //сортировка
            array(
                'ELEMENT_ID' => $id,
                'ENTITY_ID' => "CONTACT", //"CONTACT","LEAD","DEAL"
                'TYPE_ID' => "PHONE",
            ) //фильтр
        );
        if($arCont = $dbCont->Fetch()){
            $fields['PHONE'] = $arCont['VALUE'];
            return $fields;
        }
        else return  false;
    }
}

/**
 * Class CalendarEntryAjax
 */
class CalendarEntryAjax extends \Bitrix\Main\Engine\Controller
{
	protected const DIRECTION_PREVIOUS = 'previous';
	protected const DIRECTION_NEXT = 'next';
	protected const DIRECTION_BOTH = 'both';

	public function configureActions(): array
	{
		return [];
	}

	public function getNearestEventsAction()
	{
		if (Loader::includeModule('intranet') && !\Bitrix\Intranet\Util::isIntranetUser())
		{
			return [];
		}

		$request = $this->getRequest();
		$calendarType = $request->getPost('type');
		$futureDaysAmount = (int)$request->getPost('futureDaysAmount');
		$maxEntryAmount = (int)$request->getPost('maxEntryAmount');

		$entries = \CCalendar::getNearestEventsList([
				'bCurUserList' => true,
				'fromLimit' => \CCalendar::Date(time(), false),
				'toLimit' => \CCalendar::Date(time() + \CCalendar::DAY_LENGTH * $futureDaysAmount, false),
				'type' => $calendarType,
				'maxAmount' => $maxEntryAmount
			]
		);

		return [
			'entries' => $entries,
		];
	}

	public function loadEntriesAction()
	{
        // Тут загружаются события
		$request = $this->getRequest();
		$monthFrom = (int)$request->getPost('month_from');
		$yearFrom = (int)$request->getPost('year_from');
		$monthTo = (int)$request->getPost('month_to');
		$yearTo = (int)$request->getPost('year_to');
		$ownerId = (int)$request->getPost('ownerId');
		$calendarType = $request->getPost('type');

		$direction = $request->getPost('direction');
		if (!in_array($direction, [self::DIRECTION_PREVIOUS, self::DIRECTION_NEXT, self::DIRECTION_BOTH], true))
		{
			$direction = null;
		}

		$activeSectionIds = is_array($request->getPost('active_sect'))
			? $request->getPost('active_sect')
			: [];
		$additionalSectionIds = is_array($request->getPost('sup_sect'))
			? $request->getPost('sup_sect')
			: [];

		$sections = [];
		$limits = $this->getLimitDates($yearFrom, $monthFrom, $yearTo, $monthTo);

		$connections = false;
		$fetchTasks = false;
		$sectionIdList = [];

		foreach(array_unique(array_merge($activeSectionIds, $additionalSectionIds)) as $sectId)
		{
			if ($sectId === 'tasks')
			{
				$fetchTasks = true;
			}
			elseif ((int)$sectId > 0)
			{
				$sectionIdList[] = (int)$sectId;
			}
		}

		if (!empty($sectionIdList))
		{
			$sect = \CCalendarSect::GetList([
				'arFilter' => [
					'ID'=> $sectionIdList,
					'ACTIVE' => 'Y'
				],
				'checkPermissions' => true
			]);
			foreach($sect as $section)
			{
				$sections[] = (int)$section['ID'];
			}
		}

		$isBoundaryOfPastReached = false;
		$isBoundaryOfFutureReached = false;
		$entries = [];
		if (!empty($sections))
		{
			$entries = $this->getEntries($sections, $limits);
            /* echo "<pre>";
                print_r($entries);
            echo "</pre>";
            http_response_code(500);
            return false; */

			if (
				$direction === self::DIRECTION_BOTH
				&& count($this->getShownEntries($entries)) < 5
			)
			{
				$isBoundaryOfPastReached = true;
				$isBoundaryOfFutureReached = true;
				//Load all events
				$limits = [
					'from' => false,
					'to' => false,
				];
				$entries = $this->getEntries($sections, $limits);

				if (!empty($entries))
				{
					$earliestEvent = $this->getEarliestEvent($entries);
					$timestamp = strtotime($earliestEvent['DATE_FROM']);
					if($timestamp < strtotime("01.$monthFrom.$yearFrom"))
					{
						$yearFrom = (int)date('Y', $timestamp);
						$monthFrom = (int)date('m', $timestamp);
					}

					$latestEvent = $this->getLatestEvent($entries);
					$timestamp = strtotime($latestEvent['DATE_FROM']);
					if($timestamp > strtotime("01.$monthTo.$yearTo"))
					{
						$yearTo = (int)date('Y', $timestamp);
						$monthTo = (int)date('m', $timestamp);
						[$yearTo, $monthTo] = $this->getValidYearAndMonth($yearTo, $monthTo + 1);
					}
				}
			}

			if (
				($direction === self::DIRECTION_PREVIOUS)
				&& !$this->hasArrayEntriesInMonth($entries, $yearFrom, $monthFrom)
			)
			{
				//Load one month further
				[$yearFrom, $monthFrom] = $this->getValidYearAndMonth($yearFrom, $monthFrom - 1);
				$entries = $this->getEntries($sections, $this->getLimitDates($yearFrom, $monthFrom, $yearTo, $monthTo));

				if (!$this->hasArrayEntriesInMonth($entries, $yearFrom, $monthFrom))
				{
					//Load half year further
					[$yearFrom, $monthFrom] = $this->getValidYearAndMonth($yearFrom, $monthFrom - 5);
					$limits = $this->getLimitDates($yearFrom, $monthFrom, $yearTo, $monthTo);
					$entries = $this->getEntries($sections, $limits);

					if (!$this->hasArrayEntriesInRange($entries, $yearFrom, $monthFrom, (int)$request->getPost('year_from'), (int)$request->getPost('month_from')))
					{
						$isBoundaryOfPastReached = true;
						//Load all events
						$limits['from'] = false;
						$entries = $this->getEntries($sections, $limits);

						if (!empty($entries))
						{
							$earliestEvent = $this->getEarliestEvent($entries);
							$timestamp = strtotime($earliestEvent['DATE_FROM']);
							$yearFrom = (int)date('Y', $timestamp);
							$monthFrom = (int)date('m', $timestamp);
						}
					}
				}
			}

			if (
				($direction === self::DIRECTION_NEXT)
				&& !$this->hasArrayEntriesInMonth($entries, $yearTo, $monthTo - 1)
			)
			{
				//Load one month further
				[$yearTo, $monthTo] = $this->getValidYearAndMonth($yearTo, $monthTo + 1);
				$entries = $this->getEntries($sections, $this->getLimitDates($yearFrom, $monthFrom, $yearTo, $monthTo));

				if (!$this->hasArrayEntriesInMonth($entries, $yearTo, $monthTo - 1))
				{
					//Load half year further
					[$yearTo, $monthTo] = $this->getValidYearAndMonth($yearTo, $monthTo + 5);
					$limits = $this->getLimitDates($yearFrom, $monthFrom, $yearTo, $monthTo);
					$entries = $this->getEntries($sections, $limits);

					if (!$this->hasArrayEntriesInRange($entries, (int)$request->getPost('year_to'), (int)$request->getPost('month_to') - 1, $yearTo, $monthTo - 1))
					{
						$isBoundaryOfFutureReached = true;
						//Load all events
						$limits['to'] = false;
						$entries = $this->getEntries($sections, $limits);

						if (!empty($entries))
						{
							$latestEvent = $this->getLatestEvent($entries);
							$timestamp = strtotime($latestEvent['DATE_FROM']);
							$yearTo = (int)date('Y', $timestamp);
							$monthTo = (int)date('m', $timestamp);
							[$yearTo, $monthTo] = $this->getValidYearAndMonth($yearTo, $monthTo + 1);
						}
					}
				}
			}
		}

		//  **** GET TASKS ****
		if ($fetchTasks)
		{
			$tasksEntries = \CCalendar::getTaskList(
				[
					'type' => $calendarType,
					'ownerId' => $ownerId,
				]
			);

			if (!empty($tasksEntries))
			{
				$entries = array_merge($entries, $tasksEntries);
			}
		}

		$response = [
			'entries' => $entries,
			'userIndex' => \CCalendarEvent::getUserIndex(),
			'isBoundaryOfPastReached' => $isBoundaryOfPastReached,
			'isBoundaryOfFutureReached' => $isBoundaryOfFutureReached,
		];
		if (is_array($connections))
		{
			$response['connections'] = $connections;
		}

		if (
			(int)$request->getPost('month_from') !== $monthFrom
			|| (int)$request->getPost('year_from') !== $yearFrom
		)
		{
			$response['newYearFrom'] = $yearFrom;
			$response['newMonthFrom'] = $monthFrom;
		}

		if (
			(int)$request->getPost('month_to') !== $monthTo
			|| (int)$request->getPost('year_to') !== $yearTo
		)
		{
			$response['newYearTo'] = $yearTo;
			$response['newMonthTo'] = $monthTo;
		}

		return $response;
	}

	protected function getShownEntries(array $entries): array
	{
		return CalendarFilter::filterByShowDeclined($entries);
	}

	protected function getEntries(array $sections, array $limits): array
	{
		return \CCalendarEvent::GetList(
			[
				'arFilter' => [
					'SECTION' => $sections,
					'FROM_LIMIT' => $limits['from'],
					'TO_LIMIT' => $limits['to'],
				],
				'parseRecursion' => true,
				'fetchAttendees' => true,
				'userId' => \CCalendar::GetCurUserId(),
				'setDefaultLimit' => false,
			]
		);
	}

	protected function getValidYearAndMonth(int $year, int $month): array
	{
		if ($month <= 0)
		{
			return [$year - 1, $month + 12];
		}

		if ($month > 12)
		{
			return [$year + 1, $month - 12];
		}

		return [$year, $month];
	}

	protected function getLimitDates(int $yearFrom, int $monthFrom, int $yearTo, int $monthTo): array
	{
		$userTimezoneName = \CCalendar::GetUserTimezoneName(\CCalendar::GetUserId());
		$offset = Util::getTimezoneOffsetUTC($userTimezoneName);
		return [
			'from' => \CCalendar::Date(mktime(0, 0, 0, $monthFrom, 1, $yearFrom) - $offset, false),
			'to' => \CCalendar::Date(mktime(0, 0, 0, $monthTo, 1, $yearTo) - $offset, false),
		];
	}

	protected function hasArrayEntriesInMonth(array $entries, int $yearFrom, int $monthFrom): bool
	{
		return $this->hasArrayEntriesInRange($entries, $yearFrom, $monthFrom, $yearFrom, $monthFrom);
	}

	protected function hasArrayEntriesInRange(array $entries, int $yearFrom, int $monthFrom, int $yearTo, int $monthTo): bool
	{
		$monthsFrom = $yearFrom * 12 + $monthFrom;
		$monthsTo = $yearTo * 12 + $monthTo;
		$settings = UserSettings::get();
		$showDeclined = $settings['showDeclined'];
		foreach ($entries as $entry)
		{
			if (!$showDeclined && $entry['MEETING_STATUS'] === 'N')
			{
				continue;
			}

			$timestamp = strtotime($entry['DATE_FROM']);
			$entryYear = (int)date('Y', $timestamp);
			$entryMonth = (int)date('m', $timestamp);
			$entryMonths = $entryYear * 12 + $entryMonth;

			if ($entryMonths >= $monthsFrom && $entryMonths <= $monthsTo)
			{
				return true;
			}
		}
		return false;
	}

	protected function getEarliestEvent(array $entries): array
	{
		return array_reduce($entries, static function($firstEntry, $entry) {
			if (!$firstEntry)
			{
				return $entry;
			}
			if (strtotime($entry['DATE_FROM']) < strtotime($firstEntry['DATE_FROM']))
			{
				return $entry;
			}
			return $firstEntry;
		});
	}

	protected function getLatestEvent(array $entries): array
	{
		return array_reduce($entries, static function($lastEntry, $entry) {
			if (!$lastEntry)
			{
				return $entry;
			}
			if (strtotime($entry['DATE_FROM']) > strtotime($lastEntry['DATE_FROM']))
			{
				return $entry;
			}
			return $lastEntry;
		});
	}

	public function moveEventAction()
	{

		$request = $this->getRequest();
		$userId = \CCalendar::getCurUserId();
		$id = (int)$request->getPost('id');
		$sectionId = (int)$request->getPost('section');

        /*отправляем уведомление о новой сделке*/
        $attach = new \CIMMessageParamAttach(null, "#d32f2f");
        $attach->AddLink(Array(
            "NAME" => "Действие запрещено",
            "DESC" => "Действие запрещено!",
            "LINK" => ""
        ));
        $arMessageFields = array(
            "TO_USER_ID" => $userId,
            "FROM_USER_ID" => $userId,
            "NOTIFY_TYPE" => IM_NOTIFY_SYSTEM,
            "MESSAGE" => "Действие запрещено! Обновите страницу!",
            "ATTACH" => Array(
                $attach
            )
        );
        $mess = \CIMNotify::Add($arMessageFields);

        return [
            'id' => $id,
            'reload' => true,
            'busy_warning' => false,
            'location_busy_warning' => false
        ];
        die();

		if ($id)
		{
			$eventModel = \CCalendarEvent::getEventModelForPermissionCheck($id, [], $userId);
		}
		else
		{
			$section = \CCalendarSect::GetById($sectionId);

			$eventModel =
				EventModel::createNew()
					->setOwnerId((int)($section['OWNER_ID'] ?? 0))
					->setSectionId($sectionId ?? 0)
					->setSectionType($section['TYPE'] ?? '')
			;
		}
		$accessController = new EventAccessController($userId);
		if (
			(!$id && !$accessController->check(ActionDictionary::ACTION_EVENT_ADD, $eventModel))
			|| ($id && !$accessController->check(ActionDictionary::ACTION_EVENT_EDIT, $eventModel))
		)
		{
			$this->addError(new Error(Loc::getMessage('EC_ACCESS_DENIED'), 'move_entry_access_denied'));
		}

		$sectionList = Internals\SectionTable::getList([
			   'filter' => [
				   '=ACTIVE' => 'Y',
				   '=ID' => $sectionId
			   ],
			   'select' => [
				   'ID',
				   'CAL_TYPE',
				   'OWNER_ID',
				   'NAME'
			   ]
		   ]
		);

		if (!($section = $sectionList->fetch()))
		{
			$this->addError(new Error(Loc::getMessage('EC_SECTION_NOT_FOUND'), 'edit_entry_section_not_found'));
		}

		if (
			$section['CAL_TYPE'] !== 'group'
			&& Loader::includeModule('intranet') && !Intranet\Util::isIntranetUser($userId)
		)
		{
			$this->addError(new Error(Loc::getMessage('EC_ACCESS_DENIED'), 'edit_entry_extranet_access_denied'));
		}


		if (empty($this->getErrors()))
		{
			$entry = Internals\EventTable::getList(
				[
					"filter" => [
						"=ID" => $id,
						"=DELETED" => 'N',
						"=SECTION_ID" => $sectionId
					],
					"select" => ["ID", "CAL_TYPE"]
				]
			)->fetch();

			if (Loader::includeModule('intranet'))
			{
				if ($entry['CAL_TYPE'] !== 'group' && !Intranet\Util::isIntranetUser($userId))
				{
					$this->addError(new Error(Loc::getMessage('EC_ACCESS_DENIED'), 'edit_entry_extranet_access_denied'));
				}
			}
		}

		$requestUid = (int)$request->getPost('requestUid');
		$reload = $request->getPost('recursive') === 'Y';
		$sendInvitesToDeclined = $request->getPost('sendInvitesAgain') === 'Y';
		$skipTime = $request->getPost('skip_time') === 'Y';
		$dateFrom = $request->getPost('date_from');
		$dateTo = $request->getPost('date_to');
		$timezone = $request->getPost('timezone');
		$attendees = $request->getPost('attendees');
		$location = trim((string) $request->getPost('location'));
		$isPlannerFeatureEnabled = Bitrix24Manager::isPlannerFeatureEnabled();

		$locationBusyWarning = false;
		$busyWarning = false;

		if (empty($this->getErrors()))
		{
			$arFields = [
				"ID" => $id,
				"DATE_FROM" => \CCalendar::Date(\CCalendar::Timestamp($dateFrom), !$skipTime),
				"SKIP_TIME" => $skipTime
			];

			if (!empty($dateTo))
			{
				$arFields["DATE_TO"] = \CCalendar::Date(\CCalendar::Timestamp($dateTo), !$skipTime);
			}

			if (!$skipTime && $request->getPost('set_timezone') === 'Y' && $timezone)
			{
				$arFields["TZ_FROM"] = $timezone;
				$arFields["TZ_TO"] = $timezone;
			}

			if (
				$isPlannerFeatureEnabled
				&& !empty($location)
				&& !Rooms\AccessibilityManager::checkAccessibility($location, ['fields' => $arFields])
			)
			{
				$locationBusyWarning = true;
				$reload = true;
			}

			if (
				$isPlannerFeatureEnabled
				&& is_array($attendees)
				&& $request->getPost('is_meeting') === 'Y'
			)
			{
				$timezoneName = \CCalendar::GetUserTimezoneName(\CCalendar::GetUserId());
				$timezoneOffset = Util::getTimezoneOffsetUTC($timezoneName);
				$timestampFrom = \CCalendar::TimestampUTC($arFields["DATE_FROM"]) - $timezoneOffset;
				$timestampTo = \CCalendar::TimestampUTC($arFields["DATE_TO"]) - $timezoneOffset;
				if (!empty($this->getBusyUsersIds($attendees, $id, $timestampFrom, $timestampTo)))
				{
					$busyWarning = true;
					$reload = true;
				}
			}

			if (!$busyWarning && !$locationBusyWarning)
			{
				if ($request->getPost('recursive') === 'Y')
				{
					\CCalendar::SaveEventEx(
						[
							'arFields' => $arFields,
							'silentErrorMode' => false,
							'recursionEditMode' => 'this',
							'currentEventDateFrom' => \CCalendar::Date(
								\CCalendar::Timestamp($request->getPost('current_date_from')),
								false
							),
							'sendInvitesToDeclined' => $sendInvitesToDeclined,
							'requestUid' => $requestUid
						]
					);
				}
				else
				{
					$id = \CCalendar::SaveEvent(
						[
							'arFields' => $arFields,
							'silentErrorMode' => false,
							'sendInvitesToDeclined' => $sendInvitesToDeclined,
							'requestUid' => $requestUid
						]
					);
				}
			}
		}

		return [
			'id' => $id,
			'reload' => $reload,
			'busy_warning' => $busyWarning,
			'location_busy_warning' => $locationBusyWarning
		];
	}

	public function editEntryAction()
	{
		$response = [];
		$request = $this->getRequest();

		$id = (int)$request['id'];
		$sectionId = (int)$request['section'];
		$requestUid = (int)$request['requestUid'];
		$userId = \CCalendar::getCurUserId();
		$isPlannerFeatureEnabled = Bitrix24Manager::isPlannerFeatureEnabled();
		$checkCurrentUsersAccessibility = !$id || $request->getPost('checkCurrentUsersAccessibility') !== 'N';

		if ($id)
		{
			$eventModel = \CCalendarEvent::getEventModelForPermissionCheck($id, [], $userId);
		}
		else
		{
			$section = \CCalendarSect::GetById($sectionId, false);

			$eventModel =
				EventModel::createNew()
					->setOwnerId((int)($section['OWNER_ID'] ?? 0))
					->setSectionId($sectionId)
					->setSectionType($section['CAL_TYPE'] ?? '')
			;
		}
		$accessController = new EventAccessController($userId);
		if (
			(!$id && !$accessController->check(ActionDictionary::ACTION_EVENT_ADD, $eventModel))
			|| ($id && !$accessController->check(ActionDictionary::ACTION_EVENT_EDIT, $eventModel))
		)
		{
			$this->addError(new Error(Loc::getMessage('EC_ACCESS_DENIED'), 'edit_entry_access_denied'));
		}

		if (!empty($this->getErrors()))
		{
			return $response;
		}

		$sectionList = Internals\SectionTable::getList([
				'filter' => [
					'=ACTIVE' => 'Y',
					'=ID' => $sectionId
				],
				'select' => [
					'ID',
					'CAL_TYPE',
					'OWNER_ID',
					'NAME'
				]
			]
		);

		if (!($section = $sectionList->fetch()))
		{
			$this->addError(new Error(Loc::getMessage('EC_SECTION_NOT_FOUND'), 'edit_entry_section_not_found'));
		}

		if (
			$section['CAL_TYPE'] !== 'group'
			&& Loader::includeModule('intranet') && !Intranet\Util::isIntranetUser($userId)
		)
		{
			$this->addError(new Error(Loc::getMessage('EC_ACCESS_DENIED'), 'edit_entry_extranet_access_denied'));
		}

		if (!empty($this->getErrors()))
		{
			return $response;
		}

		// Default name for events
		$name = trim($request['name']);
		$fio = trim($request['fio']);
        $is_full_form = false;
        if( !isset($request['serviceName']) ){
            $is_full_form = true;
        }

        $serviceName = trim($request['serviceName']);
        $serviceDuration = trim($request['serviceDuration']);
        $serviceRegion = trim($request['serviceRegion']);
        $servicePrice = trim($request['servicePrice']);
        $serviceDoctor = trim($request['serviceDoctor']);
        $serviceComment = trim($request['serviceComment']);
        $contactFrom = trim($request['contactFrom']);

		$phone = trim($request['phone']);
		if (empty($name))
		{
			$name = Loc::getMessage('EC_DEFAULT_EVENT_NAME_V2');
		}
		$reminderList = \CCalendarReminder::prepareReminder($request['reminder']);

		$rrule = $this->prepareRecurringRule($request['EVENT_RRULE'], $request['rrule_endson']);

		// Date & Time
		$dateFrom = $request['date_from'];
        $dateTo = $request['date_to'];
		$skipTime = isset($request['skip_time']) && $request['skip_time'] === 'Y';
		if (!$skipTime)
		{
			$dateFrom .= ' '.$request['time_from'];
			$dateTo .= ' '.$request['time_to'];
		}
		$dateFrom = trim($dateFrom);
		$dateTo = trim($dateTo);


		// Timezone
		$tzFrom = $request['tz_from'];
		$tzTo = $request['tz_to'];
		if (!$tzFrom && isset($request['default_tz']))
		{
			$tzFrom = $request['default_tz'];
		}
		if (!$tzTo && isset($request['default_tz']))
		{
			$tzTo = $request['default_tz'];
		}

		if (isset($request['default_tz']) && (string)$request['default_tz'] !== '')
		{
			\CCalendar::SaveUserTimezoneName(\CCalendar::GetUserId(), $request['default_tz']);
		}

         /* Реализация сохранения названия события по привязанному контакту */
        $artMaxUFFields = [];
        foreach($request as $field => $value)
        {
            if (mb_strpos($field, 'UF_') === 0)
            {
                $artMaxUFFields[$field] = $value;
            }
        }

        $has_attempted_lead = false;
        $attempted_lead_data = null;

        foreach ($artMaxUFFields as $field => $value) {
            if ($field === 'UF_CRM_CAL_EVENT') {
                foreach ($value as $contact_code) {
                    $lead_id = explode('_', $contact_code);
                    if ($lead_id[0] == 'L') {
                        $lead_fields = \CCrmLead::GetByID($lead_id[1], false);
                        $has_attempted_lead = true;
                        $attempted_lead_data = $lead_fields;

                        /* if ($lead_fields['CONTACT_ID'] != "" && $lead_fields['CONTACT_ID'] != false) {
                            $c_fields = \CCrmContact::GetByID($lead_fields['CONTACT_ID'], false);
                            $dbCont = \CCrmFieldMulti::GetList(
                                array('ID' => 'asc'), //сортировка
                                array(
                                    'ELEMENT_ID' => $lead_fields['CONTACT_ID'],
                                    'ENTITY_ID' => "CONTACT", //"CONTACT","LEAD","DEAL"
                                    'TYPE_ID' => "PHONE",
                                ) //фильтр
                            );
                            if ($arCont = $dbCont->Fetch()) {
                                //$arCont["VALUE"] там значение

                                $contact_phone = $arCont['VALUE'];
                                $contact_full_name = $c_fields['FULL_NAME'];
                            }
                        } */
                    }
                }
            }
        }
        $artMaxEmbending = new ArtMaxEventEmbending();

        if( isset($request['rec_edit_mode']) && $request['rec_edit_mode'] == "this" ){
            $pre_event_object = $artMaxEmbending::getEventByReccurenceId($id);
        }
        else{
            $pre_event_object = $artMaxEmbending::GetByID($id);
        }

        /*if ($pre_event_object && $is_full_form){
            $dateFrom = $pre_event_object['DATE_FROM'];
            $dateTo = $pre_event_object['DATE_TO'];
        }*/

        if (!str_contains($name, $fio)) {
            $name .= " ".$fio;
        }
        if (!str_contains($name, $phone)) {
            $name .= " ".$phone;
        }

		$entryFields = [
			'ID' => $id,
			'DATE_FROM' => $dateFrom,
			'DATE_TO' => $dateTo,
			'SKIP_TIME' => $skipTime,
			'TZ_FROM' => $tzFrom,
			'TZ_TO' => $tzTo,
			'NAME' => ($name != "") ? $name : "Пустое событие",
			'FIO' => $fio,
			'PHONE' => $phone,
			//'DESCRIPTION' => trim($request['desc']),
			'SECTIONS' => [$sectionId],
			'COLOR' => $request['color'],
			'ACCESSIBILITY' => $request['accessibility'],
			'IMPORTANCE' => $request['importance'] ?? 'normal',
			'PRIVATE_EVENT' => $request['private_event'] === 'Y',
			'RRULE' => $rrule,
			'LOCATION' => $request['location'],
			'REMIND' => $reminderList,
			'SECTION_CAL_TYPE' => $section['CAL_TYPE'],
			'SECTION_OWNER_ID' => $section['OWNER_ID']
		];

		$codes = [];
		if (isset($request['attendeesEntityList']) && is_array($request['attendeesEntityList']))
		{
			$codes = Util::convertEntitiesToCodes($request['attendeesEntityList']);
		}

		$accessCodes = \CCalendarEvent::handleAccessCodes($codes, ['userId' => $userId]);

		$entryFields['IS_MEETING'] =
			$accessCodes !== ['U'.$userId] || in_array($entryFields['SECTION_CAL_TYPE'], ['group', 'company_calendar'], true)
		;

		$entryFields['ATTENDEES_CODES'] = $accessCodes;
		$entryFields['ATTENDEES'] = \CCalendar::GetDestinationUsers($accessCodes);

		$response['reload'] = true;

		if ($request['exclude_users'] && !empty($entryFields['ATTENDEES']))
		{
			$excludeUsers = explode(',', $request['exclude_users']);
			$entryFields['ATTENDEES_CODES'] = [];

			if (!empty($excludeUsers))
			{
				$entryFields['ATTENDEES'] = array_diff($entryFields['ATTENDEES'], $excludeUsers);
				foreach($entryFields['ATTENDEES'] as $attendee)
				{
					$entryFields['ATTENDEES_CODES'][] = 'U'. (int)$attendee;
				}
			}
		}
		else
		{
			$excludeUsers = [];
		}

		$meetingHost = (int)$request['meeting_host'];
		$chatId = (int)$request['chat_id'];

		if ($meetingHost)
		{
			$entryFields['MEETING_HOST'] = $meetingHost;
		}
		else
		{
			$entryFields['MEETING_HOST'] = \CCalendar::GetUserId();
		}

		$entryFields['MEETING'] = [
			'HOST_NAME' => \CCalendar::GetUserName($entryFields['MEETING_HOST']),
			'NOTIFY' => $request['meeting_notify'] === 'Y',
			'REINVITE' => $request['meeting_reinvite'] === 'Y',
			'ALLOW_INVITE' => $request['allow_invite'] === 'Y',
			'MEETING_CREATOR' => $entryFields['MEETING_HOST'],
			'HIDE_GUESTS' => $request['hide_guests'] === 'Y'
		];
		
		$recurrenceEventMode = !empty($request['rec_edit_mode']) ? $request['rec_edit_mode'] : null;
		$currentEventDate = !empty($request['current_date_from'])
			? \CCalendar::Date(\CCalendar::Timestamp($request['current_date_from']), false)
			: null
		;
		
		if ($chatId)
		{
			$entryFields['MEETING']['CHAT_ID'] = $chatId;
		}

		if (!Rooms\AccessibilityManager::checkAccessibility($entryFields['LOCATION'], ['fields' => $entryFields]))
		{
			$this->addError(new Error(Loc::getMessage('EC_LOCATION_BUSY'), 'edit_entry_location_busy'));
		}

		if ($entryFields['IS_MEETING'] && $isPlannerFeatureEnabled)
		{
			$attendees = [];
			if ($checkCurrentUsersAccessibility)
			{
				$attendees = $entryFields['ATTENDEES'];
			}
			else if (is_array($request['newAttendeesList']))
			{
				$attendees = array_diff($request['newAttendeesList'], $excludeUsers);
			}


			$timezoneName = \CCalendar::GetUserTimezoneName(\CCalendar::GetUserId());
			$timezoneOffset = Util::getTimezoneOffsetUTC($timezoneName);
			$timestampFrom = \CCalendar::TimestampUTC($dateFrom) - $timezoneOffset;
			$timestampTo = \CCalendar::TimestampUTC($dateTo) - $timezoneOffset;
			$busyUsers = $this->getBusyUsersIds($attendees, $id, $timestampFrom, $timestampTo);
			if (!empty($busyUsers))
			{
				$response['busyUsersList'] = \CCalendarEvent::getUsersDetails($busyUsers);
				$busyUserName = current($response['busyUsersList'])['DISPLAY_NAME'];
				$this->addError(new Error(Loc::getMessage('EC_USER_BUSY', ['#USER#' => $busyUserName]), 'edit_entry_user_busy'));
			}
		}

		if (!empty($this->getErrors()))
		{
			return $response;
		}

        // Userfields for event
        $arUFFields = [];
        foreach ($request as $field => $value) {
            if (mb_strpos($field, 'UF_') === 0) {
                $arUFFields[$field] = $value;
            }
        }

		$newId = false;

		try
		{
			$newId = \CCalendar::SaveEvent([
				'arFields' => $entryFields,
				'UF' => $arUFFields,
				'silentErrorMode' => false,
				'recursionEditMode' => $recurrenceEventMode,
				'currentEventDateFrom' => $currentEventDate,
				'sendInvitesToDeclined' => $request['sendInvitesAgain'] === 'Y',
				'requestUid' => $requestUid,
				'checkLocationOccupancy' => ($request['doCheckOccupancy'] ?? 'N') === 'Y',
			]);

		}
		catch (Rooms\OccupancyCheckerException $e)
		{
			$this->addError(new Error(Loc::getMessage('EC_LOCATION_BUSY_RECURRENCE'), 'edit_entry_location_busy_recurrence'));
			$this->addError(new Error($e->getMessage(), 'edit_entry_location_repeat_busy'));
		}

		$errors = \CCalendar::GetErrors();


		$eventList = [];
		$eventIdList = [$newId];

		if ($newId && empty($errors))
		{
			$response['entryId'] = $newId;

			$filter = [
				'ID' => $newId,
				'FROM_LIMIT' => \CCalendar::Date(
					\CCalendar::Timestamp($entryFields['DATE_FROM']) -
					\CCalendar::DAY_LENGTH * 10, false
				),
				'TO_LIMIT' => \CCalendar::Date(
					\CCalendar::Timestamp($entryFields['DATE_TO']) +
					\CCalendar::DAY_LENGTH * 90, false
				)
			];

			$eventList = \CCalendarEvent::GetList(
				[
					'arFilter' => $filter,
					'parseRecursion' => true,
					'fetchAttendees' => true,
					'userId' => \CCalendar::GetUserId(),
				]
			);

			if ($entryFields['IS_MEETING'])
			{
				\Bitrix\Main\FinderDestTable::merge(
					[
						'CONTEXT' => Util::getUserSelectorContext(),
						'CODE' => \Bitrix\Main\FinderDestTable::convertRights(
							$accessCodes,
							['U'. \CCalendar::GetUserId()]
						)
					]
				);
			}

			if (isset($_REQUEST['rec_edit_mode']) && in_array($_REQUEST['rec_edit_mode'], ['this', 'next']))
			{
				unset($filter['ID']);
				$filter['RECURRENCE_ID'] = ($eventList && $eventList[0] && $eventList[0]['RECURRENCE_ID']) ? $eventList[0]['RECURRENCE_ID'] : $newId;

				$resRelatedEvents = \CCalendarEvent::GetList(
					[
						'arFilter' => $filter,
						'parseRecursion' => true,
						'fetchAttendees' => true,
						'userId' => \CCalendar::GetUserId()
					]
				);

				foreach($resRelatedEvents as $ev)
				{
					$eventIdList[] = $ev['ID'];
				}
				$eventList = array_merge($eventList, $resRelatedEvents);
			}
			else if ($id && $eventList && $eventList[0] && \CCalendarEvent::CheckRecurcion($eventList[0]))
			{
				$recId = $eventList[0]['RECURRENCE_ID'] ?? $eventList[0]['ID'];

				if ($eventList[0]['RECURRENCE_ID'] && $eventList[0]['RECURRENCE_ID'] !== $eventList[0]['ID'])
				{
					unset($filter['RECURRENCE_ID']);
					$filter['ID'] = $eventList[0]['RECURRENCE_ID'];
					$resRelatedEvents = \CCalendarEvent::GetList(
						[
							'arFilter' => $filter,
							'parseRecursion' => true,
							'fetchAttendees' => true,
							'userId' => \CCalendar::GetUserId(),
						]
					);
					$eventIdList[] = $eventList[0]['RECURRENCE_ID'];
					$eventList = array_merge($eventList, $resRelatedEvents);
				}

				if ($recId)
				{
					unset($filter['ID']);
					$filter['RECURRENCE_ID'] = $recId;
					$resRelatedEvents = \CCalendarEvent::GetList(
						[
							'arFilter' => $filter,
							'parseRecursion' => true,
							'fetchAttendees' => true,
							'userId' => \CCalendar::GetUserId(),
						]
					);

					foreach($resRelatedEvents as $ev)
					{
						$eventIdList[] = $ev['ID'];
					}
					$eventList = array_merge($eventList, $resRelatedEvents);
				}
			}
		}
		else if (is_iterable($errors))
		{
			foreach ($errors as $error)
			{
				if (is_string($error))
				{
					$this->addError(new Error($error, 'send_invite_failed'));
				}
			}
		}

		$pathToCalendar = \CCalendar::GetPathForCalendarEx($userId);
		foreach($eventList as $ind => $event)
		{
			$eventList[$ind]['~URL'] = \CHTTP::urlAddParams($pathToCalendar, ['EVENT_ID' => $event['ID']]);
		}

		$response['eventList'] = $eventList;
		$response['eventIdList'] = $eventIdList;
		$response['countEventWithEmailGuestAmount'] = Bitrix24Manager::getCountEventWithEmailGuestAmount();

		$userSettings = UserSettings::get($userId);
		$userSettings['defaultReminders'][$skipTime ? 'fullDay' : 'withTime'] = $reminderList;
		UserSettings::set($userSettings, $userId);


        if ($newId && empty($errors)) {
            if( isset($request['rec_edit_mode']) && !empty($request['rec_edit_mode']) && ($request['rec_edit_mode'] != "this") ){
               return $response;
            }

            if( isset($request['rec_edit_mode']) && $request['rec_edit_mode'] == "this" ){
                $event = $artMaxEmbending::getEventByReccurenceId($newId);
            }
            else{
                $event = $artMaxEmbending::GetByID($newId);
            }



            if( is_null($event['RECURRENCE_ID']) ){
                $event['RECURRENCE_ID'] = $event['ID'];
            }

            if ($event) {

                function checkIsEmptyFields($fields){
                    $hasnt_empty = true;
                    foreach ($fields as $field){
                        if ( empty($field) || $field == "0" || $field == "-1" || $field == "" || $field == null || $field == 'undefined') {
                            $hasnt_empty = false;
                            break;
                        }
                    }

                    return $hasnt_empty;
                }

                $fieldsToCheck = [$fio,$phone,$serviceName,$serviceDuration,$servicePrice,$serviceRegion,$serviceDoctor];

                if( checkIsEmptyFields($fieldsToCheck) ){
                    $artMaxEmbending::updateEventFields($event, [
                        'FIO' => $fio,
                        'PHONE' => $phone,
                        'artmax_serviceName' => $serviceName,
                        'artmax_serviceDuration' => $serviceDuration,
                        'artmax_servicePrice' => $servicePrice,
                        'artmax_serviceRegion' => (int)$serviceRegion,
                        'artmax_serviceDoctor' => $serviceDoctor,
                    ]);
                }
                if( checkIsEmptyFields([$serviceComment]) ){
                    $artMaxEmbending::updateEventFields($event, [
                        'artmax_comment' => $serviceComment,
                        'DESCRIPTION' => $serviceComment,
                    ]);
                }
                if( checkIsEmptyFields([$contactFrom]) ){
                    $artMaxEmbending::updateEventFields($event, [
                        'contact_source' => $contactFrom,
                    ]);
                }

                if (!$is_full_form && checkIsEmptyFields($fieldsToCheck)) {

                    $lead_id = null;
                    $lead_data = null;

                    $contactId = null;

                    // Получаем лид
                    if($has_attempted_lead){
                        if(!is_null($event['artmax_lead_id'])){
                            $artMaxEmbending::deleteLead($event['artmax_lead_id']);
                        }

                        $artMaxEmbending::updateEventFields($event, [
                            'artmax_lead_id' => $attempted_lead_data['ID'],
                            'artmax_event_moved' => 1
                        ]);
                        $lead_id = $attempted_lead_data["ID"];
                        $lead_data = $attempted_lead_data;
                        $event['artmax_deal_id'] = null;
                    }
                    elseif ($event['artmax_lead_id'] == null && !$has_attempted_lead) { // пусто и там и там
                        $new_lead = $artMaxEmbending::createEventLead($fio." ".$phone, $serviceRegion,$contactFrom, $phone, $userId, $servicePrice);
                        $arUFFields['UF_CRM_CAL_EVENT'][0] = "L_" . $new_lead;

                        $artMaxEmbending::updateEventFields($event, [
                            'artmax_lead_id' => $new_lead,
                        ]);
                        $lead_id = $new_lead;
                        $lead_data = \CCrmLead::GetByID($new_lead, false);
                    }
                    elseif (!$has_attempted_lead && !is_null($event['artmax_lead_id'])) {
                        $arUFFields['UF_CRM_CAL_EVENT'][0] = "L_" . $event['artmax_lead_id'];
                        $lead_id = $event['artmax_lead_id'];
                        $lead_data = \CCrmLead::GetByID($event['artmax_lead_id'], false);

                        if(empty($lead_data)){ // По какой-то причине просрали лид
                            $new_lead = $artMaxEmbending::createEventLead($fio." ".$phone, $serviceRegion,$contactFrom, $phone, $userId, $servicePrice);
                            $arUFFields['UF_CRM_CAL_EVENT'][0] = "L_" . $new_lead;

                            $artMaxEmbending::updateEventFields($event, [
                                'artmax_lead_id' => $new_lead,
                            ]);

                            $lead_id = $new_lead;
                            $lead_data = \CCrmLead::GetByID($new_lead, false);
                        }
                    }

                    //Получаем контакт
                    if ($lead_data['CONTACT_ID'] != "" && $lead_data['CONTACT_ID'] != false) {
                        $contactId = $lead_data['CONTACT_ID'];
                    }
                    else{
                        $contactId = $artMaxEmbending::createLeadContact($userId, $fio, $phone);
                    }

                    //Обновляем лид
                    $lead_title = $fio." ".$phone." #" . $lead_id;
                    $leadFields = array(
                        "TITLE" => $lead_title,
                        "NAME" => $lead_title,
                        "OPPORTUNITY" => $servicePrice,
                        "UF_CRM_1678096558" => [$serviceRegion],
                        "UF_CRM_1723449198981" => [$contactFrom],
                        "CONTACT_ID" => $contactId
                    );

                    $artMaxEmbending::updateLead($lead_id,$leadFields);

                    //Работаем со сделкой
                    if ($event['artmax_deal_id'] == "" || $event['artmax_deal_id'] == null) {

                        $dealId = $artMaxEmbending::createDeal($fio . " " . $phone, $servicePrice, $contactId, $serviceDoctor,$lead_id,$serviceName,$serviceRegion,$dateFrom,$serviceDuration);
                        $artMaxEmbending::updateEventFields($event, [
                            'artmax_deal_id' => $dealId,
                        ]);
                        $resource_id = $artMaxEmbending::getBookingResource($dealId)[0]['ID'];
                        $artMaxEmbending::updateBookingResource($resource_id, [
                            'SERVICE_NAME' => $serviceName
                        ]);

                        /*отправляем уведомление о новой сделке*/
                        $attach = new \CIMMessageParamAttach(null, "#95c255");
                        $attach->AddLink(Array(
                            "NAME" => "Создана сделка № " . $dealId . "",
                            "DESC" => "Сделка создана автоматичски!",
                            "LINK" => "https://eyeclinicufa.ru//crm/deal/details/" . $dealId . "/"
                        ));
                        $arMessageFields = array(
                            "TO_USER_ID" => $userId,
                            "FROM_USER_ID" => $userId,
                            "NOTIFY_TYPE" => IM_NOTIFY_SYSTEM,
                            "MESSAGE" => "Создана новая сделка!",
                            "ATTACH" => Array(
                                $attach
                            )
                        );
                        $mess = \CIMNotify::Add($arMessageFields);
                        //\CMain::FinalActions();
                    }
                    else{
                        $artMaxEmbending::updateDeal($event['artmax_deal_id'],$fio . " " . $phone, $servicePrice, $contactId, $serviceDoctor,$lead_id,$serviceName,$serviceRegion,$dateFrom,$serviceDuration);
                        $resource_id = $artMaxEmbending::getBookingResource($event['artmax_deal_id'])[0]['ID'];
                        $artMaxEmbending::updateBookingResource($resource_id, [
                            'SERVICE_NAME' => $serviceName
                        ]);

                        /*отправляем уведомление о новой сделке*/
                        $attach = new \CIMMessageParamAttach(null, "#95c255");
                        $attach->AddLink(Array(
                            "NAME" => "Обновлена сделка № " . $event['artmax_deal_id'] . "",
                            "DESC" => "Сделка обновлена автоматичски!",
                            "LINK" => "https://eyeclinicufa.ru//crm/deal/details/" . $event['artmax_deal_id'] . "/"
                        ));
                        $arMessageFields = array(
                            "TO_USER_ID" => $userId,
                            "FROM_USER_ID" => $userId,
                            "NOTIFY_TYPE" => IM_NOTIFY_SYSTEM,
                            "MESSAGE" => "Обновлена сделка!",
                            "ATTACH" => Array(
                                $attach
                            )
                        );
                        $mess = \CIMNotify::Add($arMessageFields);
                        //\CMain::FinalActions();
                    }

                    $parent_event = $artMaxEmbending::GetById($event['RECURRENCE_ID'],'b_calendar_event',true);

                    $entryFields['ID'] = $event['ID'];
                    $entryFields['NAME'] = ( $name != ($parent_event['NAME']." ".$fio." ".$phone) ) ? $name : $event['NAME'];

                    \CCalendarEvent::UpdateUserFields($event['ID'],$arUFFields);

                }
                elseif($is_full_form && $has_attempted_lead && !is_null($event['artmax_lead_id'])){
                    $lead_id = $attempted_lead_data["ID"];
                    $lead_data = $attempted_lead_data;
                    $prev_lead_data = null;
                    $contactId = null;
                    $leadFields = array();

                    $prev_lead_data = \CCrmLead::GetByID($event['artmax_lead_id'], false);

                    //Получаем контакт
                    if ($lead_data['CONTACT_ID'] != "" && $lead_data['CONTACT_ID'] != false) {
                        $contactId = $lead_data['CONTACT_ID'];

                        // Если у предыдущего лида был контакт
                        if (!is_null($prev_lead_data) && $prev_lead_data['CONTACT_ID'] != "" && $prev_lead_data['CONTACT_ID'] != false){
                            $prev_contact = $artMaxEmbending::getContactData($prev_lead_data['CONTACT_ID']);
                            $current_contact = $artMaxEmbending::getContactData($contactId);

                            // и они не совпадают -> Проверка на заполненность контакта
                            if( $prev_contact['ID'] != $current_contact['ID'] ){
                                if( is_null($current_contact['NAME']) || $current_contact['NAME'] == "" ){
                                    if( !is_null($prev_contact['NAME']) && $prev_contact['NAME'] != "" ){
                                        if( !is_null($prev_contact['PHONE']) && $prev_contact['PHONE'] != "" ){
                                            $artMaxEmbending::updateContact($current_contact['ID'], $prev_contact['NAME'], $prev_contact['PHONE']);
                                        }
                                    }
                                }
                            }
                        }

                        //Обновляем лид
                        $lead_title = $fio." ".$phone." #" . $lead_id;
                        $leadFields = array(
                            "TITLE" => $lead_title,
                            "NAME" => $lead_title,
                            "CONTACT_ID" => $contactId,
                            "STATUS_ID" => 'CONVERTED',
                            "STATUS_SEMANTIC_ID" => "S",
                        );
                        if( !is_null($event['artmax_serviceRegion']) && $event['artmax_serviceRegion'] != "" ){
                            $leadFields['UF_CRM_1678096558'] = [$event['artmax_serviceRegion']];
                        }
                        if( !is_null($event['contact_source']) && $event['contact_source'] != "" ){
                            $leadFields['UF_CRM_1678096558'] = [$event['contact_source']];
                        }
                        if( !is_null($event['artmax_servicePrice']) && $event['artmax_servicePrice'] != "" ){
                            $leadFields['OPPORTUNITY'] = [$event['artmax_servicePrice']];
                        }
                    }
                    //иначе если у предыдущего лида есть контакт
                    elseif (!is_null($prev_lead_data) && $prev_lead_data['CONTACT_ID'] != "" && $prev_lead_data['CONTACT_ID'] != false){
                        // Если у предыдущего лида был контакт
                        if (!is_null($prev_lead_data) && $prev_lead_data['CONTACT_ID'] != "" && $prev_lead_data['CONTACT_ID'] != false){
                            $prev_contact = $artMaxEmbending::getContactData($prev_lead_data['CONTACT_ID']);
                            $contactId = $prev_contact['ID'];
                        }
                        else{
                            $contactId = $artMaxEmbending::createLeadContact($userId, $fio, $phone);
                        }

                        //Обновляем лид
                        $leadFields = array(
                            //"TITLE" => $lead_title,
                            //"NAME" => $lead_title,
                            "CONTACT_ID" => $contactId,
                            "STATUS_ID" => 'CONVERTED',
                            "STATUS_SEMANTIC_ID" => "S",
                        );
                        if( !is_null($event['artmax_serviceRegion']) && $event['artmax_serviceRegion'] != "" ){
                            $leadFields['UF_CRM_1678096558'] = [$event['artmax_serviceRegion']];
                        }
                        if( !is_null($event['contact_source']) && $event['contact_source'] != "" ){
                            $leadFields['UF_CRM_1678096558'] = [$event['contact_source']];
                        }
                        if( !is_null($event['artmax_servicePrice']) && $event['artmax_servicePrice'] != "" ){
                            $leadFields['OPPORTUNITY'] = $event['artmax_servicePrice'];
                        }
                    }

                    $artMaxEmbending::deleteLead($prev_lead_data['ID']);
                    $artMaxEmbending::updateEventFields($event, [
                        'artmax_lead_id' => $lead_data['ID'],
                    ]);

                    $artMaxEmbending::updateLead($lead_data['ID'],$leadFields);
                }
            }
        }

		return $response;
	}

	private function getBusyUsersIds(array $attendees, int $curEventId, int $fromTs, int $toTs): array
	{
		$usersToCheck = $this->getUsersToCheck($attendees);
		if (empty($usersToCheck))
		{
			return [];
		}

		return (new Accessibility())
			->setCheckPermissions(false)
			->setSkipEventId($curEventId)
			->getBusyUsersIds($usersToCheck, $fromTs, $toTs);
	}

	private function getUsersToCheck(array $attendees): array
	{
		$usersToCheck = [];
		foreach ($attendees as $attId)
		{
			if ((int)$attId !== \CCalendar::GetUserId())
			{
				$userSettings = UserSettings::get((int)$attId);
				if ($userSettings && $userSettings['denyBusyInvitation'])
				{
					$usersToCheck[] = (int)$attId;
				}
			}
		}
		return $usersToCheck;
	}

	private function prepareRecurringRule(array $rrule = null, ?string $endMode = 'never'): ?array
	{
		if (empty($rrule) || !is_array($rrule))
		{
			return null;
		}
		if (!isset($rrule['INTERVAL']) && $rrule['FREQ'] !== 'NONE')
		{
			$rrule['INTERVAL'] = 1;
		}
		if ($endMode === 'never')
		{
			unset($rrule['COUNT'], $rrule['UNTIL']);
		}
		elseif ($endMode === 'count')
		{
			if ((int)$rrule['COUNT'] <= 0)
			{
				$rrule['COUNT'] = 10;
			}
			unset($rrule['UNTIL']);
		}
		elseif ($endMode === 'until')
		{
			unset($rrule['COUNT']);
		}

		return $rrule;
	}
}
