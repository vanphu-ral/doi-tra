package com.mycompany.qms.repository;

import com.mycompany.qms.domain.pqcWorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface PqcWorkOrderRepository extends JpaRepository<pqcWorkOrder, Long> {
    public pqcWorkOrder findByLotNumber(String lot);
    // Define methods for querying pqcWorkOrder data as needed
    // For example:
    // List<pqcWorkOrder> findByStatus(String status);
    // List<pqcWorkOrder> findByProductCode(String productCode);
    // List<pqcWorkOrder> findByDateRange(Date startDate, Date endDate);
}
