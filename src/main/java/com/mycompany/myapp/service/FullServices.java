package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.*;
import com.mycompany.myapp.repository.*;
import com.mycompany.myapp.service.dto.ChiTietXuatKhoDTO;
import com.mycompany.myapp.service.dto.DateTimeSearchDTO;
import com.mycompany.myapp.service.dto.MonthYearDTO;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// ! chưa làm được
// ? Chưa test với front-end
// * Ngăn cách
// ☺ đã Test với front-end
@Service
@Transactional
public class FullServices {

    @Autowired
    private final DonBaoHanhRepository donBaoHanhRepository;

    @Autowired
    private final PhanTichSanPhamRepository phanTichSanPhamRepository;

    @Autowired
    private final DanhSachTinhTrangRepository danhSachTinhTrangRepository;

    @Autowired
    private final ChiTietSanPhamTiepNhanRepository chiTietSanPhamTiepNhanRepository;

    @Autowired
    private final PhanLoaiChiTietTiepNhanRepository phanLoaiChiTietTiepNhanRepository;

    @Autowired
    private final SanPhamRepository sanPhamRepository;

    @Autowired
    private final MaBienBanRepository maBienBanRepository;

    @Autowired
    private final PhanTichLoiRepository phanTichLoiRepository;

    @Autowired
    private final DanhSachXuatKhoRepository danhSachXuatKhoRepository;

    @Autowired
    private final ChiTietXuatKhoRepository chiTietXuatKhoRepository;

    public FullServices(
        DonBaoHanhRepository donBaoHanhRepository,
        PhanTichSanPhamRepository phanTichSanPhamRepository,
        DanhSachTinhTrangRepository danhSachTinhTrangRepository,
        ChiTietSanPhamTiepNhanRepository chiTietSanPhamTiepNhanRepository,
        PhanLoaiChiTietTiepNhanRepository phanLoaiChiTietTiepNhanRepository,
        SanPhamRepository sanPhamRepository,
        MaBienBanRepository maBienBanRepository,
        PhanTichLoiRepository phanTichLoiRepository,
        DanhSachXuatKhoRepository danhSachXuatKhoRepository,
        ChiTietXuatKhoRepository chiTietXuatKhoRepository
    ) {
        this.donBaoHanhRepository = donBaoHanhRepository;
        this.phanTichSanPhamRepository = phanTichSanPhamRepository;
        this.danhSachTinhTrangRepository = danhSachTinhTrangRepository;
        this.chiTietSanPhamTiepNhanRepository = chiTietSanPhamTiepNhanRepository;
        this.phanLoaiChiTietTiepNhanRepository = phanLoaiChiTietTiepNhanRepository;
        this.sanPhamRepository = sanPhamRepository;
        this.maBienBanRepository = maBienBanRepository;
        this.phanTichLoiRepository = phanTichLoiRepository;
        this.danhSachXuatKhoRepository = danhSachXuatKhoRepository;
        this.chiTietXuatKhoRepository = chiTietXuatKhoRepository;
    }

    // * ============================ Template Tiếp nhận =================================
    // * Trang chủ
    //☺ lấy danh sách tất cả các đơn bảo hành
    // * Thêm mới đơn bảo hành
    //☺ Lưu chi tiết đơn bảo hành (Btn lưu)
    // ☺ B1: tạo danh sách chi tiết đơn bảo hành
    public List<PhanLoaiChiTietTiepNhan> createChiTietDonBaoHanh(List<ChiTietSanPhamTiepNhan> chiTietSanPhamTiepNhans) {
        List<DanhSachTinhTrang> danhSachTinhTrangs = this.danhSachTinhTrangRepository.findAll();
        List<PhanLoaiChiTietTiepNhan> phanLoaiChiTietTiepNhans = new ArrayList<>();
        // ☺ a: tạo danh sách chi tiết đơn bảo hành
        for (ChiTietSanPhamTiepNhan chiTietSanPhamTiepNhan : chiTietSanPhamTiepNhans) {
            this.chiTietSanPhamTiepNhanRepository.save(chiTietSanPhamTiepNhan);
            // ☺ b: tạo thông tin số lượng từng sản phẩm tương ứng với từng tình trạng
            for (DanhSachTinhTrang danhSachTinhTrang : danhSachTinhTrangs) {
                PhanLoaiChiTietTiepNhan phanLoaiChiTietTiepNhan = new PhanLoaiChiTietTiepNhan();
                phanLoaiChiTietTiepNhan.setDanhSachTinhTrang(danhSachTinhTrang);
                phanLoaiChiTietTiepNhan.setChiTietSanPhamTiepNhan(chiTietSanPhamTiepNhan);
                this.phanLoaiChiTietTiepNhanRepository.save(phanLoaiChiTietTiepNhan);
                phanLoaiChiTietTiepNhans.add(phanLoaiChiTietTiepNhan);
            }
        }
        return phanLoaiChiTietTiepNhans;
    }

