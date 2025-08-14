package com.mycompany.qms.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.Date;
@Entity
@Table(name="pqc_draw_test_nvl")
@NamedQuery(name="PqcDrawTestNvl.findAll", query="SELECT p FROM PqcDrawTestNvl p")
public class PqcDrawTestNvl {
    private static final long serialVersionUID = 1L;

    @Id
    @Column(name="id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="allow_result")
    private String allowResult;

    @Column(name="check_date")
    private String checkDate;

    @Column(name="external_inspection")
    private String externalInspection;

    @Column(name="item_code")
    private String itemCode;

    @Column(name="item_name")
    private String itemName;

    private String lot;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="manufacture_date")
    private Date manufactureDate;

    @Column(name="max_cosfi")
    private String maxCosfi;

    @Column(name="max_electric")
    private String maxElectric;

    @Column(name="max_power")
    private String maxPower;

    @Column(name="min_cosfi")
    private String minCosfi;

    @Column(name="min_electric")
    private String minElectric;

    @Column(name="min_power")
    private String minPower;

    private String note;

    @Column(name="part_number")
    private String partNumber;

    @Column(name="po_code")
    private String poCode;

    private String qty;

    @Column(name="rank_ap")
    private String rankAp;

    @Column(name="rank_mau")
    private String rankMau;

    @Column(name="rank_quang")
    private String rankQuang;

    @Column(name="real_result")
    private String realResult;

    @Column(name="regulation_check")
    private String regulationCheck;

    @Column(name="sample_quantity")
    private String sampleQuantity;

    @Column(name="technical_para")
    private String technicalPara;
    @Column(name="param_max")
    private String paramMax;
    @Column(name="param_min")
    private String paramMin;
    @Column(name="unit")
    private String unit;
    @Column(name="return_day")
    private String returnDay;
    private String vendor;

    @Column(name="work_order_id")
    private Long workOrderId;

    @Column(name="pqc_draw_nvl_id")
    private Long pqcDrawNvlId;

    public PqcDrawTestNvl() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAllowResult() {
        return allowResult;
    }

    public void setAllowResult(String allowResult) {
        this.allowResult = allowResult;
    }

    public String getCheckDate() {
        return checkDate;
    }

    public void setCheckDate(String checkDate) {
        this.checkDate = checkDate;
    }

    public String getExternalInspection() {
        return externalInspection;
    }

    public void setExternalInspection(String externalInspection) {
        this.externalInspection = externalInspection;
    }

    public String getItemCode() {
        return itemCode;
    }

    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getLot() {
        return lot;
    }

    public void setLot(String lot) {
        this.lot = lot;
    }

    public Date getManufactureDate() {
        return manufactureDate;
    }

    public void setManufactureDate(Date manufactureDate) {
        this.manufactureDate = manufactureDate;
    }

    public String getMaxCosfi() {
        return maxCosfi;
    }

    public void setMaxCosfi(String maxCosfi) {
        this.maxCosfi = maxCosfi;
    }

    public String getMaxElectric() {
        return maxElectric;
    }

    public void setMaxElectric(String maxElectric) {
        this.maxElectric = maxElectric;
    }

    public String getMaxPower() {
        return maxPower;
    }

    public void setMaxPower(String maxPower) {
        this.maxPower = maxPower;
    }

    public String getMinCosfi() {
        return minCosfi;
    }

    public void setMinCosfi(String minCosfi) {
        this.minCosfi = minCosfi;
    }

    public String getMinElectric() {
        return minElectric;
    }

    public void setMinElectric(String minElectric) {
        this.minElectric = minElectric;
    }

    public String getMinPower() {
        return minPower;
    }

    public void setMinPower(String minPower) {
        this.minPower = minPower;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public String getPoCode() {
        return poCode;
    }

    public void setPoCode(String poCode) {
        this.poCode = poCode;
    }

    public String getQty() {
        return qty;
    }

    public void setQty(String qty) {
        this.qty = qty;
    }

    public String getRankAp() {
        return rankAp;
    }

    public void setRankAp(String rankAp) {
        this.rankAp = rankAp;
    }

    public String getRankMau() {
        return rankMau;
    }

    public void setRankMau(String rankMau) {
        this.rankMau = rankMau;
    }

    public String getRankQuang() {
        return rankQuang;
    }

    public void setRankQuang(String rankQuang) {
        this.rankQuang = rankQuang;
    }

    public String getRealResult() {
        return realResult;
    }

    public void setRealResult(String realResult) {
        this.realResult = realResult;
    }

    public String getRegulationCheck() {
        return regulationCheck;
    }

    public void setRegulationCheck(String regulationCheck) {
        this.regulationCheck = regulationCheck;
    }

    public String getSampleQuantity() {
        return sampleQuantity;
    }

    public void setSampleQuantity(String sampleQuantity) {
        this.sampleQuantity = sampleQuantity;
    }

    public String getTechnicalPara() {
        return technicalPara;
    }

    public void setTechnicalPara(String technicalPara) {
        this.technicalPara = technicalPara;
    }

    public String getParamMax() {
        return paramMax;
    }

    public void setParamMax(String paramMax) {
        this.paramMax = paramMax;
    }

    public String getParamMin() {
        return paramMin;
    }

    public void setParamMin(String paramMin) {
        this.paramMin = paramMin;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getReturnDay() {
        return returnDay;
    }

    public void setReturnDay(String returnDay) {
        this.returnDay = returnDay;
    }

    public String getVendor() {
        return vendor;
    }

    public void setVendor(String vendor) {
        this.vendor = vendor;
    }

    public Long getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(Long workOrderId) {
        this.workOrderId = workOrderId;
    }

    public Long getPqcDrawNvlId() {
        return pqcDrawNvlId;
    }

    public void setPqcDrawNvlId(Long pqcDrawNvlId) {
        this.pqcDrawNvlId = pqcDrawNvlId;
    }
}
