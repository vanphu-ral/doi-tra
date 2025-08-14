package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.service.QmsService;
import com.mycompany.myapp.service.dto.QmsResponseDTO;
import com.mycompany.qms.domain.pqcWorkOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class QmsResource {
    @Autowired
    private QmsService qmsService;
    @Autowired

    @GetMapping("/api/qms/work-orders/{lot}")
    public QmsResponseDTO getAllPqcWorkOrders(@PathVariable String lot) {
        return qmsService.getAllPqcWorkOrders(lot);
    }
}