    //☺ B2: Cập nhật số lượng sản phẩm theo từng tình trạng
    public void updatePhanLoaiChiTietTiepNhan(List<PhanLoaiChiTietTiepNhan> request) {
        for (PhanLoaiChiTietTiepNhan phanLoaiChiTietTiepNhan : request) {
            PhanLoaiChiTietTiepNhan phanLoaiChiTietTiepNhan1 =
                this.phanLoaiChiTietTiepNhanRepository.findById(phanLoaiChiTietTiepNhan.getId()).orElse(null);
            phanLoaiChiTietTiepNhan1.setSoLuong(phanLoaiChiTietTiepNhan.getSoLuong());
            this.phanLoaiChiTietTiepNhanRepository.save(phanLoaiChiTietTiepNhan1);
        }
    }

    //☺ xóa chi tiết đơn bảo hành
    public void deleteDetailDonBaoHanh(ChiTietSanPhamTiepNhan request) {
        //☺ B1: xóa thông tin trạng thái của từng sản phẩm trong chi tiết đơn bảo hành
        this.phanLoaiChiTietTiepNhanRepository.deleteByChiTietSanPhamTiepNhanId(request.getId());
        //☺ B2: xóa thông tin chi tiết đơn bảo hành
        this.chiTietSanPhamTiepNhanRepository.deleteById(request.getId());
    }

    //☺ Xóa đơn bảo hành
    public void deleteDonBaoHanh(DonBaoHanh request) {
        List<ChiTietSanPhamTiepNhan> chiTietSanPhamTiepNhanList =
            this.chiTietSanPhamTiepNhanRepository.findAllByDonBaoHanhId(request.getId());
        //☺ B1: xóa hết thông tin trạng thái của từng SP trong chi tiết đơn bảo hành
        for (ChiTietSanPhamTiepNhan chiTietSanPhamTiepNhan : chiTietSanPhamTiepNhanList) {
            this.phanLoaiChiTietTiepNhanRepository.deleteByChiTietSanPhamTiepNhanId(chiTietSanPhamTiepNhan.getId());
        }
        //☺ B2: Xóa hết thông tin chi tiết đơn bảo hành
        this.chiTietSanPhamTiepNhanRepository.deleteByDonBaoHanhId(request.getId());
        //☺ B3: Xóa thông tin đơn bảo hành
        this.donBaoHanhRepository.deleteById(request.getId());
    }

    // ☺ Chuyển đổi trạng thái đơn bảo hành
    public void ChangeDonBaoHanhStatus(DonBaoHanh request) {
        DonBaoHanh donBaoHanh = this.donBaoHanhRepository.findById(request.getId()).orElse(null);
        donBaoHanh.setTrangThai(request.getTrangThai());
        this.donBaoHanhRepository.save(donBaoHanh);
    }

    //☺ Lấy chi tiết đơn bảo hành
    public List<ChiTietSanPhamTiepNhan> getChiTietDonBaoHanh(Long id) {
        List<ChiTietSanPhamTiepNhan> chiTietSanPhamTiepNhanList = this.chiTietSanPhamTiepNhanRepository.findAllByDonBaoHanhId(id);
        return chiTietSanPhamTiepNhanList;
    }

