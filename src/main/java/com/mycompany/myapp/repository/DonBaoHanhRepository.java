package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.DonBaoHanh;
import com.mycompany.myapp.domain.DonBaoHanhResponse;
import com.mycompany.myapp.domain.SanPhamResponse;
import java.util.List;
import javax.transaction.Transactional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the DonBaoHanh entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DonBaoHanhRepository extends JpaRepository<DonBaoHanh, Long> {
    @Query(
        value = "select * from `don_bao_hanh` where" +
        " trang_thai = N'Chờ phân tích' or trang_thai = N'Đang phân tích' or trang_thai = N'Hoàn thành phân tích'  ",
        nativeQuery = true
    )
    List<DonBaoHanh> getDonBaoHanhByTrangThais();

    @Query(
        value = "SELECT\n" +
        " dbh.id as id,\n" +
        " dbh.ma_tiep_nhan as maTiepNhan,\n" +
        " dbh.ngay_tiep_nhan as ngayTiepNhan,\n" +
        " dbh.trang_thai as trangThai,\n" +
        " dbh.nhan_vien_giao_hang as nhanVienGiaoHang,\n" +
        " dbh.ngaykhkb as ngaykhkb,\n" +
        " dbh.nguoi_tao_don as nguoiTaoDon,\n" +
        " dbh.sl_tiep_nhan as slTiepNhan,\n" +
        " dbh.sl_da_phan_tich as slDaPhanTich,\n" +
        " dbh.ghi_chu as ghiChu,\n" +
        " dbh.ngay_tra_bien_ban as ngayTraBienBan,\n" +
        " khachHang.ten_khach_hang as tenKhachHang," +
        "khachHang.dia_chi as diaChi,\n" +
        "count(chiTiet.san_pham_id) as slSanPham,\n" +
        "\t(select count(chi_tiet_san_pham_tiep_nhan.tinh_trang_bao_hanh) \n" +
        "\t\tfrom baohanh2.chi_tiet_san_pham_tiep_nhan \n" +
        "\t\twhere tinh_trang_bao_hanh ='true'\n" +
        "\t\tand don_bao_hanh_id = dbh.id )  as slDaPhanLoai\n" +
        "from `don_bao_hanh` as dbh \n" +
        "\tinner join baohanh2.chi_tiet_san_pham_tiep_nhan as chiTiet on chiTiet.don_bao_hanh_id = dbh.id\n" +
        "\tinner join baohanh2.khach_hang as khachHang on khachHang.id = dbh.khach_hang_id\n" +
        "\tgroup by dbh.id;",
        nativeQuery = true
    )
    List<DonBaoHanhResponse> tiepNhan();

    @Query(
        value = "SELECT \n" +
        "\t\tdbh.id as id ,\n" +
        "\t\tdbh.ma_tiep_nhan as maTiepNhan,\n" +
        "        dbh.sl_tiep_nhan as tongTiepNhan,\n" +
        "        dbh.ngay_tiep_nhan as ngayTiepNhan,\n" +
        "        dbh.ngay_tra_bien_ban as ngayTraBienBan,\n" +
        "        dbh.nguoi_tao_don as nguoiTaoDon,\n" +
        "        dbh.nhan_vien_giao_hang as nhanVienGiaoHang,\n" +
        "        dbh.trang_thai as trangThai,\n" +
        "        kh.ma_khach_hang as maKhachHang,\n" +
        "        kh.ten_khach_hang as tenKhachHang,\n" +
        "        dbh.ngaykhkb as ngayTaoDon,\n" +
        "        nkh.ten_nhom_khach_hang as nhomKhachHang,\n" +
        "        tt.name as tinhThanh \n" +
        "FROM `don_bao_hanh` as dbh \n" +
        " inner join baohanh2.khach_hang as kh on dbh.khach_hang_id = kh.id\n" +
        " inner join baohanh2.nhom_khach_hang as nkh on kh.nhom_khach_hang_id = nkh.id\n" +
        " inner join baohanh2.tinh_thanh as tt on kh.tinh_thanh_id = tt.id " +
        " where dbh.ngay_tiep_nhan > ?1 and dbh.ngay_tiep_nhan < ?2 ;",
        nativeQuery = true
    )
    List<DonBaoHanhResponse> ExportListDonBaoHanh(String startDate, String endDate);

    @Query(
        value = "SELECT\n" +
        " dbh.id as donBaoHanhId," +
        " dbh.ma_tiep_nhan as maTiepNhan,\n" +
        " chitiet.id as idSPTN,\n" +
        " chitiet.so_luong_khach_hang as soLuongKhachHang,\n" +
        " chitiet.sl_tiep_nhan as slTiepNhan ,\n" +
        " sp.name as tenSanPham,\n" +
        " sp.ten_chung_loai as tenChungLoai,\n" +
        "sp.nhom_sp_theo_cong_suat as nhomSPTheoCongSuat, " +
        " nsp.name as phanLoaiSP,\n" +
        " nganh.ten_nganh as tenNganh,\n" +
        " dbh.trang_thai as trangThai\n" +
        " FROM `don_bao_hanh` as dbh\n" +
        " inner join baohanh2.chi_tiet_san_pham_tiep_nhan as chitiet on chitiet.don_bao_hanh_id = dbh.id\n" +
        " inner join baohanh2.san_pham as sp  on sp.id = chitiet.san_pham_id\n" +
        " inner join baohanh2.nhom_san_pham as nsp on sp.nhom_san_pham_id = nsp.id \n" +
        " left join baohanh2.nganh on nganh.id = sp.nganh_id " +
        " where dbh.ngay_tiep_nhan > ?1 and dbh.ngay_tiep_nhan < ?2 ;",
        nativeQuery = true
    )
    List<SanPhamResponse> ExportListChiTietDonBaoHanh(String startDate, String endDate);

    @Query(value = "SELECT max(don_bao_hanh_id) FROM `don_bao_hanh` ;", nativeQuery = true)
    public Integer selectMaxId();

    @Modifying
    @Transactional
    @Query(
        value = "DELETE FROM phan_loai_chi_tiet_tiep_nhan WHERE chi_tiet_san_pham_tiep_nhan_id IN (SELECT id FROM chi_tiet_san_pham_tiep_nhan WHERE don_bao_hanh_id = ?1)",
        nativeQuery = true
    )
    void deletePhanLoaiByDonBaoHanhId(Long id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM chi_tiet_san_pham_tiep_nhan WHERE don_bao_hanh_id = ?1", nativeQuery = true)
    void deleteChiTietByDonBaoHanhId(Long id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM don_bao_hanh WHERE id = ?1", nativeQuery = true)
    void deleteDonBaoHanhItem(Long id);
}
