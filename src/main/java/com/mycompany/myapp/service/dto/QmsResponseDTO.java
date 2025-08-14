package com.mycompany.myapp.service.dto;

import com.mycompany.qms.domain.PqcBomErrorDetail;
import com.mycompany.qms.domain.PqcDrawTestNvl;

import java.util.List;

public class QmsResponseDTO {
    List<PqcBomErrorDetail> pqcBomErrorDetails;
    List<PqcDrawTestNvl> pqcDrawTestNvls;

    public List<PqcBomErrorDetail> getPqcBomErrorDetails() {
        return pqcBomErrorDetails;
    }

    public void setPqcBomErrorDetails(List<PqcBomErrorDetail> pqcBomErrorDetails) {
        this.pqcBomErrorDetails = pqcBomErrorDetails;
    }

    public List<PqcDrawTestNvl> getPqcDrawTestNvls() {
        return pqcDrawTestNvls;
    }

    public void setPqcDrawTestNvls(List<PqcDrawTestNvl> pqcDrawTestNvls) {
        this.pqcDrawTestNvls = pqcDrawTestNvls;
    }
}
