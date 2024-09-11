<?php
require_once($_SERVER['DOCUMENT_ROOT'].'/bitrix/modules/main/include/prolog_before.php');

    use \Bitrix\Main;
    global $USER_FIELD_MANAGER;

     if ( \Bitrix\Main\Loader::IncludeModule('crm') )
        {
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

             /*echo "<pre>";
                print_r($fieldsInfo);
            echo "</pre>";
            return;*/

            $regions = $fieldsInfo['UF_CRM_6405B9B55548C']['ITEMS'];
            $doctors = $fieldsInfo['UF_CRM_1655488213455']['ITEMS'];
            $services = $fieldsInfo['UF_CRM_1590412209544']['SETTINGS']['SERVICE_LIST'];

            // Цена UF_CRM_1655487439761


            $response = [
                'regions' => $regions,
                'doctors' => $doctors,
                'services' => $services
            ];

            echo json_encode($response);
        }

    return [];