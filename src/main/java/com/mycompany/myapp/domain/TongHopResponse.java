package com.mycompany.myapp.domain;

import java.util.Objects;
import java.util.PrimitiveIterator;
import javax.persistence.EntityResult;
import javax.persistence.FieldResult;
import javax.persistence.SqlResultSetMapping;

public interface TongHopResponse {
    Long getChiTietId();
    Long getIdSPTN();
    Long getDonBaoHanhId(); // *1
    String getTenSanPham(); // *1
    String getTenChungLoai(); // *1
    String getTenNhomSanPham(); // *1
    String getTenNganh(); // *1
    String getMaTiepNhan(); // *1
    String getNgayTiepNhan(); // *1
    String getNhanVienGiaoHang(); // *1
    String getNguoiTaoDon();
    Long getSlTiepNhan(); // *1
    String getTenKhachHang(); // *1
    String getNhomKhachHang(); // *1
    String getTinhThanh(); // *1
    Long getSoLuongTheoTinhTrang(); // *1
    String getTenTinhTrangPhanLoai(); // *1
    String getTheLoaiPhanTich(); // * 1
    String getNamSanXuat(); // * 1
    Long getSoLuongKhachGiao(); // *1
    String getTenNhanVienPhanTich(); // * 1
    String getLotNumber(); // * 1
    String getSerial(); // * 1
    String getNgayPhanTich(); // * 1
    Long getSoLuongTheoTungLoi(); // *1
    String getTenLoi(); // *1
    String getTenNhomLoi(); // *1
    Long getPhanTichSanPhamId();
    Long getLoiId(); // * 1
    Long getTongSoLuong(); // *1
    Long getErrCode(); // *1
    String getTrangThai();
    Integer getIdPhanLoai();
    Integer getId();
    Integer getIdSP();
    Integer getPhanLoaiSP();
    String getNhanVienPhanTich();
}
