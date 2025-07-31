package com.mycompany.myapp.domain;

import javax.persistence.*;

@Entity
@Table(name = "chi_tiet_xuat_kho")
public class ChiTietXuatKho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "ma_hang_hoa")
    private String idSanPham;

    @Column(name = "ma_khach_hang")
    private String idKhachHang;

    @Column(name = "ten_khach_hang")
    private String tenKhachHang;

    @Column(name = "so_luong")
    private Long quantity;

    @Column(name = "sl_da_len_hd")
    private Long quantityAvailable;

    @Column(name = "sl_chua_len")
    private Long quantityNotAvailable;

    @Column(name = "danh_sach_xuat_kho_id")
    private Long danhSachXuatKhoId;

    public ChiTietXuatKho() {}

    public ChiTietXuatKho(
        Long id,
        String idSanPham,
        String idKhachHang,
        String tenKhachHang,
        Long quantity,
        Long quantityAvailable,
        Long quantityNotAvailable,
        Long danhSachXuatKhoId
    ) {
        this.id = id;
        this.idSanPham = idSanPham;
        this.idKhachHang = idKhachHang;
        this.tenKhachHang = tenKhachHang;
        this.quantity = quantity;
        this.quantityAvailable = quantityAvailable;
        this.quantityNotAvailable = quantityNotAvailable;
        this.danhSachXuatKhoId = danhSachXuatKhoId;
    }

    public Long getDanhSachXuatKhoId() {
        return danhSachXuatKhoId;
    }

    public void setDanhSachXuatKhoId(Long danhSachXuatKhoId) {
        this.danhSachXuatKhoId = danhSachXuatKhoId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdSanPham() {
        return idSanPham;
    }

    public void setIdSanPham(String idSanPham) {
        this.idSanPham = idSanPham;
    }

    public String getIdKhachHang() {
        return idKhachHang;
    }

    public void setIdKhachHang(String idKhachHang) {
        this.idKhachHang = idKhachHang;
    }

    public String getTenKhachHang() {
        return tenKhachHang;
    }

    public void setTenKhachHang(String tenKhachHang) {
        this.tenKhachHang = tenKhachHang;
    }

    public Long getQuantity() {
        return quantity;
    }

    public void setQuantity(Long quantity) {
        this.quantity = quantity;
    }

    public Long getQuantityAvailable() {
        return quantityAvailable;
    }

    public void setQuantityAvailable(Long quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
    }

    public Long getQuantityNotAvailable() {
        return quantityNotAvailable;
    }

    public void setQuantityNotAvailable(Long quantityNotAvailable) {
        this.quantityNotAvailable = quantityNotAvailable;
    }
}
