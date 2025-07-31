package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.SanPham;
import com.mycompany.myapp.domain.SanPhamResponse;
import com.mycompany.myapp.domain.TongHopNewResponse;
import java.util.List;
import liquibase.pro.packaged.Q;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the SanPham entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, Long> {
    @Query(
        value = "SELECT\n" +
        " sp.id as id ,\n" +
        " sp.name as tenSanPham,\n" +
        " sp.sap_code as sapCode,\n" +
        " sp.rd_code as rdCode,\n" +
        " sp.don_vi as donVi,\n" +
        " sp.to_san_xuat as toSanXuat,\n" +
        " sp.phan_loai as phanLoai,\n" +
        " nhomSP.name as tenNhomSanPham,\n" +
        " cl.ten_chung_loai as tenChungLoai,\n" +
        " nganh.ten_nganh as tenNganh,\n" +
        " kho.ten_kho as tenKho\n" +
        "FROM `san_pham` as sp\n" +
        "inner join baohanh2.nhom_san_pham as nhomSP on sp.nhom_san_pham_id = nhomSP.id\n" +
        "inner join baohanh2.chung_loai as cl on nhomSP.chung_loai_id = cl.id\n" +
        "inner join baohanh2.nganh on sp.nganh_id = nganh.id\n" +
        "inner join baohanh2.kho on kho.id = sp.kho_id;",
        nativeQuery = true
    )
    public List<SanPhamResponse> getListSanPham();

    @Query(
        value = "select \n" +
        "sp.id as spId,\n" +
        "sp.sap_code as maSanPham,\n" +
        "sp.name as tenSanPham,\n" +
        "nganh.ten_nganh as nganh,\n" +
        "sp.ten_chung_loai as sanpham,\n" +
        "nsp.name as nhomSanPham ,\n" +
        "cl.ten_chung_loai as chungLoai,\n" +
        "sp.nhom_sp_theo_cong_suat as nhomSanPhamTheoCongSuat,\n" +
        "0 as soLuongXuatKho,\n" +
        "0 as tongLoi,\n" +
        "0 as tongLoiKyThuat,\n" +
        "0 as tongLoiLinhDong \n" +
        "from baohanh2.san_pham as sp \n" +
        "left join baohanh2.nganh on nganh.id = sp.nganh_id\n" +
        "left join baohanh2.nhom_san_pham as nsp on nsp.id = sp.nhom_san_pham_id\n" +
        "left join baohanh2.chung_loai as cl on cl.id = nsp.chung_loai_id ;",
        nativeQuery = true
    )
    public List<TongHopNewResponse> getDataInfo();
}