    //☺ Cập nhật trạng thái đơn bảo hành
    public void updateTrangThaiDonBaoHanh(DonBaoHanh request) {
        this.donBaoHanhRepository.save(request);
    }

    //☺ cập nhật đơn bảo hành
    public void updateDonBaoHanh(DonBaoHanh request) {
        DonBaoHanh donBaoHanh = this.donBaoHanhRepository.findById(request.getId()).orElse(null);
        //        donBaoHanh.setKhachHang(request.getKhachHang());
        donBaoHanh.setSlTiepNhan(request.getSlTiepNhan());
        donBaoHanh.setNhanVienGiaoHang(request.getNhanVienGiaoHang());
        donBaoHanh.setTrangThai(request.getTrangThai());
        donBaoHanh.setNguoiTaoDon(request.getNguoiTaoDon());
        donBaoHanh.setNgaykhkb(request.getNgaykhkb());
        donBaoHanh.setTrangThaiIn(request.getTrangThaiIn());
        this.donBaoHanhRepository.save(donBaoHanh);
    }

    //☺ cập nhật đơn bảo hành
    public void updateDonBaoHanhPhanLoai(DonBaoHanh request) {
        DonBaoHanh donBaoHanh = this.donBaoHanhRepository.findById(request.getId()).orElse(null);
        //        donBaoHanh.setKhachHang(request.getKhachHang());
        donBaoHanh.setSlTiepNhan(request.getSlTiepNhan());
        donBaoHanh.setNhanVienGiaoHang(request.getNhanVienGiaoHang());
        donBaoHanh.setTrangThai(request.getTrangThai());
        donBaoHanh.setNguoiTaoDon(request.getNguoiTaoDon());
        donBaoHanh.setNgaykhkb(request.getNgaykhkb());
        this.donBaoHanhRepository.save(donBaoHanh);
    }

    //☺ thêm mới đơn bảo hành
    public DonBaoHanh postDonBaoHanh(DonBaoHanh request) {
        this.donBaoHanhRepository.save(request);
        return request;
    }

    //☺ Thêm mới đơn bảo hành theo quy tắc mới ( cập nhật thì bật lên )
    public DonBaoHanh postDonBaoHanhNew(DonBaoHanh donBaoHanh) {
        Integer max = this.donBaoHanhRepository.selectMaxId() + 1;
        donBaoHanh.setDonBaoHanhId(max);
        if (max < 1000) {
            donBaoHanh.setMaTiepNhan(donBaoHanh.getMaTiepNhan() + "-000" + max.toString());
            this.donBaoHanhRepository.save(donBaoHanh);
        } else if ((1000 < max && max < 10000) || max == 1000) {
            donBaoHanh.setMaTiepNhan(donBaoHanh.getMaTiepNhan() + "-00" + max.toString());
            this.donBaoHanhRepository.save(donBaoHanh);
        } else if ((10000 < max && max < 100000) || max == 10000) {
            donBaoHanh.setMaTiepNhan(donBaoHanh.getMaTiepNhan() + "-0" + max.toString());
            this.donBaoHanhRepository.save(donBaoHanh);
        } else {
            donBaoHanh.setMaTiepNhan(donBaoHanh.getMaTiepNhan() + "-" + max.toString());
            this.donBaoHanhRepository.save(donBaoHanh);
        }
        return donBaoHanh;
    }

    //☺ thêm mới chi tiết sản phẩm tiếp nhận
    public List<ChiTietSanPhamTiepNhan> postChiTietSanPhamTiepNhan(List<ChiTietSanPhamTiepNhan> requestList) {
        List<ChiTietSanPhamTiepNhan> chiTietSanPhamTiepNhanList = new ArrayList<>();
        for (ChiTietSanPhamTiepNhan chiTietSanPhamTiepNhan : requestList) {
            this.chiTietSanPhamTiepNhanRepository.save(chiTietSanPhamTiepNhan);
            chiTietSanPhamTiepNhanList.add(chiTietSanPhamTiepNhan);
        }
        return chiTietSanPhamTiepNhanList;
    }

