package com.mycompany.myapp.domain;

public class Response {

    private Integer loiKyThuat;
    private Integer loiLinhDong;

    public Response(Integer loiKyThuat, Integer loiLinhDong) {
        this.loiKyThuat = loiKyThuat;
        this.loiLinhDong = loiLinhDong;
    }

    public Response() {}

    public Integer getLoiKyThuat() {
        return loiKyThuat;
    }

    public void setLoiKyThuat(Integer loiKyThuat) {
        this.loiKyThuat = loiKyThuat;
    }

    public Integer getLoiLinhDong() {
        return loiLinhDong;
    }

    public void setLoiLinhDong(Integer loiLinhDong) {
        this.loiLinhDong = loiLinhDong;
    }
}
