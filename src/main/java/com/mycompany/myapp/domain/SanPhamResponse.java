package com.mycompany.myapp.domain;

public interface SanPhamResponse {
    Long getId();
    String getTenSanPham(); //*****
    String getSapCode();
    String getRdCode();
    String getDonVi();
    String getToSanXuat();
    String getPhanLoai();
    String getTenNhomSanPham(); //*****
    String getTenChungLoai(); //*****
    String getTenNganh(); //*****
    String getTenKho();
    Integer getDonBaoHanhId(); //*****
    String getMaTiepNhan(); //*****
    Integer getIdSPTN(); //*****
    String getNhomSPTheoCongSuat(); //*****
    String getPhanLoaiSP(); //***** (Nhom san pham hien tai)
    Integer getSlTiepNhan(); //*****
    String getTrangThai(); //*****
    Integer getSoLuongKhachHang(); //*****
}
