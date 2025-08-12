package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.*;
import com.mycompany.myapp.service.FullServices;
import com.mycompany.myapp.service.dto.ChiTietXuatKhoDTO;
import com.mycompany.myapp.service.dto.DateTimeSearchDTO;
import com.mycompany.myapp.service.dto.MonthYearDTO;
import java.time.LocalDate;
import java.util.List;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Transactional
public class Controller {

    private static final String dateFormat = "yyyy-MM-dd";

    @Autowired
    private final FullServices fullServices;

    public Controller(FullServices fullServices) {
        this.fullServices = fullServices;
    }

    // * ============================ Template Tiếp nhận =================================
    // * Trang chủ
    //☺ lấy danh sách tất cả các đơn bảo hành
    // * Thêm mới đơn bảo hành
    //☺ Lưu chi tiết đơn bảo hành (Btn lưu)
    // ☺ B1: tạo danh sách chi tiết đơn bảo hành
    @PostMapping("/chi-tiet-san-pham-tiep-nhan")
    public List<PhanLoaiChiTietTiepNhan> createChiTietDonBaoHanh(@RequestBody List<ChiTietSanPhamTiepNhan> chiTietSanPhamTiepNhans) {
        return this.fullServices.createChiTietDonBaoHanh(chiTietSanPhamTiepNhans);
    }

    //☺ B2: Cập nhật số lượng sản phẩm theo từng tình trạng
    @PutMapping("/chi-tiet-san-pham-tiep-nhan")
    public void updatePhanLoaiChiTietTiepNhan(List<PhanLoaiChiTietTiepNhan> request) {
        this.fullServices.updatePhanLoaiChiTietTiepNhan(request);
    }

    // ☺ Chuyển đổi trạng thái đơn bảo hành
    @PostMapping("don-bao-hanh/change-status")
    public void ChangeDonBaoHanhStatus(@RequestBody DonBaoHanh request) {
        this.fullServices.ChangeDonBaoHanhStatus(request);
    }

    // ☺ B1: Lấy danh sách phân loại chi tiết theo đơn bảo hành
    @GetMapping("/phan-loai-chi-tiet-tiep-nhans/by-don-bao-hanh/{donBaoHanhId}")
    public List<PhanLoaiChiTietTiepNhan> getPhanLoaiChiTietByDonBaoHanh(@PathVariable Long donBaoHanhId) {
        return this.fullServices.getPhanLoaiChiTietByDonBaoHanh(donBaoHanhId);
    }

    //☺ lấy chi tiết đơn bảo hành theo id
    @GetMapping("chi-tiet-don-bao-hanhs/{id}")
    public List<ChiTietSanPhamTiepNhan> getChiTietDonBaoHanh(@PathVariable Long id) {
        return this.fullServices.getChiTietDonBaoHanh(id);
    }

    //☺ cap nhat trang thai don bao hanh
    @PutMapping("/don-bao-hanhs/update-trang-thai")
    public void updateTrangThaiDonBaoHanh(@RequestBody DonBaoHanh request) {
        this.fullServices.updateTrangThaiDonBaoHanh(request);
    }

    //☺ cập nhật đơn bảo hành
    @PutMapping("/update-don-bao-hanh")
    public void updateDonBaoHanh(@RequestBody DonBaoHanh request) {
        this.fullServices.updateDonBaoHanh(request);
    }

    //☺ cập nhật đơn bảo hành
    @PutMapping("/update-don-bao-hanh-phan-loai")
    public void updateDonBaoHanhPhanLoai(@RequestBody DonBaoHanh request) {
        this.fullServices.updateDonBaoHanhPhanLoai(request);
    }

    //☺ thêm mới đơn bảo hành
    @PostMapping("don-bao-hanh/them-moi")
    public DonBaoHanh postDonBaoHanh(@RequestBody DonBaoHanh request) {
        this.fullServices.postDonBaoHanh(request);
        return request;
    }

    //☺ Thêm mới đơn bảo hành theo quy tắc mới ( cập nhật thì bật lên )
    @PostMapping("don-bao-hanh/them-moi-new")
    public DonBaoHanh postDonBaoHanhNew(@RequestBody DonBaoHanh request) {
        this.fullServices.postDonBaoHanhNew(request);
        return request;
    }