    //☺ Thêm mới phân loại chi tiết sản phẩm
    public List<PhanLoaiChiTietTiepNhan> postPhanLoaiChiTietTiepNhan(List<PhanLoaiChiTietTiepNhan> requestList) {
        List<PhanLoaiChiTietTiepNhan> phanLoaiChiTietTiepNhanList = new ArrayList<>();
        for (PhanLoaiChiTietTiepNhan phanLoaiChiTietTiepNhan : requestList) {
            this.phanLoaiChiTietTiepNhanRepository.save(phanLoaiChiTietTiepNhan);
            phanLoaiChiTietTiepNhanList.add(phanLoaiChiTietTiepNhan);
        }
        return phanLoaiChiTietTiepNhanList;
    }

    //☺ update phân loại chi tiết đơn hàng tiếp nhận
    public void updatePhanLoaiChiTietDonHangTiepNhan(List<PhanLoaiChiTietTiepNhan> requestList) {
        for (PhanLoaiChiTietTiepNhan phanLoaiChiTietTiepNhan : requestList) {
            //☺ check chi tiết sản phẩm tiếp nhận
            if (phanLoaiChiTietTiepNhan.getChiTietSanPhamTiepNhan() == null) {}
            PhanLoaiChiTietTiepNhan phanLoaiChiTietTiepNhan1 =
                this.phanLoaiChiTietTiepNhanRepository.findByChiTietSanPhamTiepNhanIdAndDanhSachTinhTrangId(
                        phanLoaiChiTietTiepNhan.getChiTietSanPhamTiepNhan().getId(),
                        phanLoaiChiTietTiepNhan.getDanhSachTinhTrang().getId()
                    );
            if (phanLoaiChiTietTiepNhan1 == null) {
                this.phanLoaiChiTietTiepNhanRepository.save(phanLoaiChiTietTiepNhan);
            } else {
                phanLoaiChiTietTiepNhan1.setSoLuong(phanLoaiChiTietTiepNhan.getSoLuong());
                this.phanLoaiChiTietTiepNhanRepository.save(phanLoaiChiTietTiepNhan1);
            }
        }
    }

    //☺ update chi tiết sản phẩm tiếp nhận
    public List<ChiTietSanPhamTiepNhan> updateChiTietSanPhamTiepNhan(List<ChiTietSanPhamTiepNhan> requestList) {
        List<ChiTietSanPhamTiepNhan> chiTietSanPhamTiepNhanList = new ArrayList<>();
        for (ChiTietSanPhamTiepNhan chiTietSanPhamTiepNhan : requestList) {
            ChiTietSanPhamTiepNhan chiTietSanPhamTiepNhan1 =
                this.chiTietSanPhamTiepNhanRepository.findById(chiTietSanPhamTiepNhan.getId()).orElse(null);
            if (chiTietSanPhamTiepNhan1 == null) {
                this.chiTietSanPhamTiepNhanRepository.save(chiTietSanPhamTiepNhan);
                chiTietSanPhamTiepNhanList.add(chiTietSanPhamTiepNhan);
            } else {
                chiTietSanPhamTiepNhan1.setTinhTrangBaoHanh(chiTietSanPhamTiepNhan.getTinhTrangBaoHanh());
                chiTietSanPhamTiepNhan1.setSanPham(chiTietSanPhamTiepNhan.getSanPham());
                chiTietSanPhamTiepNhan1.setNgayPhanLoai(chiTietSanPhamTiepNhan.getNgayPhanLoai());
                this.chiTietSanPhamTiepNhanRepository.save(chiTietSanPhamTiepNhan1);
                chiTietSanPhamTiepNhanList.add(chiTietSanPhamTiepNhan1);
            }
        }
        return chiTietSanPhamTiepNhanList;
    }

