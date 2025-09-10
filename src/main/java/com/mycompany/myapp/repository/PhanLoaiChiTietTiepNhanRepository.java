package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.PhanLoaiChiTietDonBaoHanhResponse;
import com.mycompany.myapp.domain.PhanLoaiChiTietTiepNhan;
import com.mycompany.myapp.service.dto.DonBaoHanhSummaryDto;
import java.util.List;
import javax.transaction.Transactional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
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

    @Transactional
    @Modifying
    @Query(
        value = "DELETE FROM phan_loai_chi_tiet_tiep_nhan " +
        "WHERE chi_tiet_san_pham_tiep_nhan_id IN (" +
        "SELECT ct.id FROM chi_tiet_san_pham_tiep_nhan ct WHERE ct.don_bao_hanh_id = :donBaoHanhId" +
        ")",
        nativeQuery = true
    )
    void deleteByDonBaoHanhId(@Param("donBaoHanhId") Long donBaoHanhId);

    @Query("SELECT p.id FROM PhanLoaiChiTietTiepNhan p WHERE p.chiTietSanPhamTiepNhan.donBaoHanh.id = :donBaoHanhId")
    List<Long> findPhanLoaiIdsByDonBaoHanhId(@Param("donBaoHanhId") Long donBaoHanhId);

    @Modifying
    @Transactional
    @Query("DELETE FROM PhanLoaiChiTietTiepNhan p WHERE p.id IN :phanLoaiIds")
    void deletePhanLoaiByIds(@Param("phanLoaiIds") List<Long> phanLoaiIds);

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

    @Query(
        "SELECT pl FROM PhanLoaiChiTietTiepNhan pl " +
        "JOIN FETCH pl.chiTietSanPhamTiepNhan ct " +
        "JOIN FETCH pl.danhSachTinhTrang tt " +
        "WHERE ct.donBaoHanh.id = :donBaoHanhId"
    )
    List<PhanLoaiChiTietTiepNhan> findByDonBaoHanhId(@Param("donBaoHanhId") Long donBaoHanhId);

    @Query(
        value = "SELECT ct.don_bao_hanh_id AS donBaoHanhId, SUM(pl.so_luong) AS slPhanTich " +
        "FROM phan_loai_chi_tiet_tiep_nhan pl " +
        "JOIN chi_tiet_san_pham_tiep_nhan ct ON pl.chi_tiet_san_pham_tiep_nhan_id = ct.id " +
        "WHERE ct.don_bao_hanh_id IN (:donIds) " +
        "AND pl.so_luong IS NOT NULL AND pl.so_luong > 0 " +
        "AND (pl.danh_sach_tinh_trang_id = 1 OR pl.danh_sach_tinh_trang_id = 2) " +
        "GROUP BY ct.don_bao_hanh_id",
        nativeQuery = true
    )
    List<Object[]> sumSlPhanTichByDonBaoHanhIdsNative(@Param("donIds") List<Long> donIds);

    @Query(
        "SELECT pl.id FROM PhanLoaiChiTietTiepNhan pl " + "JOIN pl.chiTietSanPhamTiepNhan ct " + "WHERE ct.donBaoHanh.id = :donBaoHanhId"
    )
    List<Long> findIdByDonBaoHanhId(@Param("donBaoHanhId") Long donBaoHanhId);
}
