package com.mycompany.qms.repository;

import com.mycompany.qms.domain.PqcBomErrorDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PqcBomErrorDetailRepository extends JpaRepository<PqcBomErrorDetail, Long> {
public List<PqcBomErrorDetail> findAllByPqcWorkOrderId(Long workOrderId);
    // Custom query methods can be defined here if needed
    // For example, you can add methods to find by specific fields or perform complex queries
}
