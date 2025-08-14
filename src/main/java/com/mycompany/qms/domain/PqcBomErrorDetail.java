package com.mycompany.qms.domain;

import javax.persistence.*;
import java.util.Date;


@Entity
@Table(name = "pqc_bom_error_detail")
public class PqcBomErrorDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;
    @Column(name = "error_code")
    private String errorCode;
    @Column(name = "error_name")
    private String errorName;
    @Column(name = "quantity")
    private Integer quantity;
    @Column(name = "created_at")
    private Date createdAt;
    @Column(name = "updated_at")
    private Date updatedAt;
    @Column(name = "note")
    private String note;
    @Column(name = "pqc_bom_quantity_id")
    private Integer pqcBomQuantityId;
    @Column(name = "pqc_work_order_id")
    private Integer pqcWorkOrderId;
    @Column(name = "pqc_bom_work_order_id")
    private Integer pqcBomWorkOrderId;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getErrorName() {
        return errorName;
    }

    public void setErrorName(String errorName) {
        this.errorName = errorName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Integer getPqcBomQuantityId() {
        return pqcBomQuantityId;
    }

    public void setPqcBomQuantityId(Integer pqcBomQuantityId) {
        this.pqcBomQuantityId = pqcBomQuantityId;
    }

    public Integer getPqcWorkOrderId() {
        return pqcWorkOrderId;
    }

    public void setPqcWorkOrderId(Integer pqcWorkOrderId) {
        this.pqcWorkOrderId = pqcWorkOrderId;
    }

    public Integer getPqcBomWorkOrderId() {
        return pqcBomWorkOrderId;
    }

    public void setPqcBomWorkOrderId(Integer pqcBomWorkOrderId) {
        this.pqcBomWorkOrderId = pqcBomWorkOrderId;
    }
}
