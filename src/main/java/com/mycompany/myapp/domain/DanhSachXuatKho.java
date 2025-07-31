package com.mycompany.myapp.domain;

import javax.persistence.*;

@Entity
@Table(name = "danh_sach_xuat_kho")
public class DanhSachXuatKho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "month")
    private String month;

    @Column(name = "year")
    private String year;

    @Column(name = "user")
    private String user;

    @Column(name = "time_create")
    private String timeCreate;

    @Column(name = "time_update")
    private String timeUpdate;

    @Column(name = "number_of_update")
    private Integer numberOfUpdate;

    public DanhSachXuatKho() {}

    public DanhSachXuatKho(Long id, String month, String year, String user, String timeCreate, String timeUpdate, Integer numberOfUpdate) {
        this.id = id;
        this.month = month;
        this.year = year;
        this.user = user;
        this.timeCreate = timeCreate;
        this.timeUpdate = timeUpdate;
        this.numberOfUpdate = numberOfUpdate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getTimeCreate() {
        return timeCreate;
    }

    public void setTimeCreate(String timeCreate) {
        this.timeCreate = timeCreate;
    }

    public String getTimeUpdate() {
        return timeUpdate;
    }

    public void setTimeUpdate(String timeUpdate) {
        this.timeUpdate = timeUpdate;
    }

    public Integer getNumberOfUpdate() {
        return numberOfUpdate;
    }

    public void setNumberOfUpdate(Integer numberOfUpdate) {
        this.numberOfUpdate = numberOfUpdate;
    }
}