    //☺ hoàn thành phân loại
    //☺ Lấy danh sách mã biên bản
    public List<MaBienBan> getAllMaBienBan() {
        List<MaBienBan> maBienBanList = this.maBienBanRepository.findAll();
        return maBienBanList;
    }

    //☺ cập nhật thông tin in biên bản
    public MaBienBan postMaBienBan(MaBienBan request) {
        this.maBienBanRepository.save(request);
        return request;
    }

    // ☺ lấy thông tin id lớn nhất trong chi tiết sản phẩm tiếp nhận
    public ChiTietSanPhamTiepNhan getMaxId() {
        ChiTietSanPhamTiepNhan chiTietSanPhamTiepNhan = this.chiTietSanPhamTiepNhanRepository.getMaxID();
        return chiTietSanPhamTiepNhan;
    }

    public void hoanThanhPhanLoai(DonBaoHanh request) {
        this.donBaoHanhRepository.save(request);
    }

    //☺ Lấy danh sách đơn bảo hành
    public List<DonBaoHanhResponse> tiepNhan() {
        List<DonBaoHanhResponse> list = this.donBaoHanhRepository.tiepNhan();
        return list;
    }

    // * ============================ Template Phân tích =================================
    // * Trang chủ
    //☺ lấy danh sách tất cả các đơn bảo hành ở trạng thái chờ phân tích , đang phân tích
    public List<DonBaoHanh> getDonBaoHanhByTrangThai() {
        List<DonBaoHanh> donBaoHanhList = this.donBaoHanhRepository.getDonBaoHanhByTrangThais();
        for (DonBaoHanh donBaoHanh : donBaoHanhList) {
            Integer slPhanTich = 0;
            List<Long> list = this.chiTietSanPhamTiepNhanRepository.getListOfId(donBaoHanh.getId());
            if (list.size() > 0) {
                slPhanTich = this.phanLoaiChiTietTiepNhanRepository.getSum(list.get(0), list.get(list.size() - 1));
            }
            donBaoHanh.setSlPhanTich(slPhanTich);
        }
        return donBaoHanhList;
    }

    //☺ Lấy thông tin phân tích sản phẩm theo id PLCTTN
    public List<PhanTichSanPham> getByPhanLoaiChiTietTiepNhan(Long id) {
        List<PhanTichSanPham> phanTichSanPhamList = this.phanTichSanPhamRepository.findAllByPhanLoaiChiTietTiepNhanId(id);
        return phanTichSanPhamList;
    }

    //☺ cập nhật thông tin phân tích sản phẩm
    public List<PhanTichSanPham> updatePhanTichSanPham(List<PhanTichSanPham> phanTichSanPhamList) {
        for (PhanTichSanPham phanTichSanPham : phanTichSanPhamList) {
            this.phanTichSanPhamRepository.save(phanTichSanPham);
        }
        return phanTichSanPhamList;
    }

    //☺ cập nhật thông tin khai báo lỗi
    public void updatePhanTichLoi(List<PhanTichLoi> phanTichLoiList) {
        for (PhanTichLoi phanTichLoi : phanTichLoiList) {
            this.phanTichLoiRepository.save(phanTichLoi);
        }
    }

    // ☺ xoa thong tin khai bao loi
    public void deleteItem(Long id) {
        this.phanTichLoiRepository.deleteItem(id);
        PhanTichSanPham phanTichSanPham = this.phanTichSanPhamRepository.findById(id).orElse(null);
        if (phanTichSanPham != null) {
            this.phanTichSanPhamRepository.deleteById(id);
        }
    }

    //☺ Lấy danh sách phân tích lỗi theo phân tích sản phẩm id
    public List<PhanTichLoi> getByPhanTichSanPhamId(Long id) {
        List<PhanTichLoi> phanTichLoiList = this.phanTichLoiRepository.findAllByPhanTichSanPhamId(id);
        return phanTichLoiList;
    }

