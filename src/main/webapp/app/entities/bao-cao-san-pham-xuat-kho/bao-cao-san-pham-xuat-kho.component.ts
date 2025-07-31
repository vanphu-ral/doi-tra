import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularGridInstance, Column, FieldType, Filters, Formatters, GridOption } from 'angular-slickgrid';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { ITongHop } from '../chi-tiet-san-pham-tiep-nhan/list/chi-tiet-san-pham-tiep-nhan.component';
import * as XLSX from 'xlsx';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'jhi-bao-cao-san-pham-xuat-kho',
  templateUrl: './bao-cao-san-pham-xuat-kho.component.html',
  styleUrls: ['./bao-cao-san-pham-xuat-kho.component.scss'],
})
export class BaoCaoSanPhamXuatKhoComponent implements OnInit {
  chiTietXuatKhoUrl = this.applicationConfigService.getEndpointFor('api/chi-tiet-xuat-khos');
  tongHopUrl2 = this.applicationConfigService.getEndpointFor('api/chi-tiet-xuat-khos/tong-hop');
  tongHopUrl3 = this.applicationConfigService.getEndpointFor('api/san-pham/get-all');
  tongHopCaculateUrl = this.applicationConfigService.getEndpointFor('api/tong-hop-caculate');
  tongHopDBHUrl = this.applicationConfigService.getEndpointFor('api/thong-tin-don-bao-hanh');
  sanPhamDBHUrl = this.applicationConfigService.getEndpointFor('api/san-pham-don-bao-hanh2');
  phanLoaiSanPhamUrl = this.applicationConfigService.getEndpointFor('api/chi-tiet-phan-loai-san-pham');
  tongHopNewUrl = this.applicationConfigService.getEndpointFor('api/tong-hop-new');
  danhSachXuatKhoUrl = this.applicationConfigService.getEndpointFor('api/danh-sach-nhap-khos');
  startDates = '';
  endDates = '';
  dateTimeSearchKey: { startDate: string; endDate: string } = { startDate: '', endDate: '' };

  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  angularGrid!: AngularGridInstance;
  gridObj: any;
  dataViewObj: any;
  isLoading = false;
  isModalOpenConfirmLost = false;
  chiTietXuatKho: any[] = [];
  chiTietXuatKhoSum: any[] = [];
  chiTietSanPhamTiepNhanCTLGoc: ITongHop[] = [];
  dataCTL: ITongHop[] = [];
  chiTietSanPhamTiepNhanCTL: ITongHop[] = [];
  chiTietSanPhamTiepNhanGoc: any[] = [];
  chiTietSanPhamTiepNhan: any[] = [];
  danhSachXuatKho: any[] = [];

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
  dropdownSettings = {};
  listMonth: any[] = [];
  selectedItems: any[] = [];
  onSelectItemRequest: string[] = [];
  selectedMonths = [];
  selectedYear!: number;
  loading = false;

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

