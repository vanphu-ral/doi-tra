package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.ChiTietXuatKho;
import com.mycompany.myapp.domain.ChiTietXuatKhoResponse;
import com.mycompany.myapp.domain.TongHopNewResponse;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietXuatKhoRepository extends JpaRepository<ChiTietXuatKho, Long> {
    @Query(
        value = "" +
        "SELECT " +
        "a.ma_hang_hoa as idSanPham,\n" +
        "a.ma_khach_hang as idKhachHang,\n" +
        "a.ten_khach_hang as tenKhachHang,\n" +
        "a.so_luong as quantity,\n" +
        "a.sl_da_len_hd as quantityAvailable,\n" +
        "a.sl_chua_len as quantityNotAvailable,\n" +
        "sp.name as tenSanPham,\n" +
        "sp.phan_loai as sanPham,\n" +
        "sp.nhom_sp_theo_cong_suat as nhomSanPhamTheoCongSuat,\n" +
        "nganh.ten_nganh as nganh,\n" +
        "nsp.name as nhomSanPham,\n" +
        "cl.ten_chung_loai as tenChungLoai\n" +
        " FROM `chi_tiet_xuat_kho` as a\n" +
        "left JOIN baohanh2.san_pham as sp on sp.sap_code = replace(a.ma_hang_hoa, 'LED','') \n" +
        "left join baohanh2.nganh as nganh on nganh.id = sp.nganh_id\n" +
        "left join baohanh2.nhom_san_pham as nsp on nsp.id = sp.nhom_san_pham_id\n" +
        "left join baohanh2.chung_loai as cl on cl.id = nsp.chung_loai_id" +
        " where danh_sach_xuat_kho_id = ?1 group by a.ten_khach_hang;",
        nativeQuery = true
    )
    List<ChiTietXuatKhoResponse> getAll(Long id);

    List<ChiTietXuatKho> findAllByDanhSachXuatKhoId(Long id);
    void deleteByDanhSachXuatKhoId(Long id);

    @Query(
        value = "SELECT\n" +
        "replace(a.ma_hang_hoa, 'LED','') as maSanPham,\n" +
        "sum(a.so_luong) as soLuongXuatKho\n" +
        "FROM baohanh2.chi_tiet_xuat_kho as a\n" +
        "inner join baohanh2.danh_sach_xuat_kho as b on b.id = a.danh_sach_xuat_kho_id\n" +
        "where b.month = ?1 and b.year = ?2 " +
        "group by a.ma_hang_hoa",
        nativeQuery = true
    )
    public List<TongHopNewResponse> getDataInfo(Integer month, Integer year);
}