    //☺ Thêm mới chi Tiết đơn bảo hành
    @PostMapping("don-bao-hanh/them-moi-chi-tiet")
    public List<ChiTietSanPhamTiepNhan> postChiTietSanPhamTiepNhan(@RequestBody List<ChiTietSanPhamTiepNhan> request) {
        List<ChiTietSanPhamTiepNhan> chiTietSanPhamTiepNhanList = this.fullServices.postChiTietSanPhamTiepNhan(request);
        return chiTietSanPhamTiepNhanList;
    }

    //☺ Thêm mới phân loại chi tiết tiếp nhận
    @PostMapping("don-bao-hanh/them-moi-phan-loai")
    public List<PhanLoaiChiTietTiepNhan> postPhanLoaiChiTietTiepNhan(
        @RequestBody List<PhanLoaiChiTietTiepNhan> phanLoaiChiTietTiepNhanList
    ) {
        List<PhanLoaiChiTietTiepNhan> phanLoaiChiTietTiepNhanList1 =
            this.fullServices.postPhanLoaiChiTietTiepNhan(phanLoaiChiTietTiepNhanList);
        return phanLoaiChiTietTiepNhanList1;
    }

    //☺ update phân loại chi tiết đơn hàng tiếp nhận
    @PutMapping("don-bao-hanh/phan-loai/update-phan-loai-chi-tiet-tiep-nhan")
    public void updatePhanLoaiChiTietDonHangTiepNhan(@RequestBody List<PhanLoaiChiTietTiepNhan> requestList) {
        this.fullServices.updatePhanLoaiChiTietDonHangTiepNhan(requestList);
    }

    //☺ update chi tiết sản phẩm tiếp nhận
    @PutMapping("don-bao-hanh/phan-loai/update-chi-tiet-san-pham-tiep-nhan")
    public List<ChiTietSanPhamTiepNhan> updateChiTietSanPhamTiepNhan(@RequestBody List<ChiTietSanPhamTiepNhan> requestList) {
        List<ChiTietSanPhamTiepNhan> chiTietSanPhamTiepNhanList = this.fullServices.updateChiTietSanPhamTiepNhan(requestList);
        return chiTietSanPhamTiepNhanList;
    }

    //☺ hoàn thành phân loại
    @PutMapping("don-bao-hanh/hoan-thanh-phan-loai")
    public void hoanThanhPhanLoai(@RequestBody DonBaoHanh request) {
        this.fullServices.hoanThanhPhanLoai(request);
    }

    //☺ lấy danh sách mã biên bản
    @GetMapping("ma-bien-bans")
    public List<MaBienBan> getAllMaBienBan() {
        List<MaBienBan> maBienBanList = this.fullServices.getAllMaBienBan();
        return maBienBanList;
    }

    //☺ cập nhật thông tin in biên bản
    @PostMapping("ma-bien-ban/post")
    public MaBienBan postMaBienBan(@RequestBody MaBienBan request) {
        MaBienBan maBienBan = this.fullServices.postMaBienBan(request);
        return maBienBan;
    }

    // ☺ lấy thông tin id lớn nhất trong chi tiết sản phẩm tiếp nhận
    @GetMapping("chi-tiet-san-pham-tiep-nhan-max-id")
    public ChiTietSanPhamTiepNhan getMaxId() {
        ChiTietSanPhamTiepNhan chiTietSanPhamTiepNhan = this.fullServices.getMaxId();
        return chiTietSanPhamTiepNhan;
    }

    //☺ Lấy thông tin đơn bảo hành
    @GetMapping("tiep-nhan")
    public List<DonBaoHanhResponse> tiepNhan() {
        List<DonBaoHanhResponse> list = this.fullServices.tiepNhan();
        return list;
    }

    // * ============================ Template Phân tích =================================
    // * Trang chủ
    //☺ lấy danh sách tất cả các đơn bảo hành ở trạng thái chờ phân tích , đang phân tích
    @GetMapping("phan-tich-san-pham")
    public List<DonBaoHanh> getDonBaoHanhByTrangThai() {
        List<DonBaoHanh> donBaoHanhList = this.fullServices.getDonBaoHanhByTrangThai();
        return donBaoHanhList;
    }

    //☺ Lấy thông tin phân tích sản phẩm theo id PLCTTN
    @GetMapping("phan-tich-san-pham/{id}")
    public List<PhanTichSanPham> getByPhanLoaiChiTietTiepNhan(@PathVariable Long id) {
        List<PhanTichSanPham> phanTichSanPhamList = this.fullServices.getByPhanLoaiChiTietTiepNhan(id);
        return phanTichSanPhamList;
    }

