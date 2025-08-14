package com.mycompany.myapp.service;

import com.mycompany.myapp.service.dto.QmsResponseDTO;
import com.mycompany.qms.domain.pqcWorkOrder;
import com.mycompany.qms.repository.PqcBomErrorDetailRepository;
import com.mycompany.qms.repository.PqcDrawTestNvlRepository;
import com.mycompany.qms.repository.PqcWorkOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QmsService {
    @Autowired
    private PqcWorkOrderRepository pqcWorkOrderRepository;
    @Autowired
    private PqcBomErrorDetailRepository pqcBomErrorDetailRepository;
    @Autowired
    private PqcDrawTestNvlRepository pqcDrawTestNvlRepository;
    public QmsResponseDTO getAllPqcWorkOrders(String lot) {
       pqcWorkOrder pqcWorkOrder =  pqcWorkOrderRepository.findByLotNumber(lot);
        if (pqcWorkOrder != null) {
            QmsResponseDTO responseDTO = new QmsResponseDTO();
            responseDTO.setPqcBomErrorDetails(pqcBomErrorDetailRepository.findAllByPqcWorkOrderId(pqcWorkOrder.getId()));
            responseDTO.setPqcDrawTestNvls(pqcDrawTestNvlRepository.findAllByWorkOrderId(pqcWorkOrder.getId()));
            return responseDTO;
        } else {
            return new QmsResponseDTO(); // Return an empty DTO if no work order found
        }
    }
}
