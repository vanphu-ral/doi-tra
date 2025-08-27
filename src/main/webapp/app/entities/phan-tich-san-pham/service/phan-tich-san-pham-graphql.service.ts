import { Apollo, gql } from 'apollo-angular';

export const GET_WORK_ORDER_BY_LOT = gql`
  query QmsToDoiTraInfoByLotNumber($lotNumber: String!) {
    qmsToDoiTraInfoByLotNumber(lotNumber: $lotNumber) {
      pqcScan100Pass {
        id
        qr
        material
        workOrderId
        createdAt
        machine
        side
        feeder
        date
        status
        user_check
        updatedAt
        timeConfirmed
        reason
        confirm
      }
      pqcCheckNVL {
        id
        CheckPerson
        createdAt
        conclude
        note
        updatedAt
        workOrderId
      }
      pqcCheckTestNVL {
        id
        itemName
        itemCode
        partNumber
        sampleQuantity
        checkDate
        regulationCheck
        allowResult
        realResult
        returnDay
        note
        vendor
        lot
        manufactureDate
        maxCosfi
        maxElectric
        maxPower
        minCosfi
        minElectric
        minPower
        poCode
        qty
        rankAp
        rankMau
        rankQuang
        technicalPara
        paramMax
        paramMin
        unit
        pqcDrawNvlId
        workOrderId
        externalInspection
      }
      pqcBomErrorDetail {
        id
        errorCode
        errorName
        quantity
        note
        createdAt
        updatedAt
        pqcBomQuantityId
        pqcWorkOrderId
        pqcBomWorkOrderId
      }
      pqcBomQuantity {
        id
        quantity
        totalError
        createdAt
        updateAt
        pqcWorkOrderId
        pqcBomWorkOrderId
      }
      pqcBomWorkOrder {
        id
        bomQuantity
        itemCode
        itemName
        partNumber
        quantity
        vendor
        version
        workOrderId
        workOrderQuantity
        uitmTech
        ualter
        uremarks
        uctrLevel
        uotherNam
        ulocation
      }
    }
  }
`;