    //☺ cập nhật thông tin phân tích sản phẩm
    @PostMapping("phan-tich-san-pham")
    public List<PhanTichSanPham> updatePhanTichSanPham(@RequestBody List<PhanTichSanPham> phanTichSanPhamList) {
        List<PhanTichSanPham> phanTichSanPhamList1 = this.fullServices.updatePhanTichSanPham(phanTichSanPhamList);
        return phanTichSanPhamList1;
    }

    //☺ cập nhật thông tin khai báo lỗi
    @PostMapping("phan-tich-loi")
    public void updatePhanTichLoi(@RequestBody List<PhanTichLoi> phanTichLoiList) {
        this.fullServices.updatePhanTichLoi(phanTichLoiList);
    }

    //☺ Lấy danh sách phân tích lỗi theo phân tích sản phẩm id
    @GetMapping("phan-tich-loi/{id}")
    public List<PhanTichLoi> getByPhanTichSanPhamId(@PathVariable Long id) {
        List<PhanTichLoi> phanTichLoiList = this.fullServices.getByPhanTichSanPhamId(id);
        return phanTichLoiList;
    }

    //☺ lấy biên bản Tiếp nhận theo đơn bảo hành
    @GetMapping("danh-sach-bien-ban/tiep-nhan/{id}")
    public MaBienBan getBienBanTiepNhanByDonBaoHanhId(@PathVariable Long id) {
        MaBienBan maBienBan = this.fullServices.getBienBanTiepNhanByDonBaoHanhId(id);
        return maBienBan;
    }

    //☺ lấy biên bản kiểm nghiệm theo đơn bảo hành
    @GetMapping("danh-sach-bien-ban/kiem-nghiem/{id}")
    public List<MaBienBan> getBienBanKiemNghiemByDonBaoHanhId(@PathVariable Long id) {
        List<MaBienBan> maBienBan = this.fullServices.getBienBanKiemNghiemByDonBaoHanhId(id);
        return maBienBan;
    }

    @GetMapping("danh-sach-bien-ban/{id}")
    public List<MaBienBan> getBienBanByDonBaoHanhId(@PathVariable Long id) {
        List<MaBienBan> maBienBan = this.fullServices.getBienBanByDonBaoHanhId(id);
        return maBienBan;
    }

    //☺ delete khai bao loi
    @DeleteMapping("/phan-tich-loi/delete/{id}")
    public void deleteItem(@PathVariable Long id) {
        this.fullServices.deleteItem(id);
    }

    // * ============================== quản lý sản phẩm ===========================
    //☺ cập nhật thông tin 1 sản phẩm
    @PostMapping("san-phams/update/{id}")
    public void PutSanPham(@RequestBody SanPham sanPham, @PathVariable Long id) {
        this.fullServices.PutSanPham(sanPham, id);
    }

    //☺ Cập nhật toàn bộ danh sách sản phẩm
    @PostMapping("san-phams/update")
    public void PostSanPham(@RequestBody List<SanPham> sanPham) {
        this.fullServices.PostSanPham(sanPham);
    }

    @GetMapping("ma-bien-ban")
    public List<MaBienBan> maBienBanList() {
        List<MaBienBan> maBienBanList = this.fullServices.maBienBanList();
        return maBienBanList;
    }

    // * ---------------------------------------------------Tổng hợp---------------------------------------
    @GetMapping("tong-hop")
    public List<TongHopResponse> tongHop() {
        List<TongHopResponse> list = this.fullServices.tongHop();
        return list;
    }

    // * search by time
    @PostMapping("tong-hop")
    public List<TongHopResponse> searchTongHopByTime(@RequestBody DateTimeSearchDTO request) {
        List<TongHopResponse> list = this.fullServices.searchTongHopByTime(request);
        return list;
    }

    // * Tổng hợp tính toán
    @GetMapping("tong-hop-caculate")
    public List<TongHopResponse> tongHopCaculate() {
        List<TongHopResponse> list = this.fullServices.tongHopCaculate();
        return list;
    }

    // * search Tong hop caculate
    @PostMapping("tong-hop-caculate")
    public List<TongHopResponse> searchTongHopCaculate(@RequestBody DateTimeSearchDTO request) {
        List<TongHopResponse> list = this.fullServices.searchTongHopCaculate(request);
        return list;
    }