    //☺ lấy biên bản Tiếp nhận theo đơn bảo hành
    public MaBienBan getBienBanTiepNhanByDonBaoHanhId(Long id) {
        MaBienBan maBienBan = this.maBienBanRepository.getBienBanTiepNhanByDonBaoHanhId(id);
        return maBienBan;
    }

    //☺ lấy biên bản kiểm nghiệm theo đơn bảo hành
    public List<MaBienBan> getBienBanKiemNghiemByDonBaoHanhId(Long id) {
        List<MaBienBan> maBienBan = this.maBienBanRepository.getBienBanKiemNghiemByDonBaoHanhId(id);
        return maBienBan;
    }

    //☺ lấy biên bản thanh lý theo đơn bảo hành
    public List<MaBienBan> getBienBanByDonBaoHanhId(Long id) {
        List<MaBienBan> maBienBan = this.maBienBanRepository.getBienBanByDonBaoHanhId(id);
        return maBienBan;
    }

    // * Chi tiết đơn bảo hành
    // * ============================ Template Tổng hợp =================================
    // * Trang chủ
    //☺ lấy danh sách tất cả các đơn bảo hành
    // * Chi tiết đơn bảo hành
    // * ============================ Quản lý sản phẩm ==================================
    //☺ Cập nhật thông tin từng sản phẩm
    public void PutSanPham(SanPham sanPham, Long id) {
        SanPham sanPham1 = this.sanPhamRepository.findById(id).orElse(null);
        if (sanPham1 == null) {
            this.sanPhamRepository.save(sanPham);
        } else {
            sanPham1.setName(sanPham.getName());
            sanPham1.setSapCode(sanPham.getSapCode());
            sanPham1.setRdCode(sanPham.getRdCode());
            sanPham1.setTenChungLoai(sanPham.getTenChungLoai());
            sanPham1.setDonVi(sanPham.getDonVi());
            sanPham1.setToSanXuat(sanPham.getToSanXuat());
            sanPham1.setPhanLoai(sanPham.getPhanLoai());
            sanPham1.setNhomSanPham(sanPham.getNhomSanPham());
            sanPham1.setKho(sanPham.getKho());
            sanPham1.setNganh(sanPham.getNganh());
            this.sanPhamRepository.save(sanPham1);
        }
    }

    //☺ Cập nhật toàn bộ danh sách sản phẩm
    public void PostSanPham(List<SanPham> sanPhams) {
        for (SanPham sanPham : sanPhams) {
            SanPham sanPham1 = this.sanPhamRepository.findById(sanPham.getId()).orElse(null);
            if (sanPham1 == null) {
                this.sanPhamRepository.save(sanPham);
            } else {
                sanPham1.setName(sanPham.getName());
                sanPham1.setSapCode(sanPham.getSapCode());
                sanPham1.setRdCode(sanPham.getRdCode());
                sanPham1.setTenChungLoai(sanPham.getTenChungLoai());
                sanPham1.setDonVi(sanPham.getDonVi());
                sanPham1.setToSanXuat(sanPham.getToSanXuat());
                sanPham1.setPhanLoai(sanPham.getPhanLoai());
                sanPham1.setNhomSanPham(sanPham.getNhomSanPham());
                sanPham1.setKho(sanPham.getKho());
                sanPham1.setNganh(sanPham.getNganh());
                this.sanPhamRepository.save(sanPham1);
            }
        }
    }

    // lay danh sách tên biên bản
    public List<MaBienBan> maBienBanList() {
        List<MaBienBan> maBienBanList = this.maBienBanRepository.findAll();
        return maBienBanList;
    }

    // * ---------------------------------------- Tổng hợp ----------------------------------
    // * tổng hợp danh sách theo tháng hiện tại
    public List<TongHopResponse> tongHop() {
        LocalDate date = LocalDate.now();
        LocalDate firstDay = LocalDate.of(LocalDate.now().getYear(), LocalDate.now().getMonth(), 1);
        //                LocalDate date = LocalDate.of(2024,02,24 );
        //                LocalDate firstDay = LocalDate.of(2024,02,01 );
        List<TongHopResponse> list = this.phanTichLoiRepository.tongHop(firstDay.toString() + "T00:00:00", date.toString() + "T23:59:59");
        return list;
    }

