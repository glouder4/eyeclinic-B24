<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/bitrix/modules/main/include/prolog_before.php');

    use \Bitrix\Main;
    global $USER_FIELD_MANAGER;
    function GetEventByID($ID)
    {
        global $DB;
        $strSql = "SELECT * FROM `b_calendar_event` WHERE `ID` = $ID";
        $res = $DB->Query($strSql, false, "Ошибка");

        $arResult = [];
        while ($record = $res->fetch()){
            $arResult[]=$record;
        }
        return $arResult;
    }
     if ( \Bitrix\Main\Loader::IncludeModule('crm') )
        {
            $post_fields = $_POST;

            /* echo "<pre>";
                print_r($request->getPostList());
            echo "</pre>";
            die(); */
            $fieldsInfo = \CCrmDeal::GetFieldsInfo();

            $LeadFieldsInfo = \CCrmLead::GetFieldsInfo();

            $ContactFieldsInfo = \CCrmContact::GetFieldsInfo();

            foreach ($fieldsInfo as $code => &$field)
            {
                $field['CAPTION'] = \CCrmDeal::GetFieldCaption($code);
            }

            $userType = new \CCrmUserType(
                $USER_FIELD_MANAGER,
                \CCrmDeal::$sUFEntityID
            );
            $userType->PrepareFieldsInfo($fieldsInfo);



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



            // Контакт
            $typesID = array_keys( \CCrmFieldMulti::GetEntityTypeInfos() );
            foreach($typesID as $typeID)
            {
                $ContactFieldsInfo[$typeID] = [
                    'TYPE' => 'crm_multifield',
                    'ATTRIBUTES' => [\CCrmFieldInfoAttr::Multiple]
                ];
            }

            foreach ($ContactFieldsInfo as $code => &$field)
            {
                $field['CAPTION'] = \CCrmLead::GetFieldCaption($code);
            }

            $userType = new \CCrmUserType(
                $USER_FIELD_MANAGER,
                \CCrmLead::$sUFEntityID
            );
            $userType->PrepareFieldsInfo($ContactFieldsInfo);




            $regions = $LeadFieldsInfo['UF_CRM_1678096558']['ITEMS'];
            $doctors = $fieldsInfo['UF_CRM_1655488213455']['ITEMS'];
            $services = $fieldsInfo['UF_CRM_1590412209544']['SETTINGS']['SERVICE_LIST'];
            $contactsFrom = $ContactFieldsInfo['UF_CRM_1723449198981']['ITEMS'];


            $event = null;
            if( isset($post_fields['event_id']) && $post_fields['event_id'] > 0 ){
                function stripWhitespaces($string) {
                    $old_string = $string;
                    $string = strip_tags($string);
                    $string = preg_replace('/([^\pL\pN\pP\pS\pZ])|([\xC2\xA0])/u', ' ', $string);
                    $string = str_replace('  ',' ', $string);
                    $string = trim($string);

                    if ($string === $old_string) {
                        return $string;
                    } else {
                        return stripWhitespaces($string);
                    }
                }

                $event = GetEventByID($post_fields['event_id']);
                if(isset($event[0])) $event = $event[0];

                foreach ($regions as $key => $region){
                    if($event['artmax_serviceRegion'] == $region['ID']){
                        $regions[$key]['selected'] = true;
                        break;
                    }
                }

                foreach ($doctors as $key => $doctor){
                    if( stripWhitespaces($event['artmax_serviceDoctor']) == stripWhitespaces($doctor['VALUE']) ){
                        $doctors[$key]['selected'] = true;
                        break;
                    }
                }
                foreach ($services as $key => $service){
                    if( stripWhitespaces($event['artmax_serviceName']) == stripWhitespaces($service['name']) ){
                        $services[$key]['selected'] = true;
                        break;
                    }
                }
                foreach ($contactsFrom as $key => $contactsFro){
                    if($event['contact_source'] == $contactsFro['ID']){
                        $contactsFrom[$key]['selected'] = true;
                        break;
                    }
                }
            }

            // Цена UF_CRM_1655487439761


            $response = [
                'regions' => $regions,
                'doctors' => $doctors,
                'services' => $services,
                'contact_sources' => $contactsFrom
            ];
            if( isset($post_fields['event_id']) && $post_fields['event_id'] > 0 ){
                $response['event_service_duration'] = $event['artmax_serviceDuration'];
                $response['event_service_price'] = $event['artmax_servicePrice'];
                $response['event_service_comment'] = $event['artmax_comment'];
                $response['FIO'] = $event['FIO'];
                $response['PHONE'] = $event['PHONE'];
            }

            echo json_encode($response);
        }

    return [];