    @PostMapping("thong-tin-don-bao-hanh")
    public List<DonBaoHanhResponse> ExportListDonBaoHanh(@RequestBody DateTimeSearchDTO request) {
        List<DonBaoHanhResponse> donBaoHanhResponses = this.fullServices.ExportListDonBaoHanh(request);
        return donBaoHanhResponses;
    }

    //ExportListChiTietDonBaoHanh
    @PostMapping("san-pham-don-bao-hanh2")
    public List<SanPhamResponse> ExportListChiTietDonBaoHanh(@RequestBody DateTimeSearchDTO request) {
        List<SanPhamResponse> sanPhamResponses = this.fullServices.ExportListChiTietDonBaoHanh(request);
        return sanPhamResponses;
    }

    //ExportPhanLoaiChiTietDonBaoHanh
    @PostMapping("chi-tiet-phan-loai-san-pham")
    public List<PhanLoaiChiTietDonBaoHanhResponse> ExportPhanLoaiChiTietDonBaoHanh(@RequestBody DateTimeSearchDTO request) {
        List<PhanLoaiChiTietDonBaoHanhResponse> phanLoaiChiTietDonBaoHanhResponses =
            this.fullServices.ExportPhanLoaiChiTietDonBaoHanh(request);
        return phanLoaiChiTietDonBaoHanhResponses;
    }

    @PostMapping("tong-hop-new")
    public List<TongHopNewResponse> tongHopNew(@RequestBody DateTimeSearchDTO dto) {
        List<TongHopNewResponse> tongHopNewResponses = this.fullServices.tongHopNew(dto);
        return tongHopNewResponses;
    }

    // * ---------------- san pham ---------------
    @GetMapping("san-phams/list")
    public List<SanPhamResponse> getListSanPham() {
        List<SanPhamResponse> list = this.fullServices.getListSanPham();
        return list;
    }

    //Tinh toan tong loi linh dong loi ky thuat
    @GetMapping("tinh-toan-so-luong-loi/{id}")
    public Response caculateErrors(@PathVariable Long id) {
        Response response = this.fullServices.caculateErrors(id);
        return response;
    }

    // * ------------------------------------- danh sách xuất kho --------------------------------------
    //☺ get all data
    @GetMapping("danh-sach-nhap-khos")
    public List<DanhSachXuatKho> getDataDsXuatKho() {
        List<DanhSachXuatKho> list = this.fullServices.getDataDsXuatKho();
        return list;
    }

    //☺ insert data danh sách xuất kho
    @PostMapping("danh-sach-nhap-khos")
    public void insertDsXuatKho(@RequestBody DanhSachXuatKho request) {
        this.fullServices.insertDsXuatKho(request);
    }

    //☺ update data danh sách xuất kho
    @PutMapping("danh-sach-nhap-khos")
    public void updateDsXuatKho(@RequestBody DanhSachXuatKho request) {
        this.fullServices.updateDsXuatKho(request);
    }

    // * ------------------- Chi tiet xuat kho --------------------------------
    //☺ view data chi tiet xuat kho
    @GetMapping("chi-tiet-xuat-khos/{id}")
    public List<ChiTietXuatKhoResponse> getAllDataChiTietXuatKho(@PathVariable Long id) {
        List<ChiTietXuatKhoResponse> list = this.fullServices.getAllDataChiTietXuatKho(id);
        return list;
    }

    // ☺ insert/ update
    @PostMapping("chi-tiet-xuat-khos")
    public void updateChiTietXuatKho(@RequestBody ChiTietXuatKhoDTO request) {
        this.fullServices.updateChiTietXuatKho(request);
    }

    //☺ Lấy danh sách sản phẩm gốc
    @GetMapping("san-pham/get-all")
    public List<TongHopNewResponse> getListSanPhamOrigin() {
        List<TongHopNewResponse> list = this.fullServices.getListSanPhamOrigin();
        return list;
    }

    //☺ Lấy danh sách xuất kho theo tháng năm
    @PostMapping("chi-tiet-xuat-khos/tong-hop")
    public List<TongHopNewResponse> getXuatKhoList(@RequestBody MonthYearDTO requests) {
        List<TongHopNewResponse> list = this.fullServices.getXuatKhoList(requests);
        return list;
    }
}
