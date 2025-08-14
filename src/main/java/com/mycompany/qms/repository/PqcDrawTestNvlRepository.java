package com.mycompany.qms.repository;

import com.mycompany.qms.domain.PqcDrawTestNvl;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PqcDrawTestNvlRepository extends JpaRepository<PqcDrawTestNvl, Long> {
    public List<PqcDrawTestNvl> findAllByWorkOrderId(Long workOrderId);
    // Define custom query methods if needed
    // For example, you can add methods to find by specific fields or perform complex queries
}