    // * tìm kiếm theo khoảng thời gian
    public List<TongHopResponse> searchTongHopByTime(DateTimeSearchDTO request) {
        List<TongHopResponse> list =
            this.phanTichLoiRepository.tongHop(request.getStartDate() + "T00:00:00", request.getEndDate() + "T23:59:59");
        return list;
    }

    // * Tổng hợp tính toán
    public List<TongHopResponse> tongHopCaculate() {
        LocalDate date = LocalDate.now();
        LocalDate firstDay = LocalDate.of(LocalDate.now().getYear(), LocalDate.now().getMonth(), 1);
        List<TongHopResponse> list =
            this.phanTichLoiRepository.tongHopCaculate(firstDay.toString() + "T00:00:00", date.toString() + "T23:59:59");
        return list;
    }

    // * search Tong hop caculate
    public List<TongHopResponse> searchTongHopCaculate(DateTimeSearchDTO request) {
        List<TongHopResponse> list =
            this.phanTichLoiRepository.tongHopCaculate(request.getStartDate() + "T00:00:00", request.getEndDate() + "T23:59:59");
        return list;
    }

    public List<DonBaoHanhResponse> ExportListDonBaoHanh(DateTimeSearchDTO request) {
        List<DonBaoHanhResponse> donBaoHanhResponses =
            this.donBaoHanhRepository.ExportListDonBaoHanh(request.getStartDate() + "T00:00:00", request.getEndDate() + "T23:59:59");
        return donBaoHanhResponses;
    }

    //☺ ExportListChiTietDonBaoHanh
    public List<SanPhamResponse> ExportListChiTietDonBaoHanh(DateTimeSearchDTO request) {
        List<SanPhamResponse> sanPhamResponses =
            this.donBaoHanhRepository.ExportListChiTietDonBaoHanh(request.getStartDate() + "T00:00:00", request.getEndDate() + "T23:59:59");
        return sanPhamResponses;
    }

    //☺ExportPhanLoaiChiTietDonBaoHanh
    public List<PhanLoaiChiTietDonBaoHanhResponse> ExportPhanLoaiChiTietDonBaoHanh(DateTimeSearchDTO request) {
        List<PhanLoaiChiTietDonBaoHanhResponse> phanLoaiChiTietDonBaoHanhResponses =
            this.phanLoaiChiTietTiepNhanRepository.ExportPhanLoaiChiTietDonBaoHanh(
                    request.getStartDate() + "T00:00:00",
                    request.getEndDate() + "T23:59:59"
                );
        return phanLoaiChiTietDonBaoHanhResponses;
    }

    //☺ Xuất file excel format mới
    public List<TongHopNewResponse> tongHopNew(DateTimeSearchDTO request) {
        List<TongHopNewResponse> sanPhamResponses =
            this.phanTichLoiRepository.tongHopNew(request.getStartDate() + "T00:00:00", request.getEndDate() + "T23:59:59");
        return sanPhamResponses;
    }

    // * --------------------- San pham -----------------
    //☺ lay danh sach san pham
    public List<SanPhamResponse> getListSanPham() {
        List<SanPhamResponse> list = this.sanPhamRepository.getListSanPham();
        return list;
    }

    //Tinh toan tong loi linh dong loi ky thuat
    public Response caculateErrors(Long id) {
        Response response = new Response(0, 0);
        Integer loiKyThuat = 0;
        Integer loiLinhDong = 0;
        List<PhanTichSanPham> phanTichSanPhamList = this.phanTichSanPhamRepository.findAllByPhanLoaiChiTietTiepNhanId(id);
        for (PhanTichSanPham phanTichSanPham : phanTichSanPhamList) {
            List<PhanTichLoi> phanTichLois = this.phanTichLoiRepository.findAllByPhanTichSanPhamId(phanTichSanPham.getId());
            for (PhanTichLoi phanTichLoi : phanTichLois) {
                if (phanTichLoi.getGhiChu().equals("Lỗi kỹ thuật") && phanTichLoi.getSoLuong() != null) {
                    loiKyThuat++;
                } else if (phanTichLoi.getGhiChu().equals("Lỗi linh động") && phanTichLoi.getSoLuong() != null) {
                    loiLinhDong++;
                }
            }
        }
        response.setLoiKyThuat(loiKyThuat);
        response.setLoiLinhDong(loiLinhDong);
        return response;
    }

