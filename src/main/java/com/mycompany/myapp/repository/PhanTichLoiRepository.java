package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.PhanTichLoi;
import com.mycompany.myapp.domain.TongHopNewResponse;
import com.mycompany.myapp.domain.TongHopResponse;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the PhanTichLoi entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PhanTichLoiRepository extends JpaRepository<PhanTichLoi, Long> {
    List<PhanTichLoi> findAllByPhanTichSanPhamId(Long id);
    PhanTichLoi findByPhanTichSanPhamId(Long id);

    @Query(value = "delete from `phan_tich_loi` where phan_tich_san_pham_id = ?1 ;", nativeQuery = true)
    public void deleteItem(Long id);

    @Query(
        value = "SELECT \n" +
        "\tptLoi.id as loiId,\n" +
        "    phanTichSP.the_loai_phan_tich as theLoaiPhanTich,\n" +
        "    phanTichSP.detail as serial,\n" +
        "    phanTichSP.lot_number as lotNumber,\n" +
        "    phanTichSP.nam_san_xuat as namSanXuat,\n" +
        "    phanTichSP.ngay_kiem_tra as ngayPhanTich,\n" +
        "    phanTichSP.ten_nhan_vien_phan_tich as tenNhanhVienPhanTich,\n" +
        "    chiTietSP.so_luong_khach_hang as soLuongKhachGiao,\n" +
        "    dbh.id as donBaoHanhId," +
        "    dbh.sl_tiep_nhan as slTiepNhan," +
        "    dbh.ngay_tiep_nhan as ngayTiepNhan," +
        "    dbh.nhan_vien_giao_hang as nhanVienGiaoHang," +
        "    dbh.nguoi_tao_don as nguoiTaoDon,\n" +
        "    dbh.trang_thai as trangThai,\n" +
        "    loi.chi_chu as tenNhomLoi,\n" +
        "    dbh.ma_tiep_nhan as maTiepNhan,\n" +
        "    khach_hang.ten_khach_hang as tenKhachHang,\n" +
        "    nhomKH.ten_nhom_khach_hang as nhomKhachHang,\n" +
        "    tinh_thanh.name as tinhThanh,\n" +
        "    sanPham.name as tenSanPham,\n" +
        "    phanLoai.so_luong as soLuongTheoTinhTrang,\n" +
        "    danhSachTT.ten_tinh_trang_phan_loai as tenTinhTrangPhanLoai," +
        "    nhomSP.name as tenNhomSanPham,\n" +
        "    nganh.ten_nganh as tenNganh,\n" +
        "    chungLoai.ten_chung_loai as tenChungLoai,\n" +
        "    sum(ptLoi.so_luong) as tongSoLuong \n" +
        "    FROM `phan_tich_loi` as ptLoi\n" +
        "    inner join baohanh2.phan_tich_san_pham as phanTichSP on ptLoi.phan_tich_san_pham_id = phanTichSP.id \n" +
        "    inner join baohanh2.loi as loi on loi.id = ptLoi.loi_id \n" +
        "    inner join baohanh2.phan_loai_chi_tiet_tiep_nhan as phanLoai on phanLoai.id = phanTichSP.phan_loai_chi_tiet_tiep_nhan_id\n" +
        "    inner join baohanh2.danh_sach_tinh_trang as danhSachTT on danhSachTT.id = phanLoai.danh_sach_tinh_trang_id" +
        "    inner join baohanh2.chi_tiet_san_pham_tiep_nhan as chiTietSP on phanLoai.chi_tiet_san_pham_tiep_nhan_id = chiTietSP.id\n" +
        "    inner join baohanh2.don_bao_hanh as dbh on dbh.id = chiTietSP.don_bao_hanh_id\n" +
        "    inner join baohanh2.san_pham as sanPham on sanPham.id = chiTietSP.san_pham_id\n" +
        "    left join baohanh2.nhom_san_pham as nhomSP on nhomSP.id = sanPham.nhom_san_pham_id\n" +
        "    left join baohanh2.chung_loai as chungLoai on nhomSP.chung_loai_id = chungLoai.id\n" +
        "    left join baohanh2.nganh on nganh.id = sanPham.nganh_id\n" +
        "    inner join baohanh2.khach_hang on khach_hang.id = dbh.khach_hang_id\n" +
        "    left join baohanh2.nhom_khach_hang as nhomKH on nhomKH.id = khach_hang.nhom_khach_hang_id\n" +
        "    left join baohanh2.tinh_thanh on tinh_thanh.id = khach_hang.tinh_thanh_id\n" +
        "    where " +
        "    dbh.ngay_tiep_nhan > ?1 " +
        "    and dbh.ngay_tiep_nhan < ?2 and " +
        "    dbh.trang_thai = N'Hoàn thành phân tích' " +
        "    group by chiTietSP.id,loi.chi_chu ;",
        nativeQuery = true
    )
    List<TongHopResponse> tongHopCaculate(String startDate, String endDate);

    @Query(
        value = "SELECT \n" +
        "\tptLoi.id as loiId,\n" +
        "\tchiTietSP.id as idSPTN,\n" +
        "\tsanPham.id as idSP,\n" +
        "    phanTichSP.the_loai_phan_tich as theLoaiPhanTich,\n" +
        "    phanTichSP.detail as serial,\n" +
        "    phanTichSP.lot_number as lotNumber,\n" +
        "    phanTichSP.nam_san_xuat as namSanXuat,\n" +
        "    phanTichSP.ngay_kiem_tra as ngayPhanTich,\n" +
        "    phanTichSP.ten_nhan_vien_phan_tich as tenNhanVienPhanTich,\n" +
        "    chiTietSP.so_luong_khach_hang as soLuongKhachGiao,\n" +
        "    dbh.id as donBaoHanhId,\n" +
        "    dbh.sl_tiep_nhan as slTiepNhan," +
        "    dbh.ngay_tiep_nhan as ngayTiepNhan," +
        "    dbh.nhan_vien_giao_hang as nhanVienGiaoHang," +
        "    dbh.nguoi_tao_don as nguoiTaoDon," +
        "    dbh.trang_thai as trangThai,\n" +
        "    loi.err_code as errCode,\n" +
        "    loi.ten_loi as tenLoi,\n" +
        "    loi.chi_chu as tenNhomLoi,\n" +
        "    ptLoi.so_luong as soLuongTheoTungLoi,\n" +
        "    dbh.ma_tiep_nhan as maTiepNhan,\n" +
        "    khach_hang.ten_khach_hang as tenKhachHang,\n" +
        "    nhomKH.ten_nhom_khach_hang as nhomKhachHang,\n" +
        "    tinh_thanh.name as tinhThanh,\n" +
        "      sanPham.name as tenSanPham,\n" +
        "      phanLoai.so_luong as soLuongTheoTinhTrang,\n" +
        "      danhSachTT.ten_tinh_trang_phan_loai as tenTinhTrangPhanLoai,\n" +
        "     nhomSP.name as tenNhomSanPham,\n" +
        "     nganh.ten_nganh as tenNganh,\n" +
        "     chungLoai.ten_chung_loai as tenChungLoai\n" +
        "    FROM baohanh2.phan_tich_loi as ptLoi\n" +
        "    \tinner join baohanh2.phan_tich_san_pham as phanTichSP on ptLoi.phan_tich_san_pham_id = phanTichSP.id \n" +
        "    inner join baohanh2.loi as loi on loi.id = ptLoi.loi_id \n" +
        "    inner join baohanh2.phan_loai_chi_tiet_tiep_nhan as phanLoai on phanLoai.id = phanTichSP.phan_loai_chi_tiet_tiep_nhan_id\n" +
        "    inner join baohanh2.danh_sach_tinh_trang as danhSachTT on danhSachTT.id = phanLoai.danh_sach_tinh_trang_id\n" +
        "    inner join baohanh2.chi_tiet_san_pham_tiep_nhan as chiTietSP on phanLoai.chi_tiet_san_pham_tiep_nhan_id = chiTietSP.id\n" +
        "    inner join baohanh2.don_bao_hanh as dbh on dbh.id = chiTietSP.don_bao_hanh_id\n" +
        "    inner join baohanh2.san_pham as sanPham on sanPham.id = chiTietSP.san_pham_id\n" +
        "    left join baohanh2.nhom_san_pham as nhomSP on nhomSP.id = sanPham.nhom_san_pham_id\n" +
        "    left join baohanh2.chung_loai as chungLoai on nhomSP.chung_loai_id = chungLoai.id\n" +
        "    left join baohanh2.nganh on nganh.id = sanPham.nganh_id\n" +
        "    inner join baohanh2.khach_hang on khach_hang.id = dbh.khach_hang_id\n" +
        "    left join baohanh2.nhom_khach_hang as nhomKH on nhomKH.id = khach_hang.nhom_khach_hang_id\n" +
        "    left join baohanh2.tinh_thanh on tinh_thanh.id = khach_hang.tinh_thanh_id " +
        "            where ptLoi.so_luong > 0 and " +
        "            dbh.trang_thai = N'Hoàn thành phân tích' and " +
        "            dbh.ngay_tiep_nhan >= STR_TO_DATE(?1, '%Y-%m-%d') \n" +
        "            AND dbh.ngay_tiep_nhan <= STR_TO_DATE(?2, '%Y-%m-%d') ;",
        nativeQuery = true
    )
    List<TongHopResponse> tongHop(String startDate, String endDate);

    @Query(
        value = "SELECT \n" +
        "sp.id as spId,\n" +
        "sp.sap_code as maSanPham,\n" +
        "sp.name as tenSanPham,\n" +
        "nganh.ten_nganh as nganh,\n" +
        "sp.ten_chung_loai as sanpham,\n" +
        "nsp.name as nhomSanPham ,\n" +
        "cl.ten_chung_loai as chungLoai,\n" +
        "sp.nhom_sp_theo_cong_suat as nhomSanPhamTheoCongSuat," +
        " 0 as soLuongXuatKho,\n" +
        "(select case when sp.id = sp1.id and plctsp1.danh_sach_tinh_trang_id = 1 and plctsp1.so_luong > 0 then sum(plctsp1.so_luong) else 0 end FROM baohanh2.phan_loai_chi_tiet_tiep_nhan as plctsp1 \n" +
        "inner join baohanh2.chi_tiet_san_pham_tiep_nhan as ctsptn on ctsptn.id = plctsp1.chi_tiet_san_pham_tiep_nhan_id\n" +
        "inner join baohanh2.san_pham as sp1 on sp1.id = ctsptn.san_pham_id\n" +
        "inner join baohanh2.don_bao_hanh as dbh on dbh.id = ctsptn.don_bao_hanh_id\n" +
        "where sp.id = sp1.id and plctsp1.danh_sach_tinh_trang_id = 1 and plctsp1.so_luong > 0 \n" +
        "and dbh.ngay_tiep_nhan between ?1 and ?2) as tongDoiTra ,\n" + //?
        "sum(case when ptsp.phan_loai_chi_tiet_tiep_nhan_id and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as tongLoi,\n" +
        "sum(case when loi.chi_chu ='Lỗi kỹ thuật' and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as tongLoiKyThuat,\n" +
        "sum(case when loi.chi_chu ='Lỗi linh động' and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as tongLoiLinhDong,\n" +
        "sum(case when ptl.loi_id =1 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi1,\n" +
        "sum(case when ptl.loi_id =2 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi2,\n" +
        "sum(case when ptl.loi_id =3 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi3,\n" +
        "sum(case when ptl.loi_id =4 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi4,\n" +
        "sum(case when ptl.loi_id =5 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi5,\n" +
        "sum(case when ptl.loi_id =6 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi6,\n" +
        "sum(case when ptl.loi_id =7 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi7,\n" +
        "sum(case when ptl.loi_id =8 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi8,\n" +
        "sum(case when ptl.loi_id =9 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi9,\n" +
        "sum(case when ptl.loi_id =10 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi10,\n" +
        "sum(case when ptl.loi_id =11 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi11,\n" +
        "sum(case when ptl.loi_id =12 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi12,\n" +
        "sum(case when ptl.loi_id =13 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi13,\n" +
        "sum(case when ptl.loi_id =14 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi14,\n" +
        "sum(case when ptl.loi_id =15 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi15,\n" +
        "sum(case when ptl.loi_id =16 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi16,\n" +
        "sum(case when ptl.loi_id =17 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi17,\n" +
        "sum(case when ptl.loi_id =18 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi18,\n" +
        "sum(case when ptl.loi_id =19 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi19,\n" +
        "sum(case when ptl.loi_id =20 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi20,\n" +
        "sum(case when ptl.loi_id =21 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi21,\n" +
        "sum(case when ptl.loi_id =22 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi22,\n" +
        "sum(case when ptl.loi_id =23 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi23,\n" +
        "sum(case when ptl.loi_id =24 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi24,\n" +
        "sum(case when ptl.loi_id =25 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi25,\n" +
        "sum(case when ptl.loi_id =26 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi26,\n" +
        "sum(case when ptl.loi_id =27 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi27,\n" +
        "sum(case when ptl.loi_id =28 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi28,\n" +
        "sum(case when ptl.loi_id =29 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi29,\n" +
        "sum(case when ptl.loi_id =30 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi30,\n" +
        "sum(case when ptl.loi_id =31 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi31,\n" +
        "sum(case when ptl.loi_id =32 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi32,\n" +
        "sum(case when ptl.loi_id =33 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi33,\n" +
        "sum(case when ptl.loi_id =34 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi34,\n" +
        "sum(case when ptl.loi_id =35 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi35,\n" +
        "sum(case when ptl.loi_id =36 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi36,\n" +
        "sum(case when ptl.loi_id =37 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi37,\n" +
        "sum(case when ptl.loi_id =38 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi38,\n" +
        "sum(case when ptl.loi_id =39 and plctsp.danh_sach_tinh_trang_id = 1 then ptl.so_luong end) as loi39\n" +
        "FROM `phan_tich_loi` as ptl  \n" +
        "inner join baohanh2.loi on loi.id = ptl.loi_id\n" +
        "inner join baohanh2.phan_tich_san_pham as ptsp on ptl.phan_tich_san_pham_id = ptsp.id\n" +
        "inner join baohanh2.phan_loai_chi_tiet_tiep_nhan as plctsp on plctsp.id = ptsp.phan_loai_chi_tiet_tiep_nhan_id\n" +
        "inner join baohanh2.chi_tiet_san_pham_tiep_nhan as ctsptn on ctsptn.id = plctsp.chi_tiet_san_pham_tiep_nhan_id\n" +
        "inner join baohanh2.san_pham as sp on sp.id = ctsptn.san_pham_id\n" +
        "inner join baohanh2.nganh on nganh.id = sp.nganh_id\n" +
        "inner join baohanh2.nhom_san_pham as nsp on nsp.id = sp.nhom_san_pham_id\n" +
        "inner join baohanh2.chung_loai as cl on cl.id = nsp.chung_loai_id \n" +
        "inner join baohanh2.don_bao_hanh as dbh on dbh.id = ctsptn.don_bao_hanh_id\n" +
        "where dbh.ngay_tiep_nhan between ?1 and ?2\n" + //?
        "group by sp.id order by \n" +
        "case\n" +
        "when nganh.id = 2 then 1\n" +
        "when nganh.id = 3 then 2\n" +
        "when nganh.id = 4 then 3\n" +
        "when nganh.id = 1 then 4\n" +
        "end asc;",
        nativeQuery = true
    )
    public List<TongHopNewResponse> tongHopNew(String startDate, String endDate);
}
