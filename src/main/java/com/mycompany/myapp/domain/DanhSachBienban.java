package com.mycompany.myapp.domain;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "danh_sach_bien_ban")
@Getter
@Setter
public class DanhSachBienban {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "ma_bien_ban", nullable = true)
    private String maBienBan;

    @Column(name = "so_lan_in", nullable = true)
    private Long soLanIn;

    @Column(name = "don_bao_hanh_id", nullable = true)
    private Long donBaoHanhId;

    @Column(name = "loai_bien_ban", length = 45, nullable = true)
    private String loaiBienBan;

    @Column(name = "ma_kho", length = 45, nullable = true)
    private String maKho;
}
