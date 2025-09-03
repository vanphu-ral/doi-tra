package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.DanhSachBienban;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DanhSachBienBanRepository extends JpaRepository<DanhSachBienban, Long> {
    void deleteByDonBaoHanhId(Long donBaoHanhId);

    List<DanhSachBienban> findByDonBaoHanhId(Long donBaoHanhId);
}
