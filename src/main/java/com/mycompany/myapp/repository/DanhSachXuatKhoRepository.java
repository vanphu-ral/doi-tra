package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.DanhSachXuatKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DanhSachXuatKhoRepository extends JpaRepository<DanhSachXuatKho, Long> {}