    // * ------------------------------------- danh sách xuất kho --------------------------------------
    //☺ get all data
    public List<DanhSachXuatKho> getDataDsXuatKho() {
        List<DanhSachXuatKho> list = this.danhSachXuatKhoRepository.findAll();
        return list;
    }

    //☺ insert data danh sách xuất kho
    public void insertDsXuatKho(DanhSachXuatKho request) {
        this.danhSachXuatKhoRepository.save(request);
    }

    //☺ update data danh sách xuất kho
    public void updateDsXuatKho(DanhSachXuatKho request) {
        DanhSachXuatKho response = this.danhSachXuatKhoRepository.findById(request.getId()).orElse(null);
        if (response == null) {
            System.out.println("Không tìm thấy dữ liệu");
        } else {
            response.setTimeUpdate(request.getTimeUpdate());
            response.setUser(request.getUser());
            response.setNumberOfUpdate(request.getNumberOfUpdate());
            this.danhSachXuatKhoRepository.save(response);
        }
    }

    // * ------------------- Chi tiet xuat kho --------------------------------
    //☺ view data chi tiet xuat kho
    public List<ChiTietXuatKhoResponse> getAllDataChiTietXuatKho(Long id) {
        List<ChiTietXuatKhoResponse> list = this.chiTietXuatKhoRepository.getAll(id);
        return list;
    }

    // ☺ insert/ update
    public void updateChiTietXuatKho(ChiTietXuatKhoDTO request) {
        if (request.getType().equals("insert")) {
            DanhSachXuatKho item = new DanhSachXuatKho();
            item.setMonth(request.getMonth());
            item.setYear(request.getYear());
            item.setUser(request.getUser());
            item.setTimeCreate(request.getTimeUpdate());
            item.setTimeUpdate(request.getTimeUpdate());
            item.setNumberOfUpdate(request.getNumberOfUpdate());
            this.danhSachXuatKhoRepository.save(item);
            for (ChiTietXuatKho chiTietXuatKho : request.getChiTietXuatKho()) {
                chiTietXuatKho.setDanhSachXuatKhoId(item.getId());
                this.chiTietXuatKhoRepository.save(chiTietXuatKho);
            }
        } else if (request.getType().equals("update")) {
            this.chiTietXuatKhoRepository.deleteByDanhSachXuatKhoId(request.getId());
            DanhSachXuatKho response = this.danhSachXuatKhoRepository.findById(request.getId()).orElse(null);
            response.setUser(request.getUser());
            response.setTimeUpdate(request.getTimeUpdate());
            response.setNumberOfUpdate(request.getNumberOfUpdate());
            this.danhSachXuatKhoRepository.save(response);
            for (ChiTietXuatKho chiTietXuatKho : request.getChiTietXuatKho()) {
                chiTietXuatKho.setDanhSachXuatKhoId(response.getId());
                this.chiTietXuatKhoRepository.save(chiTietXuatKho);
            }
        }
    }

    //☺ Lấy danh sách sản phẩm gốc
    public List<TongHopNewResponse> getListSanPhamOrigin() {
        List<TongHopNewResponse> list = this.sanPhamRepository.getDataInfo();
        return list;
    }

    //☺ Lấy danh sách xuất kho theo tháng năm
    public List<TongHopNewResponse> getXuatKhoList(MonthYearDTO request) {
        List<TongHopNewResponse> list = new ArrayList<>();

        list = this.chiTietXuatKhoRepository.getDataInfo(request.getMonth(), request.getYear());

        return list;
    }
}
