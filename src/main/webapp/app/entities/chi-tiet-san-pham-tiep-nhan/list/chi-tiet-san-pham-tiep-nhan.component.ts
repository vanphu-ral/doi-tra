import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IChiTietSanPhamTiepNhan } from '../chi-tiet-san-pham-tiep-nhan.model';
import { ChiTietSanPhamTiepNhanService } from '../service/chi-tiet-san-pham-tiep-nhan.service';
import { ChiTietSanPhamTiepNhanDeleteDialogComponent } from '../delete/chi-tiet-san-pham-tiep-nhan-delete-dialog.component';
import { AngularGridInstance, Column, ExternalResource, FieldType, Filters, Formatters, GridOption } from 'angular-slickgrid';
import { ExcelExportService } from '@slickgrid-universal/excel-export';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'jhi-chi-tiet-san-pham-tiep-nhan',
  templateUrl: './chi-tiet-san-pham-tiep-nhan.component.html',
})
export class ChiTietSanPhamTiepNhanComponent implements OnInit {
  tongHopUrl = this.applicationConfigService.getEndpointFor('api/tong-hop');
  searchDateUrl = this.applicationConfigService.getEndpointFor('api/search-date');
  tongHopCaculateUrl = this.applicationConfigService.getEndpointFor('api/tong-hop-caculate');
  tongHopDBHUrl = this.applicationConfigService.getEndpointFor('api/thong-tin-don-bao-hanh');
  sanPhamDBHUrl = this.applicationConfigService.getEndpointFor('api/san-pham-don-bao-hanh2');
  phanLoaiSanPhamUrl = this.applicationConfigService.getEndpointFor('api/chi-tiet-phan-loai-san-pham');
  tongHopNewUrl = this.applicationConfigService.getEndpointFor('api/tong-hop-new');
  chiTietSanPhamTiepNhans?: IChiTietSanPhamTiepNhan[];
  popupViewCTL = false;
  isLoading = false;
  columnDefinitions: Column[] = [];
  conlumDefinitionCTL: Column[] = [];
  gridOptions: GridOption = {};
  gridOptionCTL: GridOption = {};
  angularGrid!: AngularGridInstance;
  gridObj: any;
  dataViewObj: any;
  chiTietSanPhamTiepNhan: any[] = [];
  chiTietSanPhamTiepNhanGoc: any[] = [];
  chiTietSanPhamTiepNhanCTL: ITongHop[] = [];
  chiTietSanPhamTiepNhanCTLGoc: ITongHop[] = [];
  chiTietSanPhamTiepNhanExport: IChiTietSanPhamTiepNhan[] = [];
  excelExportService: ExcelExportService;

  //bien chua thong tin ngay mac dinh
  dateTimeSearchKey: { startDate: string; endDate: string } = { startDate: '', endDate: '' };
  fileName = 'bao-cao-doi-tra';
  fileNameCT = 'thong-tin-phan-tich-don-bao-hanh';

  dataSearch: {
    maTiepNhan: string;
    nhanVienGiaoHang: string;
    tenKhachHang: string;
    nhomKhachHang: string;
    tinhThanh: string;
    tenSanPham: string;
    tenNganh: string;
    tenChungLoai: string;
    tenNhomSanPham: string;
  } = {
    maTiepNhan: '',
    nhanVienGiaoHang: '',
    tenKhachHang: '',
    nhomKhachHang: '',
    tinhThanh: '',
    tenSanPham: '',
    tenNganh: '',
    tenChungLoai: '',
    tenNhomSanPham: '',
  };
  data: {
    maTiepNhan?: string;
    maKhachHang?: string;
    tenKhachHang?: string;
    nhomKhachHang?: string;
    tinhThanh?: string;
    ngayTaoDon?: string;
    tongTiepNhan?: string;
    ngayTiepNhan?: Date;
    ngayTraBienBan?: Date;
    nguoiTaoDon?: string;
    nhanVienGiaoHang?: string;
    trangThai?: string;
  }[] = [];

  dataSP: {
    donBaoHanhId?: number;
    maTiepNhan?: string;
    idSPTN?: number;
    tenSanPham?: string;
    tenNganh?: string;
    tenChungLoai?: string;
    tenNhomSanPham?: string;
    nhomSPTheoCongSuat?: string;
    phanLoaiSP: string;
    slTiepNhan?: number;
    trangThai?: string;
  }[] = [];

  dataCT: {
    idSPTN?: number;
    donBaoHanhId?: number;
    maTiepNhan?: string;
    phanLoaiSP?: string;
    soLuongPL?: number;
  }[] = [];

  dataExcel: {
    tenSanPham: string;
    nganh: string;
    sanPham: string;
    nhomSanPham: string;
    chungLoai: string;
    nhomSanPhamTheoCongSuat: string;
    tongDoiTra: number;
    soLuongXuatKho: number;
    tongLoi: number;
    tongLoiKyThuat: number;
    tongLoiLinhDong: number;
    tiLeDoiTraLoiKyThuat: number;
    tiLeDoiTraLoiLinhDong: number;
    tiLeDoiTra: number;
    tiLePPMDoiTra: number;
    loi1: number;
    loi2: number;
    loi3: number;
    loi4: number;
    loi5: number;
    loi6: number;
    loi7: number;
    loi8: number;
    loi9: number;
    loi10: number;
    loi11: number;
    loi12: number;
    loi13: number;
    loi14: number;
    loi15: number;
    loi16: number;
    loi17: number;
    loi18: number;
    loi19: number;
    loi20: number;
    loi21: number;
    loi22: number;
    loi23: number;
    loi24: number;
    loi25: number;
    loi26: number;
    loi27: number;
    loi28: number;
    loi29: number;
    loi30: number;
    loi31: number;
    loi32: number;
    loi33: number;
    loi34: number;
    loi35: number;
    loi36: number;
    loi37: number;
    loi38: number;
    loi39: number;
  }[] = [];

  startDates = '';
  endDates = '';
  dataCTL: ITongHop[] = [];

  constructor(
    protected chiTietSanPhamTiepNhanService: ChiTietSanPhamTiepNhanService,
    protected modalService: NgbModal,
    protected applicationConfigService: ApplicationConfigService,
    protected http: HttpClient
  ) {
    this.excelExportService = new ExcelExportService();
  }

