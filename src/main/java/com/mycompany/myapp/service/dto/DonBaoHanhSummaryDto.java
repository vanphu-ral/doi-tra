package com.mycompany.myapp.service.dto;

public class DonBaoHanhSummaryDto {

    private Long donBaoHanhId;
    private Long slPhanTich;

    public DonBaoHanhSummaryDto(Long donBaoHanhId, Long slPhanTich) {
        this.donBaoHanhId = donBaoHanhId;
        this.slPhanTich = slPhanTich != null ? slPhanTich : 0L;
    }

    public Long getDonBaoHanhId() {
        return donBaoHanhId;
    }

    public Long getSlPhanTich() {
        return slPhanTich;
    }
}
