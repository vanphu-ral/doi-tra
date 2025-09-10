import { IPhanTichSanPham } from 'app/entities/phan-tich-san-pham/phan-tich-san-pham.model';
import { IChiTietSanPhamTiepNhan } from 'app/entities/chi-tiet-san-pham-tiep-nhan/chi-tiet-san-pham-tiep-nhan.model';
import { IDanhSachTinhTrang } from 'app/entities/danh-sach-tinh-trang/danh-sach-tinh-trang.model';

export interface IPhanLoaiChiTietTiepNhan {
  id?: number | null;
  soLuong?: number | null;
  phanTichSanPhams?: IPhanTichSanPham[] | null;
  chiTietSanPhamTiepNhan?: IChiTietSanPhamTiepNhan | null;
  danhSachTinhTrang?: IDanhSachTinhTrang | null;
}

export class PhanLoaiChiTietTiepNhan implements IPhanLoaiChiTietTiepNhan {
  constructor(
    public id?: number | null,
    public soLuong?: number | null,
    public phanTichSanPhams?: IPhanTichSanPham[] | null,
    public chiTietSanPhamTiepNhan?: IChiTietSanPhamTiepNhan | null,
    public danhSachTinhTrang?: IDanhSachTinhTrang | null
  ) {}
}

export function getPhanLoaiChiTietTiepNhanIdentifier(phanLoaiChiTietTiepNhan: IPhanLoaiChiTietTiepNhan): number | null {
  return phanLoaiChiTietTiepNhan.id ?? null;
}
