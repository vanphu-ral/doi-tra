package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.PhanLoaiChiTietDonBaoHanhResponse;
import com.mycompany.myapp.domain.PhanLoaiChiTietTiepNhan;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the PhanLoaiChiTietTiepNhan entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PhanLoaiChiTietTiepNhanRepository extends JpaRepository<PhanLoaiChiTietTiepNhan, Long> {
    public void deleteByChiTietSanPhamTiepNhanId(Long id);

    public List<PhanLoaiChiTietTiepNhan> findAllByChiTietSanPhamTiepNhanId(Long id);

    public PhanLoaiChiTietTiepNhan findByChiTietSanPhamTiepNhanIdAndDanhSachTinhTrangId(Long id1, Long id2);

    @Query(
        value = "SELECT\n" +
        "\tdbh.id as donBaoHanhId,\n" +
        "    dbh.ma_tiep_nhan as maTiepNhan,\n" +
        "\tpl.chi_tiet_san_pham_tiep_nhan_id as idSPTN,\n" +
        "\tpl.id as id,\n" +
        "    tt.ten_tinh_trang_phan_loai as phanLoaiSP,\n" +
        "    pl.so_luong as soLuongPL\n" +
        "    FROM `phan_loai_chi_tiet_tiep_nhan` as pl\n" +
        "    inner join baohanh2.danh_sach_tinh_trang as tt on tt.id = pl.danh_sach_tinh_trang_id\n" +
        "    inner join baohanh2.chi_tiet_san_pham_tiep_nhan as ct on ct.id = pl.chi_tiet_san_pham_tiep_nhan_id\n" +
        "    inner join baohanh2.don_bao_hanh as dbh on dbh.id = ct.don_bao_hanh_id\n" +
        "    where pl.so_luong >0 and pl.so_luong is not null and dbh.ngay_tiep_nhan > ?1 and dbh.ngay_tiep_nhan < ?2 \n" +
        "    order by pl.id;",
        nativeQuery = true
    )
    List<PhanLoaiChiTietDonBaoHanhResponse> ExportPhanLoaiChiTietDonBaoHanh(String startDate, String endDate);

    @Query(
        value = "SELECT " +
        "sum(so_luong) " +
        "FROM `phan_loai_chi_tiet_tiep_nhan` " +
        "where " +
        "chi_tiet_san_pham_tiep_nhan_id between ?1 and ?2 " +
        "and ( danh_sach_tinh_trang_id = 1 or danh_sach_tinh_trang_id = 2) ;",
        nativeQuery = true
    )
    Integer getSum(Long id1, Long id2);
}
