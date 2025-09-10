package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.PhanTichSanPham;
import java.util.List;
import javax.transaction.Transactional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the PhanTichSanPham entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PhanTichSanPhamRepository extends JpaRepository<PhanTichSanPham, Long> {
    public List<PhanTichSanPham> findAllByPhanLoaiChiTietTiepNhanId(Long id);

    void deleteByPhanLoaiChiTietTiepNhanId(Long id);

    @Query(
        "SELECT pt.id FROM PhanTichSanPham pt " +
        "JOIN pt.phanLoaiChiTietTiepNhan pl " +
        "JOIN pl.chiTietSanPhamTiepNhan ct " +
        "WHERE ct.donBaoHanh.id = :donBaoHanhId"
    )
    List<Long> findIdByDonBaoHanhId(@Param("donBaoHanhId") Long donBaoHanhId);

    @Modifying
    @Transactional
    @Query("DELETE FROM PhanTichSanPham p WHERE p.phanLoaiChiTietTiepNhan.id IN :phanLoaiIds")
    void deletePhanTichByPhanLoaiIds(@Param("phanLoaiIds") List<Long> phanLoaiIds);
}