  faFileExcel = faFileExcel;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected modalService: NgbModal,
    protected applicationConfigService: ApplicationConfigService,
    protected http: HttpClient
  ) {}

  loadAll(): void {
    this.isLoading = true;
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
    this.dataShow();
    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: 'Chọn tất cả',
      unSelectAllText: 'Bỏ chọn tất cả',
      itemsShowLimit: 2,
      allowSearchFilter: true,
    };
  }

  onItemSelect(item: any): void {
    // console.log('Chọn tháng', item);
  }

  onDeSelect(item: any): void {
    // console.log('Bỏ chọn', item);
    const index = this.listMonth.indexOf(item);
    if (index > -1) {
      this.listMonth.splice(index, 1);
    }
    this.selectedItems = [...this.listMonth];
    // this.changeDate()
    // console.log('update month and year', this.listMonth);
  }

  onSelectAll(items: any): void {
    // console.log('Chọn tất cả', items);
  }

  dataShow(): void {
    this.loading = true;
    this.http.get<any>(this.tongHopUrl3).subscribe(
      res => {
        res.forEach((item: any) => {
          item.id = item.spId;
        });
        this.chiTietXuatKhoSum = res;
        this.loading = false;
      },
      error => {
        this.loading = false;
      }
    );
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
        params: {
          // isDataFetching: this.isDataFetching,
        },
      },
      {
        id: 'maSanPham',
        field: 'maSanPham',
        name: 'Mã sản phẩm',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 360,
        minWidth: 70,
        params: {
          // isDataFetching: this.isDataFetching,
        },
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
        params: {
          // isDataFetching: this.isDataFetching,
        },
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'nganh',
        field: 'nganh',
        name: 'Ngành',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 200,
        minWidth: 100,
        params: {
          // isDataFetching: this.isDataFetching,
        },
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'chungLoai',
        field: 'chungLoai',
        name: 'Chủng loại',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 200,
        minWidth: 100,
        params: {
          // isDataFetching: this.isDataFetching,
        },
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'sanPham',
        field: 'sanPham',
        name: 'Sản phẩm',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 200,
        minWidth: 50,
        params: {
          // isDataFetching: this.isDataFetching,
        },
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'nhomSanPham',
        field: 'nhomSanPham',
        name: 'Nhóm sản phẩm',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 200,
        minWidth: 50,
        params: {
          // isDataFetching: this.isDataFetching,
        },
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'nhomSanPhamTheoCongSuat',
        field: 'nhomSanPhamTheoCongSuat',
        name: 'Nhóm sản phẩm theo công suất',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 200,
        minWidth: 50,
        params: {
          // isDataFetching: this.isDataFetching,
        },
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'soLuongXuatKho',
        field: 'soLuongXuatKho',
        name: 'Số lượng xuất kho',
        cssClass: 'column-item',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 200,
        minWidth: 100,
        params: {
          // isDataFetching: this.isDataFetching,
        },
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'tongLoi',
        field: 'tongLoi',
        name: 'Tổng lỗi',
        cssClass: 'column-item',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 80,
        minWidth: 50,
        params: {
          // isDataFetching: this.isDataFetching,
        },
      },
      {
        id: 'tongLoiKyThuat',
        field: 'tongLoiKyThuat',
        name: 'Tổng lỗi kỹ thuật',
        cssClass: 'column-item',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 80,
        minWidth: 50,
        params: {
          // isDataFetching: this.isDataFetching,
        },
      },
      {
        id: 'tongLoiLinhDong',
        field: 'tongLoiLinhDong',
        name: 'Tổng lỗi linh động',
        cssClass: 'column-item',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        maxWidth: 80,
        minWidth: 50,
        params: {
          // isDataFetching: this.isDataFetching,
        },
      },
    ];

    this.gridOptions = {
      enableAutoResize: true,
      enableSorting: true,
      enableFiltering: true,
      enablePagination: true,
      enableAutoSizeColumns: true,
      enableColumnPicker: true,
      asyncEditorLoadDelay: 1000,
      pagination: {
        pageSizes: [20, 50, this.chiTietXuatKhoSum.length],
        pageSize: this.chiTietXuatKhoSum.length,
      },
      presets: {
        columns: [
          { columnId: 'id' },
          { columnId: 'maSanPham' },
          { columnId: 'tenSanPham' },
          { columnId: 'nganh' },
          { columnId: 'chungLoai' },
          { columnId: 'sanPham' },
          { columnId: 'nhomSanPham' },
          { columnId: 'nhomSanPhamTheoCongSuat' },
          { columnId: 'soLuongXuatKho' },
          { columnId: 'thoiGianXuatKho' },
          { columnId: 'tongLoi' },
          { columnId: 'tongLoiKyThuat' },
          { columnId: 'tongLoiLinhDong' },
        ],
      },
      gridHeight: 620,
      gridWidth: '100%',
      autoHeight: true,
    };
  }

  changeDate(): void {
    let dateTimeSearchKey: { startDate: string; endDate: string } = { startDate: '', endDate: '' };
    document.getElementById('dateForm')?.addEventListener('submit', function (event) {
      event.preventDefault();

      const startDateInp = document.getElementById('startDate') as HTMLInputElement;
      const endDateInp = document.getElementById('endDate') as HTMLInputElement;

      // const startDate = startDateInp.value;
      // const endDate = endDateInp.value;
      dateTimeSearchKey = { startDate: startDateInp.value, endDate: endDateInp.value };
    });

    setTimeout(() => {
      const result = [];
      this.dateTimeSearchKey = dateTimeSearchKey;
      const startMonth = this.startDates.split('-')[1];
      const startYear = this.startDates.split('-')[0];
      const endMonth = this.endDates.split('-')[1];
      const endYear = this.endDates.split('-')[0];
      if (Number(startYear) === Number(endYear)) {
        for (let i = Number(startMonth); i <= Number(endMonth); i++) {
          result.push(`0${i}-${startYear}`);
        }
      } else {
        for (let i = Number(startYear); i <= Number(endYear); i++) {
          if (i === Number(startYear)) {
            for (let j = Number(startMonth); j <= 12; j++) {
              result.push(`${j}-${i}`);
            }
          } else if (Number(startYear) < i && i < Number(endYear)) {
            for (let j = 1; j <= 12; j++) {
              result.push(`${j}-${i}`);
            }
          } else if (i === Number(endYear)) {
            for (let j = 1; j <= Number(endMonth); j++) {
              result.push(`${j}-${i}`);
            }
          }
        }
      }
      // console.log('Date:', result);
      this.selectedItems.push(result);
      this.selectedItems = [...result];
      this.listMonth = [...result];
      // console.log('bien chua kq tim kiem', this.selectedItems);
      // console.log('bien chua kq tim kiem 2', this.listMonth);
      // console.log('bien chua kq tim kiem 3', result);
    }, 200);
  }

  changeDateTime(): void {
    let dateTimeSearchKey: { startDate: string; endDate: string } = { startDate: '', endDate: '' };
    document.getElementById('dateForm')?.addEventListener('submit', function (event) {
      event.preventDefault();

      const startDateInp = document.getElementById('startDate') as HTMLInputElement;
      const endDateInp = document.getElementById('endDate') as HTMLInputElement;

      // const startDate = startDateInp.value;
      // const endDate = endDateInp.value;
      dateTimeSearchKey = { startDate: startDateInp.value, endDate: endDateInp.value };
    });

    setTimeout(() => {
      this.dateTimeSearchKey = dateTimeSearchKey;
    }, 300);
    // console.log('request BE new', this.dateTimeSearchKey)
  }

  changeDate2(): void {
    this.chiTietXuatKhoSum.forEach((item: any) => {
      item.soLuongXuatKho = 0;
    });
    this.changeDateTime();

    setTimeout(() => {
      const formattedData = this.selectedItems.map(item => {
        const [month, year] = item.split('-').map(Number);
        return { month, year };
      });
      // console.log('Month:', formattedData);
      for (let i = 0; i < formattedData.length; i++) {
        this.http.post<any>(this.tongHopUrl2, formattedData[i]).subscribe(res => {
          // console.log('Data to send:', res);
          res.forEach((item: any) => {
            const existingItem = this.chiTietXuatKhoSum.find(x => x.maSanPham === item.maSanPham);
            if (existingItem) {
              existingItem.soLuongXuatKho += item.soLuongXuatKho;
            } else {
              this.chiTietXuatKhoSum.push(item);
            }
          });
        });
      }
      setTimeout(() => {
        let sum = 0;
        for (let i = 0; i < this.chiTietXuatKhoSum.length; i++) {
          sum += this.chiTietXuatKhoSum[i].soLuongXuatKho;
        }
        // console.log('ds xuat kho: ', sum);
      }, 20000);
      // console.log('combined data', this.chiTietXuatKhoSum);
      // console.log('date time:', this.dateTimeSearchKey);
      setTimeout(() => {
        this.http.post<any>(this.tongHopNewUrl, this.dateTimeSearchKey).subscribe(res => {
          // console.log('phan tich loi:', res);
          res.forEach((item: any) => {
            const existingItem = this.chiTietXuatKhoSum.find(x => x.maSanPham === item.maSanPham);
            if (existingItem) {
              existingItem.tongDoiTra = item.tongDoiTra;
              existingItem.tongLoi = item.tongLoi;
              existingItem.tongLoiKyThuat = item.tongLoiKyThuat;
              existingItem.tongLoiLinhDong = item.tongLoiLinhDong;
              existingItem.tiLeDoiTraLoiKyThuat = 0;
              existingItem.tiLeDoiTraLoiLinhDong = 0;
              existingItem.tiLeDoiTra = 0;
              existingItem.tiLePPMDoiTra = item.tiLePPMDoiTra;
              existingItem.loi1 = item.loi1;
              existingItem.loi2 = item.loi2;
              existingItem.loi3 = item.loi3;
              existingItem.loi4 = item.loi4;
              existingItem.loi5 = item.loi5;
              existingItem.loi6 = item.loi6;
              existingItem.loi7 = item.loi7;
              existingItem.loi8 = item.loi8;
              existingItem.loi9 = item.loi9;
              existingItem.loi10 = item.loi10;
              existingItem.loi11 = item.loi11;
              existingItem.loi12 = item.loi12;
              existingItem.loi13 = item.loi13;
              existingItem.loi14 = item.loi14;
              existingItem.loi15 = item.loi15;
              existingItem.loi16 = item.loi16;
              existingItem.loi17 = item.loi17;
              existingItem.loi18 = item.loi18;
              existingItem.loi19 = item.loi19;
              existingItem.loi20 = item.loi20;
              existingItem.loi21 = item.loi21;
              existingItem.loi22 = item.loi22;
              existingItem.loi23 = item.loi23;
              existingItem.loi24 = item.loi24;
              existingItem.loi25 = item.loi25;
              existingItem.loi26 = item.loi26;
              existingItem.loi27 = item.loi27;
              existingItem.loi28 = item.loi28;
              existingItem.loi29 = item.loi29;
              existingItem.loi30 = item.loi30;
              existingItem.loi31 = item.loi31;
              existingItem.loi32 = item.loi32;
              existingItem.loi33 = item.loi33;
              existingItem.loi34 = item.loi34;
              existingItem.loi35 = item.loi35;
              existingItem.loi36 = item.loi36;
              existingItem.loi37 = item.loi37;
              existingItem.loi38 = item.loi38;
              existingItem.loi39 = item.loi39;
            }
          });
        });
      }, 15000);
    }, 2000);
  }

  angularGridReady(angularGrid: any): void {
    this.angularGrid = angularGrid;

    // the Angular Grid Instance exposes both Slick Grid & DataView objects
    this.gridObj = angularGrid.slickGrid;
    this.dataViewObj = angularGrid.dataView;
  }

  confirmLost(): void {
    this.isModalOpenConfirmLost = false;
  }

  closeModalConfirmLost(): void {
    this.isModalOpenConfirmLost = false;
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

  combineData(): void {
    this.chiTietXuatKhoSum = [];
    this.http.get<any>(this.chiTietXuatKhoUrl).subscribe(res => {
      this.chiTietXuatKho = res;
      // console.log('chi tiet 1', this.chiTietXuatKho);
    });
    // console.log('danh sach sp xuat kho', this.danhSachXuatKho);
    // console.log('danh sach sp phan tich', this.chiTietSanPhamTiepNhan);

    setTimeout(() => {
      const combineData = [...this.chiTietXuatKho, ...this.chiTietSanPhamTiepNhan];
      // console.log('combined data 3', combineData);

      for (let i = 0; i < this.combineData.length; i++) {
        combineData.forEach(item => {
          const existingItem = this.chiTietXuatKhoSum.find(x => x.maSanPham === item.maSanPham);
          if (existingItem) {
            existingItem.tenSanPham = item.tenSanPham;
            existingItem.nganh = item.nganh;
            existingItem.chungLoai = item.chungLoai;
            existingItem.sanPham = item.tenSanPham;
            existingItem.nhomSanPham = item.nhomSanPham;
            existingItem.nhomSanPhamTheoCongSuat = item.nhomSanPhamTheoCongSuat;
            existingItem.soLuongXuatKho += item.soLuongXuatKho;
          } else {
            this.chiTietXuatKhoSum.push({ ...item });
          }
        });
      }

      // console.log('combined data 2', this.chiTietXuatKhoSum);
      setTimeout(() => {
        this.http.post<any>(this.tongHopNewUrl, this.dateTimeSearchKey).subscribe(res => {
          // console.log('phan tich loi:', res);
          res.forEach((item: any) => {
            const existingItem = this.chiTietXuatKhoSum.find(x => x.maSanPham === item.maSanPham);
            if (existingItem) {
              existingItem.tongLoi = item.tongLoi;
              existingItem.tongLoiKyThuat = item.tongLoiKyThuat;
              existingItem.tongLoiLinhDong = item.tongLoiLinhDong;
            }
          });
        });
      }, 10000);
    }, 1000);
  }

  getExportExcel(): void {
    this.dataExcel = [];

    // console.log('thời gian', this.dateTimeSearchKey);
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
      for (let i = 0; i < this.chiTietXuatKhoSum.length; i++) {
        const dataArrage: {
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
        } = {
          tenSanPham: this.chiTietXuatKhoSum[i].tenSanPham,
          nganh: this.chiTietXuatKhoSum[i].nganh,
          sanPham: this.chiTietXuatKhoSum[i].sanPham,
          nhomSanPham: this.chiTietXuatKhoSum[i].nhomSanPham,
          chungLoai: this.chiTietXuatKhoSum[i].chungLoai,
          nhomSanPhamTheoCongSuat: this.chiTietXuatKhoSum[i].nhomSanPhamTheoCongSuat,
          tongDoiTra: this.chiTietXuatKhoSum[i].tongDoiTra,
          soLuongXuatKho: this.chiTietXuatKhoSum[i].soLuongXuatKho,
          tongLoi: this.chiTietXuatKhoSum[i].tongLoi,
          tongLoiKyThuat: this.chiTietXuatKhoSum[i].tongLoiKyThuat,
          tongLoiLinhDong: this.chiTietXuatKhoSum[i].tongLoiLinhDong,
          tiLeDoiTraLoiKyThuat:
            this.chiTietXuatKhoSum[i].soLuongXuatKho === 0
              ? 0
              : (this.chiTietXuatKhoSum[i].tongLoiKyThuat / this.chiTietXuatKhoSum[i].soLuongXuatKho) * 100,
          tiLeDoiTraLoiLinhDong:
            this.chiTietXuatKhoSum[i].soLuongXuatKho === 0
              ? 0
              : (this.chiTietXuatKhoSum[i].tongLoiLinhDong / this.chiTietXuatKhoSum[i].soLuongXuatKho) * 100,
          tiLeDoiTra:
            this.chiTietXuatKhoSum[i].soLuongXuatKho === 0
              ? 0
              : (this.chiTietXuatKhoSum[i].tongLoi / this.chiTietXuatKhoSum[i].soLuongXuatKho) * 100,
          tiLePPMDoiTra: this.chiTietXuatKhoSum[i].tiLePPMDoiTra,
          loi1: this.chiTietXuatKhoSum[i].loi1,
          loi2: this.chiTietXuatKhoSum[i].loi2,
          loi3: this.chiTietXuatKhoSum[i].loi3,
          loi4: this.chiTietXuatKhoSum[i].loi4,
          loi5: this.chiTietXuatKhoSum[i].loi5,
          loi6: this.chiTietXuatKhoSum[i].loi6,
          loi7: this.chiTietXuatKhoSum[i].loi7,
          loi8: this.chiTietXuatKhoSum[i].loi8,
          loi9: this.chiTietXuatKhoSum[i].loi9,
          loi10: this.chiTietXuatKhoSum[i].loi10,
          loi11: this.chiTietXuatKhoSum[i].loi11,
          loi12: this.chiTietXuatKhoSum[i].loi12,
          loi13: this.chiTietXuatKhoSum[i].loi13,
          loi14: this.chiTietXuatKhoSum[i].loi14,
          loi15: this.chiTietXuatKhoSum[i].loi15,
          loi16: this.chiTietXuatKhoSum[i].loi16,
          loi17: this.chiTietXuatKhoSum[i].loi17,
          loi18: this.chiTietXuatKhoSum[i].loi18,
          loi19: this.chiTietXuatKhoSum[i].loi19,
          loi20: this.chiTietXuatKhoSum[i].lo20,
          loi21: this.chiTietXuatKhoSum[i].loi21,
          loi22: this.chiTietXuatKhoSum[i].loi22,
          loi23: this.chiTietXuatKhoSum[i].loi23,
          loi24: this.chiTietXuatKhoSum[i].loi24,
          loi25: this.chiTietXuatKhoSum[i].loi25,
          loi26: this.chiTietXuatKhoSum[i].loi26,
          loi27: this.chiTietXuatKhoSum[i].loi27,
          loi28: this.chiTietXuatKhoSum[i].loi28,
          loi29: this.chiTietXuatKhoSum[i].loi29,
          loi30: this.chiTietXuatKhoSum[i].loi30,
          loi31: this.chiTietXuatKhoSum[i].loi31,
          loi32: this.chiTietXuatKhoSum[i].loi32,
          loi33: this.chiTietXuatKhoSum[i].loi33,
          loi34: this.chiTietXuatKhoSum[i].loi34,
          loi35: this.chiTietXuatKhoSum[i].loi35,
          loi36: this.chiTietXuatKhoSum[i].loi36,
          loi37: this.chiTietXuatKhoSum[i].loi37,
          loi38: this.chiTietXuatKhoSum[i].loi39,
          loi39: this.chiTietXuatKhoSum[i].loi39,
        };
        item.soLuongXuatKho =
          this.chiTietXuatKhoSum[i].soLuongXuatKho === null
            ? item.soLuongXuatKho
            : item.soLuongXuatKho + Number(this.chiTietXuatKhoSum[i].soLuongXuatKho);
        item.tongDoiTra =
          this.chiTietXuatKhoSum[i].tongDoiTra === null ? item.tongDoiTra : item.tongDoiTra + Number(this.chiTietXuatKhoSum[i].tongDoiTra);
        item.tongLoi = this.chiTietXuatKhoSum[i].tongLoi === null ? item.tongLoi : item.tongLoi + Number(this.chiTietXuatKhoSum[i].tongLoi);
        item.tongLoiKyThuat =
          this.chiTietXuatKhoSum[i].tongLoiKyThuat === null
            ? item.tongLoiKyThuat
            : item.tongLoiKyThuat + Number(this.chiTietXuatKhoSum[i].tongLoiKyThuat);
        item.tongLoiLinhDong =
          this.chiTietXuatKhoSum[i].tongLoiLinhDong === null
            ? item.tongLoiLinhDong
            : item.tongLoiLinhDong + Number(this.chiTietXuatKhoSum[i].tongLoiLinhDong);

        item.tiLeDoiTraLoiKyThuat =
          this.chiTietXuatKhoSum[i].tiLeDoiTraLoiKyThuat === 0
            ? item.tiLeDoiTraLoiKyThuat
            : item.tiLeDoiTraLoiKyThuat + Number(this.chiTietXuatKhoSum[i].tiLeDoiTraLoiKyThuat);
        item.tiLeDoiTraLoiLinhDong =
          this.chiTietXuatKhoSum[i].tiLeDoiTraLoiLinhDong === 0
            ? item.tiLeDoiTraLoiLinhDong
            : item.tiLeDoiTraLoiLinhDong + Number(this.chiTietXuatKhoSum[i].tiLeDoiTraLoiLinhDong);
        item.tiLeDoiTra =
          this.chiTietXuatKhoSum[i].tiLeDoiTra === 0 ? item.tiLeDoiTra : item.tiLeDoiTra + Number(this.chiTietXuatKhoSum[i].tiLeDoiTra);
        item.tiLePPMDoiTra =
          this.chiTietXuatKhoSum[i].tiLePPMDoiTra === null
            ? item.tiLePPMDoiTra
            : item.tiLePPMDoiTra + Number(this.chiTietXuatKhoSum[i].tiLePPMDoiTra);
        item.loi1 = this.chiTietXuatKhoSum[i].loi1 === null ? item.loi1 : item.loi1 + Number(this.chiTietXuatKhoSum[i].loi1);
        item.loi2 = this.chiTietXuatKhoSum[i].loi2 === null ? item.loi2 : item.loi2 + Number(this.chiTietXuatKhoSum[i].loi2);
        item.loi3 = this.chiTietXuatKhoSum[i].loi3 === null ? item.loi3 : item.loi3 + Number(this.chiTietXuatKhoSum[i].loi3);
        item.loi4 = this.chiTietXuatKhoSum[i].loi4 === null ? item.loi4 : item.loi4 + Number(this.chiTietXuatKhoSum[i].loi4);
        item.loi5 = this.chiTietXuatKhoSum[i].loi5 === null ? item.loi5 : item.loi5 + Number(this.chiTietXuatKhoSum[i].loi5);
        item.loi6 = this.chiTietXuatKhoSum[i].loi6 === null ? item.loi6 : item.loi6 + Number(this.chiTietXuatKhoSum[i].loi6);
        item.loi7 = this.chiTietXuatKhoSum[i].loi7 === null ? item.loi7 : item.loi7 + Number(this.chiTietXuatKhoSum[i].loi7);
        item.loi8 = this.chiTietXuatKhoSum[i].loi8 === null ? item.loi8 : item.loi8 + Number(this.chiTietXuatKhoSum[i].loi8);
        item.loi9 = this.chiTietXuatKhoSum[i].loi9 === null ? item.loi9 : item.loi9 + Number(this.chiTietXuatKhoSum[i].loi9);
        item.loi10 = this.chiTietXuatKhoSum[i].loi10 === null ? item.loi10 : item.loi10 + Number(this.chiTietXuatKhoSum[i].loi10);
        item.loi11 = this.chiTietXuatKhoSum[i].loi11 === null ? item.loi11 : item.loi11 + Number(this.chiTietXuatKhoSum[i].loi11);
        item.loi12 = this.chiTietXuatKhoSum[i].loi12 === null ? item.loi12 : item.loi12 + Number(this.chiTietXuatKhoSum[i].loi12);
        item.loi13 = this.chiTietXuatKhoSum[i].loi13 === null ? item.loi13 : item.loi13 + Number(this.chiTietXuatKhoSum[i].loi13);
        item.loi14 = this.chiTietXuatKhoSum[i].loi14 === null ? item.loi14 : item.loi14 + Number(this.chiTietXuatKhoSum[i].loi14);
        item.loi15 = this.chiTietXuatKhoSum[i].loi15 === null ? item.loi15 : item.loi15 + Number(this.chiTietXuatKhoSum[i].loi15);
        item.loi16 = this.chiTietXuatKhoSum[i].loi16 === null ? item.loi16 : item.loi16 + Number(this.chiTietXuatKhoSum[i].loi16);
        item.loi17 = this.chiTietXuatKhoSum[i].loi17 === null ? item.loi17 : item.loi17 + Number(this.chiTietXuatKhoSum[i].loi17);
        item.loi18 = this.chiTietXuatKhoSum[i].loi18 === null ? item.loi18 : item.loi18 + Number(this.chiTietXuatKhoSum[i].loi18);
        item.loi19 = this.chiTietXuatKhoSum[i].loi19 === null ? item.loi19 : item.loi19 + Number(this.chiTietXuatKhoSum[i].loi19);
        item.loi20 = this.chiTietXuatKhoSum[i].loi20 === null ? item.loi20 : item.loi20 + Number(this.chiTietXuatKhoSum[i].loi20);
        item.loi21 = this.chiTietXuatKhoSum[i].loi21 === null ? item.loi21 : item.loi21 + Number(this.chiTietXuatKhoSum[i].loi21);
        item.loi22 = this.chiTietXuatKhoSum[i].loi22 === null ? item.loi22 : item.loi22 + Number(this.chiTietXuatKhoSum[i].loi22);
        item.loi23 = this.chiTietXuatKhoSum[i].loi23 === null ? item.loi23 : item.loi23 + Number(this.chiTietXuatKhoSum[i].loi23);
        item.loi24 = this.chiTietXuatKhoSum[i].loi24 === null ? item.loi24 : item.loi24 + Number(this.chiTietXuatKhoSum[i].loi24);
        item.loi25 = this.chiTietXuatKhoSum[i].loi25 === null ? item.loi25 : item.loi25 + Number(this.chiTietXuatKhoSum[i].loi25);
        item.loi26 = this.chiTietXuatKhoSum[i].loi26 === null ? item.loi26 : item.loi26 + Number(this.chiTietXuatKhoSum[i].loi26);
        item.loi27 = this.chiTietXuatKhoSum[i].loi27 === null ? item.loi27 : item.loi27 + Number(this.chiTietXuatKhoSum[i].loi27);
        item.loi28 = this.chiTietXuatKhoSum[i].loi28 === null ? item.loi28 : item.loi28 + Number(this.chiTietXuatKhoSum[i].loi28);
        item.loi29 = this.chiTietXuatKhoSum[i].loi29 === null ? item.loi29 : item.loi29 + Number(this.chiTietXuatKhoSum[i].loi29);
        item.loi30 = this.chiTietXuatKhoSum[i].loi30 === null ? item.loi30 : item.loi30 + Number(this.chiTietXuatKhoSum[i].loi30);
        item.loi31 = this.chiTietXuatKhoSum[i].loi31 === null ? item.loi31 : item.loi31 + Number(this.chiTietXuatKhoSum[i].loi31);
        item.loi32 = this.chiTietXuatKhoSum[i].loi32 === null ? item.loi32 : item.loi32 + Number(this.chiTietXuatKhoSum[i].loi32);
        item.loi33 = this.chiTietXuatKhoSum[i].loi33 === null ? item.loi33 : item.loi33 + Number(this.chiTietXuatKhoSum[i].loi33);
        item.loi34 = this.chiTietXuatKhoSum[i].loi34 === null ? item.loi34 : item.loi34 + Number(this.chiTietXuatKhoSum[i].loi34);
        item.loi35 = this.chiTietXuatKhoSum[i].loi35 === null ? item.loi35 : item.loi35 + Number(this.chiTietXuatKhoSum[i].loi35);
        item.loi36 = this.chiTietXuatKhoSum[i].loi36 === null ? item.loi36 : item.loi36 + Number(this.chiTietXuatKhoSum[i].loi36);
        item.loi37 = this.chiTietXuatKhoSum[i].loi37 === null ? item.loi37 : item.loi37 + Number(this.chiTietXuatKhoSum[i].loi37);
        item.loi38 = this.chiTietXuatKhoSum[i].loi38 === null ? item.loi38 : item.loi38 + Number(this.chiTietXuatKhoSum[i].loi38);
        item.loi39 = this.chiTietXuatKhoSum[i].loi39 === null ? item.loi39 : item.loi39 + Number(this.chiTietXuatKhoSum[i].loi39);
        this.dataExcel.push(dataArrage);
      }
      item.tiLeDoiTraLoiKyThuat = (item.tongLoiKyThuat / item.soLuongXuatKho) * 100;
      item.tiLeDoiTraLoiLinhDong = (item.tongLoiLinhDong / item.soLuongXuatKho) * 100;
      item.tiLeDoiTra = (item.tongLoi / item.soLuongXuatKho) * 100;
      this.dataExcel = [item, ...this.dataExcel];
      this.exportExcel();
      // console.log('res data tong hop', this.dataExcel);
    }, 1000);
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
