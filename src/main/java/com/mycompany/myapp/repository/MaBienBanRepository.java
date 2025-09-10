package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.DonBaoHanh;
import com.mycompany.myapp.domain.MaBienBan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MaBienBanRepository extends JpaRepository<MaBienBan, Long> {
    //    @Query(
    //        value = "select * from danh_sach_bien_ban MaBienBan where" + " ma_bien_ban like '%TN%' and don_bao_hanh_id = ?1 ",
    //        nativeQuery = true
    //    )
    //    public MaBienBan getBienBanTiepNhanByDonBaoHanhId(Long id);
    @Query(value = "SELECT * FROM danh_sach_bien_ban WHERE ma_bien_ban LIKE '%TN%' AND don_bao_hanh_id = ?1", nativeQuery = true)
    List<MaBienBan> getBienBanTiepNhanByDonBaoHanhId(Long id);

    @Query(
        value = "select * from danh_sach_bien_ban MaBienBan where" + " ma_bien_ban like '%KN%' and don_bao_hanh_id = ?1 ",
        nativeQuery = true
    )
    public List<MaBienBan> getBienBanKiemNghiemByDonBaoHanhId(Long id);

    @Query(value = "select * from danh_sach_bien_ban MaBienBan where" + " don_bao_hanh_id = ?1 ", nativeQuery = true)
    public List<MaBienBan> getBienBanByDonBaoHanhId(Long id);

    @Query(
        value = "select * from danh_sach_bien_ban MaBienBan where ma_bien_ban like '%KN%' and don_bao_hanh_id = ?1 and ma_kho = ?2",
        nativeQuery = true
    )
    public List<MaBienBan> getBienBanKiemNghiemByDonBaoHanhIdAndMaKho(Long id, String maKho);

    @Query(value = "select * from danh_sach_bien_ban MaBienBan where ma_bien_ban like '%TL%' and don_bao_hanh_id = ?1", nativeQuery = true)
    List<MaBienBan> getBienBanThanhLyByDonBaoHanhId(Long id);

    @Query(
        value = "select * from danh_sach_bien_ban MaBienBan where ma_bien_ban like '%TL%' and don_bao_hanh_id = ?1 and ma_kho = ?2",
        nativeQuery = true
    )
    List<MaBienBan> getBienBanThanhLyByDonBaoHanhIdAndMaKho(Long id, String maKho);
}