  loadAll(): void {
    this.isLoading = true;
    // console.log("checkdate:",this.dateTimeSearchKey)
    this.chiTietSanPhamTiepNhanService.query().subscribe({
      next: (res: HttpResponse<IChiTietSanPhamTiepNhan[]>) => {
        this.isLoading = false;
        this.chiTietSanPhamTiepNhans = res.body ?? [];
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
  startDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-01`;
  }
  endDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
  ngOnInit(): void {
    const today = new Date();
    this.dateTimeSearchKey.startDate = this.startDate(today);
    this.dateTimeSearchKey.endDate = this.endDate(today);
    this.startDates = this.startDate(today);
    this.endDates = this.endDate(today);
    // console.log('date time', this.dateTimeSearchKey);
    // console.log('check time', this.dateTimeSearchKey);

    this.loadAll();
    this.dataShow();
    this.getTongHopUrl();
  }

  dataShow(): void {
    this.columnDefinitions = [
      {
        id: 'id',
        field: 'id',
        name: 'STT',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        sortable: true,
        minWidth: 40,
        maxWidth: 50,
      },
      {
        id: 'maTiepNhan',
        field: 'maTiepNhan',
        name: 'Mã tiếp nhận',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 140,
        minWidth: 50,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'ngayTiepNhan',
        field: 'ngayTiepNhan',
        name: 'Ngày tiếp nhận',
        formatter: Formatters.dateTimeIso,
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 150,
        minWidth: 50,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'ngayPhanTich',
        field: 'ngayPhanTich',
        name: 'Ngày phân tích',
        formatter: Formatters.dateTimeIso,
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 150,
        minWidth: 50,
      },
      {
        id: 'nhanVienGiaoHang',
        field: 'nhanVienGiaoHang',
        name: 'Nhân viên giao hàng',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 150,
        minWidth: 50,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'tenKhachHang',
        field: 'tenKhachHang',
        name: 'Tên Khách hàng',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 360,
        minWidth: 50,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'nhomKhachHang',
        field: 'nhomKhachHang',
        name: 'Nhóm khách hàng',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 360,
        minWidth: 50,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'tinhThanh',
        field: 'tinhThanh',
        name: 'Tỉnh thành',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 10,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'tenSanPham',
        field: 'tenSanPham',
        name: 'Tên sản phẩm',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 360,
        minWidth: 150,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'tenNganh',
        field: 'tenNganh',
        name: 'Ngành',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 50,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'tenChungLoai',
        field: 'tenChungLoai',
        name: 'Chủng loại',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 200,
        minWidth: 50,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'tenNhomSanPham',
        field: 'tenNhomSanPham',
        name: 'Nhóm sản phẩm',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 200,
        minWidth: 50,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'soLuongKhachGiao',
        field: 'soLuongKhachGiao',
        name: 'Số lượng khách giao',
        cssClass: 'column-item',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 20,
      },
      {
        id: 'slTiepNhan',
        field: 'slTiepNhan',
        name: 'Số lượng thực nhận',
        cssClass: 'column-item',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 50,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'tenNhomLoi',
        field: 'tenNhomLoi',
        name: 'Nhóm lỗi',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 50,
      },
      {
        id: 'tongSoLuong',
        field: 'tongSoLuong',
        name: 'Tổng lỗi',
        cssClass: 'column-item',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 80,
        minWidth: 50,
      },
      {
        id: 'trangThai',
        field: 'trangThai',
        name: 'Trạng thái',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 50,
      },
    ];

    this.conlumDefinitionCTL = [
      {
        id: 'id',
        field: 'id',
        name: 'STT',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        sortable: true,
        // maxWidth: 60,
        minWidth: 40,
        maxWidth: 50,
      },
      {
        id: 'maTiepNhan',
        field: 'maTiepNhan',
        name: 'Mã tiếp nhận',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 140,
        minWidth: 50,
      },
      {
        id: 'namSanXuat',
        field: 'namSanXuat',
        name: 'Năm',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        minWidth: 60,
        maxWidth: 60,
      },
      {
        id: 'ngayTiepNhan',
        field: 'ngayTiepNhan',
        name: 'Ngày tiếp nhận',
        formatter: Formatters.dateTimeIso,
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 150,
        minWidth: 50,
      },
      {
        id: 'ngayPhanTich',
        field: 'ngayPhanTich',
        name: 'Ngày phân tích',
        formatter: Formatters.dateTimeIso,
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 150,
        minWidth: 50,
      },
      {
        id: 'nhanVienGiaoHang',
        field: 'nhanVienGiaoHang',
        name: 'Nhân viên giao hàng',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 150,
        minWidth: 50,
      },
      {
        id: 'tenKhachHang',
        field: 'tenKhachHang',
        name: 'Tên Khách hàng',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 360,
        minWidth: 50,
      },
      {
        id: 'nhomKhachHang',
        field: 'nhomKhachHang',
        name: 'Nhóm khách hàng',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 360,
        minWidth: 50,
      },
      {
        id: 'tinhThanh',
        field: 'tinhThanh',
        name: 'Tỉnh thành',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 10,
      },
      {
        id: 'tenSanPham',
        field: 'tenSanPham',
        name: 'Tên sản phẩm',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 360,
        minWidth: 150,
      },
      {
        id: 'tenNganh',
        field: 'tenNganh',
        name: 'Ngành',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 50,
      },
      {
        id: 'tenChungLoai',
        field: 'tenChungLoai',
        name: 'Chủng loại',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 200,
        minWidth: 50,
      },
      {
        id: 'tenNhomSanPham',
        field: 'tenNhomSanPham',
        name: 'Nhóm sản phẩm',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 200,
        minWidth: 50,
      },
      {
        id: 'soLuongKhachGiao',
        field: 'soLuongKhachGiao',
        name: 'Số lượng khách giao',
        cssClass: 'column-item',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 20,
      },
      {
        id: 'slTiepNhan',
        field: 'slTiepNhan',
        name: 'Số lượng thực nhận',
        cssClass: 'column-item',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 50,
      },
      {
        id: 'lotNumber',
        field: 'lotNumber',
        name: 'LOT',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 160,
        minWidth: 60,
      },
      {
        id: 'serial',
        field: 'serial',
        name: 'Serial',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 160,
        minWidth: 50,
      },
      {
        id: 'tenNhomLoi',
        field: 'tenNhomLoi',
        name: 'Tên nhóm lỗi',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 100,
        minWidth: 50,
      },
      {
        id: 'tenLoi',
        field: 'tenLoi',
        name: 'Tên lỗi',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 360,
        minWidth: 200,
      },
      {
        id: 'soLuongTheoTungLoi',
        field: 'soLuongTheoTungLoi',
        cssClass: 'column-item',
        name: 'Số lượng lỗi',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 80,
        minWidth: 10,
      },
    ];
    // console.log('header', this.conlumDefinitionCTL);
    this.gridOptions = {
      enableAutoResize: true,
      enableSorting: true,
      enableFiltering: true,
      enablePagination: true,
      enableAutoSizeColumns: true,
      asyncEditorLoadDelay: 1000,
      pagination: {
        pageSizes: [20, 50, this.chiTietSanPhamTiepNhan.length],
        pageSize: this.chiTietSanPhamTiepNhan.length,
      },
      presets: {
        columns: [
          { columnId: 'maTiepNhan' },
          { columnId: 'namSanXuat' },
          { columnId: 'ngayTiepNhan' },
          { columnId: 'ngayPhanTich' },
          { columnId: 'nhanVienGiaoHang' },
          { columnId: 'tenKhachHang' },
          { columnId: 'nhomKhachHang' },
          { columnId: 'tinhThanh' },
          { columnId: 'tenSanPham' },
          { columnId: 'tenNganh' },
          { columnId: 'tenChungLoai' },
          { columnId: 'tenNhomSanPham' },
          { columnId: 'soLuongKhachGiao' },
          { columnId: 'slTiepNhan' },
          { columnId: 'tenNhomLoi' },
          { columnId: 'tongSoLuong' },
          { columnId: 'trangThai' },
        ],
      },
      editable: true,
      enableCellNavigation: true,
      gridHeight: 620,
      gridWidth: '100%',
      autoHeight: true,
      autoFitColumnsOnFirstLoad: true,
      asyncEditorLoading: true,
      forceFitColumns: true,
      enableExcelExport: true,
      // enableExcelCopyBuffer: true,
      excelExportOptions: {
        sanitizeDataExport: true,
        filename: 'bao-cao-doi-tra',
        sheetName: 'bao-cao-tong-hop',
      },
      registerExternalResources: [new ExcelExportService() as any],
      // registerExternalResources: [this.excelExportService],
    };
    this.gridOptionCTL = {
      enableAutoResize: true,
      enableSorting: true,
      enableFiltering: true,
      enablePagination: true,
      pagination: {
        pageSizes: [20, 50, this.chiTietSanPhamTiepNhanCTL.length],
        pageSize: this.chiTietSanPhamTiepNhanCTL.length,
      },

      editable: true,
      enableCellNavigation: true,
      gridHeight: 620,
      gridWidth: '100%',
      autoHeight: true,
      presets: {
        columns: [
          { columnId: 'maTiepNhan' },
          { columnId: 'namSanXuat' },
          { columnId: 'ngayTiepNhan' },
          { columnId: 'ngayPhanTich' },
          { columnId: 'nhanVienGiaoHang' },
          { columnId: 'tenKhachHang' },
          { columnId: 'nhomKhachHang' },
          { columnId: 'tinhThanh' },
          { columnId: 'tenSanPham' },
          { columnId: 'tenNganh' },
          { columnId: 'tenChungLoai' },
          { columnId: 'tenNhomSanPham' },
          { columnId: 'soLuongKhachGiao' },
          { columnId: 'slTiepNhan' },
          { columnId: 'lotNumber' },
          { columnId: 'serial' },
          { columnId: 'tenNhomLoi' },
          { columnId: 'tenLoi' },
          { columnId: 'soLuongTheoTungLoi' },
        ],
      },
      // enableExcelExport: true,
      // // enableExcelCopyBuffer: true,
      // excelExportOptions: {
      //   sanitizeDataExport: true,
      //   filename: 'bao-cao-doi-tra',
      //   sheetName: 'bao-cao-tong-hop',
      // },
      // registerExternalResources: [new ExcelExportService() as any],
      // registerExternalResources: [this.excelExportService],
    };
  }

  getTongHopUrl(): void {
    this.http.get<any>(this.tongHopUrl).subscribe(res => {
      this.chiTietSanPhamTiepNhanCTLGoc = res.sort((a: any, b: any) => b.donBaoHanhId - a.donBaoHanhId);
      for (let i = 0; i < this.chiTietSanPhamTiepNhanCTLGoc.length; ++i) {
        this.chiTietSanPhamTiepNhanCTLGoc[i].id = i + 1;
      }
      this.dataCTL = res.sort((a: any, b: any) => b.donBaoHanhId - a.donBaoHanhId);
      this.chiTietSanPhamTiepNhanCTL = this.chiTietSanPhamTiepNhanCTLGoc;
      // console.log('tong Hop', this.dataCTL);
    });
    this.http.get<any>(this.tongHopCaculateUrl).subscribe(resTongHop => {
      this.chiTietSanPhamTiepNhanGoc = resTongHop.sort((a: any, b: any) => b.donBaoHanhId - a.donBaoHanhId);
      for (let i = 0; i < this.chiTietSanPhamTiepNhanGoc.length; ++i) {
        this.chiTietSanPhamTiepNhanGoc[i].id = i + 1;
      }
      this.data = resTongHop.sort((a: any, b: any) => b.donBaoHanhId - a.donBaoHanhId);
      this.chiTietSanPhamTiepNhan = this.chiTietSanPhamTiepNhanGoc;
      // console.log('caculate', resTongHop);
      // console.log('data total', this.chiTietSanPhamTiepNhan);
    });
  }

  trackId(_index: number, item: IChiTietSanPhamTiepNhan): number {
    return item.id!;
  }

  delete(chiTietSanPhamTiepNhan: IChiTietSanPhamTiepNhan): void {
    const modalRef = this.modalService.open(ChiTietSanPhamTiepNhanDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.chiTietSanPhamTiepNhan = chiTietSanPhamTiepNhan;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }

  changeDate(): void {
    let dateTimeSearchKey: { startDate: string; endDate: string } = { startDate: '', endDate: '' };
    document.getElementById('dateForm')?.addEventListener('submit', function (event) {
      event.preventDefault();

      const startDateInp = document.getElementById('startDate') as HTMLInputElement;
      const endDateInp = document.getElementById('endDate') as HTMLInputElement;

      const startDate = startDateInp.value;
      const endDate = endDateInp.value;
      dateTimeSearchKey = { startDate: startDateInp.value, endDate: endDateInp.value };
    });
    setTimeout(() => {
      // console.log('startDate:', dateTimeSearchKey);
      this.dateTimeSearchKey = dateTimeSearchKey;
      this.http.post<any>(this.tongHopUrl, dateTimeSearchKey).subscribe(res => {
        // console.log('check ressult search:', res);
        this.chiTietSanPhamTiepNhanCTLGoc = res;
        for (let i = 0; i < this.chiTietSanPhamTiepNhanCTLGoc.length; ++i) {
          this.chiTietSanPhamTiepNhanCTLGoc[i].id = i + 1;
        }
        this.dataCTL = res.sort((a: any, b: any) => b.donBaoHanhId - a.donBaoHanhId);
        this.chiTietSanPhamTiepNhanCTL = this.chiTietSanPhamTiepNhanCTLGoc;
      });

      this.http.post<any>(this.tongHopCaculateUrl, dateTimeSearchKey).subscribe(resCaculate => {
        this.chiTietSanPhamTiepNhanGoc = resCaculate;
        for (let i = 0; i < this.chiTietSanPhamTiepNhanGoc.length; ++i) {
          this.chiTietSanPhamTiepNhanGoc[i].id = i + 1;
        }
        this.data = resCaculate.sort((a: any, b: any) => b.donBaoHanhId - a.donBaoHanhId);
        this.chiTietSanPhamTiepNhan = this.chiTietSanPhamTiepNhanGoc;
      });
    }, 100);
  }

  exportToExcel(): void {
    this.getDonBaoHanhInfo();
    this.getChiTietDonBaoHanhInfo();
    this.getPhanLoaiChiTietDonBaoHanhInfo();
    // console.log(this.data, this.dataCT, this.dataSP);
    setTimeout(() => {
      const donBaoHanh = this.data.map(item => ({
        maTiepNhan: item.maTiepNhan,
        maKhachHang: item.maKhachHang,
        tenKhachHang: item.tenKhachHang,
        nhomKhachHang: item.nhomKhachHang,
        tinhThanh: item.tinhThanh,
        ngayTaoDon: item.ngayTaoDon,
        tongTiepNhan: item.tongTiepNhan,
        ngayTiepNhan: item.ngayTiepNhan,
        ngayTraBienBan: item.ngayTraBienBan,
        nguoiTaoDon: item.nguoiTaoDon,
        nhanVienGiaoHang: item.nhanVienGiaoHang,
        trangThai: item.trangThai,
      }));

      const SPdonBaoHanh = this.dataSP.map(item => ({
        donBaoHanhId: item.donBaoHanhId,
        maTiepNhan: item.maTiepNhan,
        idSPTN: item.idSPTN,
        tenSanPham: item.tenSanPham,
        tenNganh: item.tenNganh,
        tenChungLoai: item.tenChungLoai,
        tenNhomSanPham: item.tenNhomSanPham,
        nhomSPTheoCongSuat: item.nhomSPTheoCongSuat,
        phanLoaiSP: item.phanLoaiSP,
        slTiepNhan: item.slTiepNhan,
        trangThai: item.trangThai,
      }));

      const phanLoaiSP = this.dataCT.map(item => ({
        donBaoHanhId: item.donBaoHanhId,
        maTiepNhan: item.maTiepNhan,
        idSPTN: item.idSPTN,
        phanLoaiSP: item.phanLoaiSP,
        soLuong: item.soLuongPL,
      }));

      const chiTietPhanLoaiSanPham = this.dataCTL.map((itemCTL: ITongHop) => ({
        donBaoHanhId: itemCTL.donBaoHanhId,
        maTiepNhan: itemCTL.maTiepNhan,
        namSanXuat: itemCTL.namSanXuat,
        ngayTiepNhan: itemCTL.ngayTiepNhan,
        ngayPhanTich: itemCTL.ngayPhanTich,
        idSP: itemCTL.idSP,
        idSPTN: itemCTL.idSPTN,
        // idPL: itemCTL.idPL,
        tenSanPham: itemCTL.tenSanPham,
        lotNumber: itemCTL.lotNumber,
        serial: itemCTL.serial,
        tenNhomLoi: itemCTL.tenNhomLoi,
        tenLoi: itemCTL.tenLoi,
        soLuongTheoTungLoi: itemCTL.soLuongTheoTungLoi,
        trangThai: itemCTL.trangThai,
        thoiGianPhanTich: itemCTL.ngayPhanTich,
        nguoiPhanTich: itemCTL.tenNhanVienPhanTich,
        id: itemCTL.id,
      }));
      // console.log('dataCTL', this.dataCTL);
      // const data = document.getElementById("table-data");
      const wsDBH: XLSX.WorkSheet = XLSX.utils.json_to_sheet(donBaoHanh);
      const wsSPDBH: XLSX.WorkSheet = XLSX.utils.json_to_sheet(SPdonBaoHanh);
      const wsCTPLSP: XLSX.WorkSheet = XLSX.utils.json_to_sheet(phanLoaiSP);
      const wsPTCTSP: XLSX.WorkSheet = XLSX.utils.json_to_sheet(chiTietPhanLoaiSanPham);

      // create workbook
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      const wbPT: XLSX.WorkBook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, wsDBH, 'don-bao-hanh');
      XLSX.utils.book_append_sheet(wb, wsSPDBH, 'san-pham-don-bao-hanh');
      XLSX.utils.book_append_sheet(wbPT, wsCTPLSP, 'chi-tiet-phan-loai-san-pham');
      XLSX.utils.book_append_sheet(wbPT, wsPTCTSP, 'phan-tich-chi-tiet-san-pham');

      XLSX.writeFile(wb, `${this.fileName}.xlsx`);
      XLSX.writeFile(wbPT, `${this.fileNameCT}.xlsx`);
    }, 3000);
  }

  openPopupViewCTL(): void {
    // this.handleSearchCTL();
    setTimeout(() => {
      this.popupViewCTL = true;
    }, 100);
    // this.chiTietSanPhamTiepNhanCTL = this.chiTietSanPhamTiepNhanCTLGoc;
  }

  closePopupViewCTL(): void {
    this.popupViewCTL = false;
  }

  onFilterChange(event: Event): void {
    const filterText = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.angularGrid) {
      this.angularGrid.filterService.updateFilters([{ columnId: 'donBaoHanhId', operator: 'Contains', searchTerms: [filterText] }]);
    }
  }
  // Lấy thông tin từ khóa tìm kiếm tổng hợp
  onSearchChange(e: any): void {
    // detail is the args data payload
    const args = e.detail;
    if (args.columnId === 'maTiepNhan') {
      if (args.searchTerms === undefined) {
        this.dataSearch.maTiepNhan = '';
      } else {
        this.dataSearch.maTiepNhan = args.searchTerms[0];
      }
    }
    if (args.columnId === 'nhanVienGiaoHang') {
      if (args.searchTerms === undefined) {
        this.dataSearch.nhanVienGiaoHang = '';
      } else {
        this.dataSearch.nhanVienGiaoHang = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tenKhachHang') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tenKhachHang = '';
      } else {
        this.dataSearch.tenKhachHang = args.searchTerms[0];
      }
    }
    if (args.columnId === 'nhomKhachHang') {
      if (args.searchTerms === undefined) {
        this.dataSearch.nhomKhachHang = '';
      } else {
        this.dataSearch.nhomKhachHang = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tinhThanh') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tinhThanh = '';
      } else {
        this.dataSearch.tinhThanh = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tenSanPham') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tenSanPham = '';
      } else {
        this.dataSearch.tenSanPham = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tenNganh') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tenNganh = '';
      } else {
        this.dataSearch.tenNganh = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tenChungLoai') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tenChungLoai = '';
      } else {
        this.dataSearch.tenChungLoai = args.searchTerms[0];
      }
    }
    if (args.columnId === 'tenNhomSanPham') {
      if (args.searchTerms === undefined) {
        this.dataSearch.tenNhomSanPham = '';
      } else {
        this.dataSearch.tenNhomSanPham = args.searchTerms[0];
      }
    }
    this.handleSearchCTL();
    // console.log('header search body', this.dataSearch);
    // this.handleSearchCTL();
  }
  //Filter trong danh sách chi tiết
  handleSearchCTL(): void {
    this.data = this.chiTietSanPhamTiepNhanGoc.filter(
      item =>
        item.maTiepNhan.toLowerCase().includes(this.dataSearch.maTiepNhan) &&
        item.nhanVienGiaoHang.toLowerCase().includes(this.dataSearch.nhanVienGiaoHang) &&
        item.tenKhachHang.toLowerCase().includes(this.dataSearch.tenKhachHang) &&
        item.nhomKhachHang.toLowerCase().includes(this.dataSearch.nhomKhachHang) &&
        item.tinhThanh.toLowerCase().includes(this.dataSearch.tinhThanh) &&
        item.tenSanPham.toLowerCase().includes(this.dataSearch.tenSanPham) &&
        item.tenNganh.toLowerCase().includes(this.dataSearch.tenNganh) &&
        item.tenChungLoai.toLowerCase().includes(this.dataSearch.tenChungLoai) &&
        item.tenNhomSanPham.toLowerCase().includes(this.dataSearch.tenNhomSanPham)
    );
    this.chiTietSanPhamTiepNhanCTL = this.chiTietSanPhamTiepNhanCTLGoc.filter(
      item =>
        item.maTiepNhan.toLowerCase().includes(this.dataSearch.maTiepNhan) &&
        item.nhanVienGiaoHang.toLowerCase().includes(this.dataSearch.nhanVienGiaoHang) &&
        item.tenKhachHang.toLowerCase().includes(this.dataSearch.tenKhachHang) &&
        item.nhomKhachHang.toLowerCase().includes(this.dataSearch.nhomKhachHang) &&
        item.tinhThanh.toLowerCase().includes(this.dataSearch.tinhThanh) &&
        item.tenSanPham.toLowerCase().includes(this.dataSearch.tenSanPham) &&
        item.tenNganh.toLowerCase().includes(this.dataSearch.tenNganh) &&
        item.tenChungLoai.toLowerCase().includes(this.dataSearch.tenChungLoai) &&
        item.tenNhomSanPham.toLowerCase().includes(this.dataSearch.tenNhomSanPham)
    );
    // console.log('result', this.chiTietSanPhamTiepNhanCTL);
    this.dataCTL = this.chiTietSanPhamTiepNhanCTLGoc.filter(
      item =>
        item.maTiepNhan.toLowerCase().includes(this.dataSearch.maTiepNhan) &&
        item.nhanVienGiaoHang.toLowerCase().includes(this.dataSearch.nhanVienGiaoHang) &&
        item.tenKhachHang.toLowerCase().includes(this.dataSearch.tenKhachHang) &&
        item.nhomKhachHang.toLowerCase().includes(this.dataSearch.nhomKhachHang) &&
        item.tinhThanh.toLowerCase().includes(this.dataSearch.tinhThanh) &&
        item.tenSanPham.toLowerCase().includes(this.dataSearch.tenSanPham) &&
        item.tenNganh.toLowerCase().includes(this.dataSearch.tenNganh) &&
        item.tenChungLoai.toLowerCase().includes(this.dataSearch.tenChungLoai) &&
        item.tenNhomSanPham.toLowerCase().includes(this.dataSearch.tenNhomSanPham)
    );
  }
  angularGridReady(angularGrid: any): void {
    this.angularGrid = angularGrid;

    // the Angular Grid Instance exposes both Slick Grid & DataView objects
    this.gridObj = angularGrid.slickGrid;
    this.dataViewObj = angularGrid.dataView;
  }
  getDonBaoHanhInfo(): void {
    this.http.post<any>(this.tongHopDBHUrl, this.dateTimeSearchKey).subscribe((res: any) => {
      this.data = res;
    });
  }
  getChiTietDonBaoHanhInfo(): void {
    this.http.post<any>(this.sanPhamDBHUrl, this.dateTimeSearchKey).subscribe((res: any) => {
      this.dataSP = res;
    });
  }
  getPhanLoaiChiTietDonBaoHanhInfo(): void {
    this.http.post<any>(this.phanLoaiSanPhamUrl, this.dateTimeSearchKey).subscribe((res: any) => {
      this.dataCT = res;
    });
  }

  getExportExcel(): void {
    // console.log('time', this.dateTimeSearchKey);
    this.dataExcel = [];
    this.http.post<any>(this.tongHopNewUrl, this.dateTimeSearchKey).subscribe(res => {
      // console.log('check kết quả tổng hợp mới', res);

      const item = {
        tenSanPham: '',
        nganh: '',
        sanPham: '',
        nhomSanPham: '',
        chungLoai: '',
        nhomSanPhamTheoCongSuat: '',
        tongDoiTra: 0,
        soLuongXuatKho: 0,
        tongLoi: 0,
        tongLoiKyThuat: 0,
        tongLoiLinhDong: 0,
        tiLeDoiTraLoiKyThuat: 0,
        tiLeDoiTraLoiLinhDong: 0,
        tiLeDoiTra: 0,
        tiLePPMDoiTra: 0,
        loi1: 0,
        loi2: 0,
        loi3: 0,
        loi4: 0,
        loi5: 0,
        loi6: 0,
        loi7: 0,
        loi8: 0,
        loi9: 0,
        loi10: 0,
        loi11: 0,
        loi12: 0,
        loi13: 0,
        loi14: 0,
        loi15: 0,
        loi16: 0,
        loi17: 0,
        loi18: 0,
        loi19: 0,
        loi20: 0,
        loi21: 0,
        loi22: 0,
        loi23: 0,
        loi24: 0,
        loi25: 0,
        loi26: 0,
        loi27: 0,
        loi28: 0,
        loi29: 0,
        loi30: 0,
        loi31: 0,
        loi32: 0,
        loi33: 0,
        loi34: 0,
        loi35: 0,
        loi36: 0,
        loi37: 0,
        loi38: 0,
        loi39: 0,
      };
      setTimeout(() => {
        for (let i = 0; i < res.length; i++) {
          const dataArrage = {
            tenSanPham: res[i].tenSanPham,
            nganh: res[i].nganh,
            sanPham: res[i].sanPham,
            nhomSanPham: res[i].nhomSanPham,
            chungLoai: res[i].chungLoai,
            nhomSanPhamTheoCongSuat: res[i].nhomSanPhamTheoCongSuat,
            tongDoiTra: res[i].tongDoiTra,
            soLuongXuatKho: res[i].soLuongXuatKho,
            tongLoi: res[i].tongLoi,
            tongLoiKyThuat: res[i].tongLoiKyThuat,
            tongLoiLinhDong: res[i].tongLoiLinhDong,
            tiLeDoiTraLoiKyThuat: res[i].tiLeDoiTraLoiKyThuat,
            tiLeDoiTraLoiLinhDong: res[i].tiLeDoiTraLoiLinhDong,
            tiLeDoiTra: res[i].tiLeDoiTra,
            tiLePPMDoiTra: res[i].tiLePPMDoiTra,
            loi1: res[i].loi1,
            loi2: res[i].loi2,
            loi3: res[i].loi3,
            loi4: res[i].loi4,
            loi5: res[i].loi5,
            loi6: res[i].loi6,
            loi7: res[i].loi7,
            loi8: res[i].loi8,
            loi9: res[i].loi9,
            loi10: res[i].loi10,
            loi11: res[i].loi11,
            loi12: res[i].loi12,
            loi13: res[i].loi13,
            loi14: res[i].loi14,
            loi15: res[i].loi15,
            loi16: res[i].loi16,
            loi17: res[i].loi17,
            loi18: res[i].loi18,
            loi19: res[i].loi19,
            loi20: res[i].lo20,
            loi21: res[i].loi21,
            loi22: res[i].loi22,
            loi23: res[i].loi23,
            loi24: res[i].loi24,
            loi25: res[i].loi25,
            loi26: res[i].loi26,
            loi27: res[i].loi27,
            loi28: res[i].loi28,
            loi29: res[i].loi29,
            loi30: res[i].loi30,
            loi31: res[i].loi31,
            loi32: res[i].loi32,
            loi33: res[i].loi33,
            loi34: res[i].loi34,
            loi35: res[i].loi35,
            loi36: res[i].loi36,
            loi37: res[i].loi37,
            loi38: res[i].loi39,
            loi39: res[i].loi39,
          };
          item.tongDoiTra = res[i].tongDoiTra === null ? item.tongDoiTra : item.tongDoiTra + Number(res[i].tongDoiTra);
          item.tongLoi = res[i].tongLoi === null ? item.tongLoi : item.tongLoi + Number(res[i].tongLoi);
          item.tongLoiKyThuat = res[i].tongLoiKyThuat === null ? item.tongLoiKyThuat : item.tongLoiKyThuat + Number(res[i].tongLoiKyThuat);
          item.tongLoiLinhDong =
            res[i].tongLoiLinhDong === null ? item.tongLoiLinhDong : item.tongLoiLinhDong + Number(res[i].tongLoiLinhDong);
          item.tiLeDoiTraLoiKyThuat =
            res[i].tiLeDoiTraLoiKyThuat === null
              ? item.tiLeDoiTraLoiKyThuat
              : item.tiLeDoiTraLoiKyThuat + Number(res[i].tiLeDoiTraLoiKyThuat);
          item.tiLeDoiTraLoiLinhDong =
            res[i].tiLeDoiTraLoiLinhDong === null
              ? item.tiLeDoiTraLoiLinhDong
              : item.tiLeDoiTraLoiLinhDong + Number(res[i].tiLeDoiTraLoiLinhDong);
          item.tiLeDoiTra = res[i].tiLeDoiTra === null ? item.tiLeDoiTra : item.tiLeDoiTra + Number(res[i].tiLeDoiTra);
          item.tiLePPMDoiTra = res[i].tiLePPMDoiTra === null ? item.tiLePPMDoiTra : item.tiLePPMDoiTra + Number(res[i].tiLePPMDoiTra);
          item.loi1 = res[i].loi1 === null ? item.loi1 : item.loi1 + Number(res[i].loi1);
          item.loi2 = res[i].loi2 === null ? item.loi2 : item.loi2 + Number(res[i].loi2);
          item.loi3 = res[i].loi3 === null ? item.loi3 : item.loi3 + Number(res[i].loi3);
          item.loi4 = res[i].loi4 === null ? item.loi4 : item.loi4 + Number(res[i].loi4);
          item.loi5 = res[i].loi5 === null ? item.loi5 : item.loi5 + Number(res[i].loi5);
          item.loi6 = res[i].loi6 === null ? item.loi6 : item.loi6 + Number(res[i].loi6);
          item.loi7 = res[i].loi7 === null ? item.loi7 : item.loi7 + Number(res[i].loi7);
          item.loi8 = res[i].loi8 === null ? item.loi8 : item.loi8 + Number(res[i].loi8);
          item.loi9 = res[i].loi9 === null ? item.loi9 : item.loi9 + Number(res[i].loi9);
          item.loi10 = res[i].loi10 === null ? item.loi10 : item.loi10 + Number(res[i].loi10);
          item.loi11 = res[i].loi11 === null ? item.loi11 : item.loi11 + Number(res[i].loi11);
          item.loi12 = res[i].loi12 === null ? item.loi12 : item.loi12 + Number(res[i].loi12);
          item.loi13 = res[i].loi13 === null ? item.loi13 : item.loi13 + Number(res[i].loi13);
          item.loi14 = res[i].loi14 === null ? item.loi14 : item.loi14 + Number(res[i].loi14);
          item.loi15 = res[i].loi15 === null ? item.loi15 : item.loi15 + Number(res[i].loi15);
          item.loi16 = res[i].loi16 === null ? item.loi16 : item.loi16 + Number(res[i].loi16);
          item.loi17 = res[i].loi17 === null ? item.loi17 : item.loi17 + Number(res[i].loi17);
          item.loi18 = res[i].loi18 === null ? item.loi18 : item.loi18 + Number(res[i].loi18);
          item.loi19 = res[i].loi19 === null ? item.loi19 : item.loi19 + Number(res[i].loi19);
          item.loi20 = res[i].loi20 === null ? item.loi20 : item.loi20 + Number(res[i].loi20);
          item.loi21 = res[i].loi21 === null ? item.loi21 : item.loi21 + Number(res[i].loi21);
          item.loi22 = res[i].loi22 === null ? item.loi22 : item.loi22 + Number(res[i].loi22);
          item.loi23 = res[i].loi23 === null ? item.loi23 : item.loi23 + Number(res[i].loi23);
          item.loi24 = res[i].loi24 === null ? item.loi24 : item.loi24 + Number(res[i].loi24);
          item.loi25 = res[i].loi25 === null ? item.loi25 : item.loi25 + Number(res[i].loi25);
          item.loi26 = res[i].loi26 === null ? item.loi26 : item.loi26 + Number(res[i].loi26);
          item.loi27 = res[i].loi27 === null ? item.loi27 : item.loi27 + Number(res[i].loi27);
          item.loi28 = res[i].loi28 === null ? item.loi28 : item.loi28 + Number(res[i].loi28);
          item.loi29 = res[i].loi29 === null ? item.loi29 : item.loi29 + Number(res[i].loi29);
          item.loi30 = res[i].loi30 === null ? item.loi30 : item.loi30 + Number(res[i].loi30);
          item.loi31 = res[i].loi31 === null ? item.loi31 : item.loi31 + Number(res[i].loi31);
          item.loi32 = res[i].loi32 === null ? item.loi32 : item.loi32 + Number(res[i].loi32);
          item.loi33 = res[i].loi33 === null ? item.loi33 : item.loi33 + Number(res[i].loi33);
          item.loi34 = res[i].loi34 === null ? item.loi34 : item.loi34 + Number(res[i].loi34);
          item.loi35 = res[i].loi35 === null ? item.loi35 : item.loi35 + Number(res[i].loi35);
          item.loi36 = res[i].loi36 === null ? item.loi36 : item.loi36 + Number(res[i].loi36);
          item.loi37 = res[i].loi37 === null ? item.loi37 : item.loi37 + Number(res[i].loi37);
          item.loi38 = res[i].loi38 === null ? item.loi38 : item.loi38 + Number(res[i].loi38);
          item.loi39 = res[i].loi39 === null ? item.loi39 : item.loi39 + Number(res[i].loi39);
          this.dataExcel.push(dataArrage);
        }
        this.dataExcel = [item, ...this.dataExcel];
        this.exportExcel();
        // console.log('res data tong hop', this.dataExcel);
      }, 1000);
    });
  }

  exportExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_json(ws, this.dataExcel, { origin: 'A6', skipHeader: true });
    const mergeRange = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 53 } }, // header Báo cáo
      { s: { r: 2, c: 0 }, e: { r: 2, c: 0 } }, //thời gian bắt đầu
      { s: { r: 2, c: 1 }, e: { r: 2, c: 1 } }, //gtri thời gian bắt đầu
      { s: { r: 2, c: 2 }, e: { r: 2, c: 2 } }, //Thời gian kêt thúc
      { s: { r: 2, c: 3 }, e: { r: 2, c: 3 } }, //Gtri thời gian kết thúc
      { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, //ten SP
      { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, //nganh
      { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } }, //sp
      { s: { r: 3, c: 3 }, e: { r: 4, c: 3 } }, //nhomSP
      { s: { r: 3, c: 4 }, e: { r: 4, c: 4 } }, //chungloai
      { s: { r: 3, c: 5 }, e: { r: 4, c: 5 } }, //nhom SP theo cong suat
      { s: { r: 3, c: 6 }, e: { r: 4, c: 6 } }, //sl doi tra
      { s: { r: 3, c: 7 }, e: { r: 4, c: 7 } }, //sl xuat kho
      { s: { r: 3, c: 8 }, e: { r: 4, c: 8 } }, //tong loi
      { s: { r: 3, c: 9 }, e: { r: 4, c: 9 } }, //tong loi kt
      { s: { r: 3, c: 10 }, e: { r: 4, c: 10 } }, //tong loi linh dong
      { s: { r: 3, c: 11 }, e: { r: 4, c: 11 } }, //%loi kt
      { s: { r: 3, c: 12 }, e: { r: 4, c: 12 } }, //%loi linh dong
      { s: { r: 3, c: 13 }, e: { r: 4, c: 13 } }, //%doi tra
      { s: { r: 3, c: 14 }, e: { r: 4, c: 14 } }, //%PPM
      { s: { r: 3, c: 15 }, e: { r: 3, c: 42 } },
      { s: { r: 3, c: 43 }, e: { r: 3, c: 52 } },
      { s: { r: 4, c: 15 }, e: { r: 4, c: 15 } },
      { s: { r: 4, c: 16 }, e: { r: 4, c: 16 } },
      { s: { r: 4, c: 17 }, e: { r: 4, c: 17 } },
      { s: { r: 4, c: 18 }, e: { r: 4, c: 18 } },
      { s: { r: 4, c: 19 }, e: { r: 4, c: 19 } },
      { s: { r: 4, c: 20 }, e: { r: 4, c: 20 } },
      { s: { r: 4, c: 21 }, e: { r: 4, c: 21 } },
      { s: { r: 4, c: 22 }, e: { r: 4, c: 22 } },
      { s: { r: 4, c: 23 }, e: { r: 4, c: 23 } },
      { s: { r: 4, c: 24 }, e: { r: 4, c: 24 } },
      { s: { r: 4, c: 25 }, e: { r: 4, c: 25 } },
      { s: { r: 4, c: 26 }, e: { r: 4, c: 26 } },
      { s: { r: 4, c: 27 }, e: { r: 4, c: 27 } },
      { s: { r: 4, c: 28 }, e: { r: 4, c: 28 } },
      { s: { r: 4, c: 29 }, e: { r: 4, c: 29 } },
      { s: { r: 4, c: 30 }, e: { r: 4, c: 30 } },
      { s: { r: 4, c: 31 }, e: { r: 4, c: 31 } },
      { s: { r: 4, c: 32 }, e: { r: 4, c: 32 } },
      { s: { r: 4, c: 33 }, e: { r: 4, c: 33 } },
      { s: { r: 4, c: 34 }, e: { r: 4, c: 34 } },
      { s: { r: 4, c: 35 }, e: { r: 4, c: 35 } },
      { s: { r: 4, c: 36 }, e: { r: 4, c: 36 } },
      { s: { r: 4, c: 37 }, e: { r: 4, c: 37 } },
      { s: { r: 4, c: 38 }, e: { r: 4, c: 38 } },
      { s: { r: 4, c: 39 }, e: { r: 4, c: 39 } },
      { s: { r: 4, c: 40 }, e: { r: 4, c: 40 } },
      { s: { r: 4, c: 41 }, e: { r: 4, c: 41 } },
      { s: { r: 4, c: 42 }, e: { r: 4, c: 42 } },
      { s: { r: 4, c: 43 }, e: { r: 4, c: 43 } },
      { s: { r: 4, c: 44 }, e: { r: 4, c: 44 } },
      { s: { r: 4, c: 45 }, e: { r: 4, c: 45 } },
      { s: { r: 4, c: 46 }, e: { r: 4, c: 46 } },
      { s: { r: 4, c: 47 }, e: { r: 4, c: 47 } },
      { s: { r: 4, c: 48 }, e: { r: 4, c: 48 } },
      { s: { r: 4, c: 49 }, e: { r: 4, c: 49 } },
      { s: { r: 4, c: 50 }, e: { r: 4, c: 50 } },
      { s: { r: 4, c: 51 }, e: { r: 4, c: 51 } },
      { s: { r: 4, c: 52 }, e: { r: 4, c: 52 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 5 } }, //TỔNG
    ];
    ws['!merges'] = mergeRange;
    ws['A1'] = { t: 's', v: 'BÁO CÁO PHÂN TÍCH HÀNG ĐỔI' };
    ws['A3'] = { t: 's', v: 'Thời gian từ' };
    ws['B3'] = { t: 's', v: this.dateTimeSearchKey.startDate };
    ws['C3'] = { t: 's', v: 'Thời gian đến' };
    ws['D3'] = { t: 's', v: this.dateTimeSearchKey.endDate };
    ws['P4'] = { t: 's', v: 'Lỗi kỹ thuật' };
    ws['AR4'] = { t: 's', v: 'Lỗi linh động' };
    ws['A4'] = { t: 's', v: 'Tên sản phẩm' };
    ws['B4'] = { t: 's', v: 'Ngành' };
    ws['C4'] = { t: 's', v: 'Sản phẩm' };
    ws['D4'] = { t: 's', v: 'Nhóm SP' };
    ws['E4'] = { t: 's', v: 'Chủng loại' };
    ws['F4'] = { t: 's', v: 'Nhóm SP theo công suất' };
    ws['G4'] = { t: 's', v: 'Số lượng đổi trả' };
    ws['H4'] = { t: 's', v: 'Số lượng xuất kho' };
    ws['I4'] = { t: 's', v: 'Tổng lỗi' };
    ws['J4'] = { t: 's', v: 'Tổng lỗi kỹ thuật' };
    ws['K4'] = { t: 's', v: 'Tổng lỗi linh động' };
    ws['L4'] = { t: 's', v: '% đổi trả lỗi kỹ thuật' };
    ws['M4'] = { t: 's', v: '% đổi trả lỗi linh động' };
    ws['N4'] = { t: 's', v: 'Tỷ lệ % đổi trả' };
    ws['O4'] = { t: 's', v: 'Tỷ lệ PPM đổi trả' };
    ws['A6'] = { t: 's', v: 'TỔNG' };
    ws['P5'] = { t: 's', v: 'Cầu chì' };
    ws['Q5'] = { t: 's', v: 'Vasistor' };
    ws['R5'] = { t: 's', v: 'Cầu diode HY' };
    ws['S5'] = { t: 's', v: 'Cầu diode Silijino' };
    ws['T5'] = { t: 's', v: 'Tụ hóa L.H' };
    ws['U5'] = { t: 's', v: 'Tụ hóa Aishi' };
    ws['V5'] = { t: 's', v: 'Tụ fiml cctc' };
    ws['W5'] = { t: 's', v: 'Tụ fiml Hulysol' };
    ws['X5'] = { t: 's', v: 'Transistor' };
    ws['Y5'] = { t: 's', v: 'Điện trở' };
    ws['Z5'] = { t: 's', v: 'Chặn(Biến áp)' };
    ws['AA5'] = { t: 's', v: 'Cuộn lọc' };
    ws['AB5'] = { t: 's', v: 'Hỏng IC vcc' };
    ws['AC5'] = { t: 's', v: 'Hỏng IC fes' };
    ws['AD5'] = { t: 's', v: 'Lỗi nguồn' };
    ws['AE5'] = { t: 's', v: 'Chập mạch' };
    ws['AF5'] = { t: 's', v: 'Bong mạch' };
    ws['AG5'] = { t: 's', v: 'Công tắc' };
    ws['AH5'] = { t: 's', v: 'Long keo' };
    ws['AI5'] = { t: 's', v: 'Đôminô, rắc cắm' };
    ws['AJ5'] = { t: 's', v: 'Dây nối LED' };
    ws['AK5'] = { t: 's', v: 'Mất lò xo, tai cài' };
    ws['AL5'] = { t: 's', v: 'Dây DC' };
    ws['AM5'] = { t: 's', v: 'Dây AC' };
    ws['AN5'] = { t: 's', v: 'Bong, nứt mối hàn' };
    ws['AO5'] = { t: 's', v: 'Pin, tiếp xúc lò xo' };
    ws['AP5'] = { t: 's', v: 'Tiếp xúc cọc tiếp điện, đầu đèn' };
    ws['AQ5'] = { t: 's', v: 'Hỏng LED' };
    ws['AR5'] = { t: 's', v: 'Nứt vỡ nhựa, cover' };
    ws['AS5'] = { t: 's', v: 'Móp, nứt vỡ đui' };
    ws['AT5'] = { t: 's', v: 'Gãy cổ + cơ khớp, tai cài' };
    ws['AU5'] = { t: 's', v: 'Nước vào' };
    ws['AV5'] = { t: 's', v: 'Điện áp cao' };
    ws['AW5'] = { t: 's', v: 'Cháy nổ nguồn' };
    ws['AX5'] = { t: 's', v: 'Cũ, ẩm mốc, ố rỉ' };
    ws['AY5'] = { t: 's', v: 'Om nhiệt' };
    ws['AZ5'] = { t: 's', v: 'Vỡ ống, kính' };
    ws['BA5'] = { t: 's', v: 'Lỗi khác' };
    ws['BB5'] = { t: 's', v: 'Sáng BT' };

    const headerStyle = {
      font: { bold: true },
      aligment: { horizontal: 'center', vertical: 'center' },
    };

    const headers = [
      'A1',
      'A3',
      'B3',
      'C3',
      'D3',
      'A4',
      'B4',
      'C4',
      'D4',
      'E4',
      'F4',
      'G4',
      'H4',
      'I4',
      'J4',
      'K4',
      'L4',
      'M4',
      'N4',
      'O4',
      'P5',
      'Q5',
      'R5',
      'S5',
      'T5',
      'U5',
      'V5',
      'W5',
      'X5',
      'Y5',
      'Z5',
      'AA5',
      'AB5',
      'AC5',
      'AD5',
      'AE5',
      'AF5',
      'AG5',
      'AH5',
      'AI5',
      'AJ5',
      'AK5',
      'AL5',
      'AM5',
      'AN5',
      'AO5',
      'AQ5',
      'AR5',
      'AS5',
      'AT5',
      'AU5',
      'AV5',
      'AW5',
      'AX5',
      'AY5',
      'AZ5',
      'BA5',
      'BB5',
    ];
    headers.forEach(header => {
      ws[header].s = headerStyle;
    });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo tổng hợp');
    XLSX.writeFile(wb, 'Báo cáo tổng hợp.xlsx');
  }
}

export interface ITongHop {
  id: number;
  donBaoHanhId: number;
  maTiepNhan: string;
  namSanXuat: Date;
  ngayTiepNhan: Date;
  ngayPhanTich: string;
  nhanVienGiaoHang: string;
  tenKhachHang: string;
  nhomKhachHang: string;
  tinhThanh: string;
  tenSanPham: string;
  tenNganh: string;
  tenChungLoai: string;
  tenNhomSanPham: string;
  soLuongKhachGiao: number;
  slTiepNhan: number;
  soLuongDoiMoi: number;
  loiKT: number;
  loiLinhDong: number;
  trangThai: string;
  lotNumber: string;
  serial: string;
  soLuongTheoTungLoi: number;
  tenLoi: string;
  tenNhomLoi: string;
  phanTichSanPhamId: number;
  tenTinhTrangPhanLoai: string;
  idSP: number;
  idSPTN: number;
  idPhanLoai: number;
  tenNhanVienPhanTich: string;
}
