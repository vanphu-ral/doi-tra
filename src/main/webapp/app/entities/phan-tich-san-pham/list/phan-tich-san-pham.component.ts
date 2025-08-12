import { IPhanTichLoi } from 'app/entities/phan-tich-loi/phan-tich-loi.model';
import { IPhanLoaiChiTietTiepNhan } from './../../phan-loai-chi-tiet-tiep-nhan/phan-loai-chi-tiet-tiep-nhan.model';
import { IDanhSachTinhTrang } from './../../danh-sach-tinh-trang/danh-sach-tinh-trang.model';
import { IChiTietSanPhamTiepNhan } from 'app/entities/chi-tiet-san-pham-tiep-nhan/chi-tiet-san-pham-tiep-nhan.model';
import { SanPhamService } from './../../san-pham/service/san-pham.service';
import { ISanPham } from './../../san-pham/san-pham.model';
import { ILoi } from './../../loi/loi.model';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { DonBaoHanhService } from 'app/entities/don-bao-hanh/service/don-bao-hanh.service';
import { FormBuilder } from '@angular/forms';
import {
  Column,
  GridOption,
  Formatters,
  OnEventArgs,
  AngularGridInstance,
  FieldType,
  Filters,
  Editors,
  LongTextEditorOption,
  Formatter,
  ExtensionName,
} from 'angular-slickgrid';
import { IDonBaoHanh } from './../../don-bao-hanh/don-bao-hanh.model';
import { Component, Input, OnInit } from '@angular/core';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IPhanTichSanPham } from '../phan-tich-san-pham.model';
import { PhanTichSanPhamService } from '../service/phan-tich-san-pham.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

import dayjs from 'dayjs/esm';
import { IKho } from 'app/entities/kho/kho.model';
import { KhoService } from 'app/entities/kho/service/kho.service';
import { faBarcode, faL, faPrint, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NavbarComponent } from 'app/layouts/navbar/navbar.component';
import { ConstantPool } from '@angular/compiler';
import { forkJoin } from 'rxjs';

type DonBaoHanh = {
  id: number;
  slDaPhanTich: number;
  slPhanTich: number;
  tienDo?: number;
  [key: string]: any;
};

@Component({
  selector: 'jhi-phan-tich-san-pham',
  templateUrl: './phan-tich-san-pham.component.html',
  styleUrls: ['../../../slickgrid-theme-booststrap.css', './phan-tich-san-pham.component.scss'],
})
export class PhanTichSanPhamComponent implements OnInit {
  // danh sách url
  loisUrl = this.applicationConfigService.getEndpointFor('api/lois');
  sanPhamsUrl = this.applicationConfigService.getEndpointFor('api/san-phams');
  phanLoaiChiTietTiepNhanUrl = this.applicationConfigService.getEndpointFor('api/phan-loai-chi-tiet-tiep-nhans');
  chiTietSanPhamTiepNhanUrl = this.applicationConfigService.getEndpointFor('api/chi-tiet-don-bao-hanhs');
  danhSachTinhTrangUrl = this.applicationConfigService.getEndpointFor('api/danh-sach-tinh-trangs');
  loiUrl = this.applicationConfigService.getEndpointFor('api/lois');
  updateTrangThaiDonBaoHanhUrl = this.applicationConfigService.getEndpointFor('api/don-bao-hanhs/update-trang-thai');
  postMaBienBanUrl = this.applicationConfigService.getEndpointFor('api/ma-bien-ban/post');
  updateDonBaoHanhUrl = this.applicationConfigService.getEndpointFor('api/update-don-bao-hanh');

  // biến chứa danh sách cần dùng
  donBaoHanhs: any[] = [];
  isLoading = false;
  listOfPhanTichSanPhamByPLCTTN: any[] = [];
  listOfKhaiBaoLoi: any[] = [];
  catchChangeOfListKhaiBaoLoi: any[] = [];
  danhSachBienBanSanPhamTheoKho: any[] = [];
  danhSachKho: IKho[] = [];
  //---------------------------------------------------------------set up khung hien thi loi-----------------------------------------
  columnOne = 0;
  columnTwo = 0;
  columnThree = 0;
  columnDefinitions?: IDonBaoHanh[];
  columnDefinitions1: Column[] = [];
  gridOptions1: GridOption = {};
  dataset1: any[] = [];
  angularGrid?: AngularGridInstance;
  dataViewObj: any;
  gridObj: any;
  lois?: ILoi[];
  danhSachSanPhams?: ISanPham[];
  resultChiTietSanPhamTiepNhans: any[] = [];
  chiTietSanPhamTiepNhans: IChiTietSanPhamTiepNhan[] = [];
  danhSachTinhTrang?: IDanhSachTinhTrang[];
  phanLoaiChiTietTiepNhans: IPhanLoaiChiTietTiepNhan[] = [];
  phanTichMaTiepNhans?: IPhanTichSanPham[];
  phanTichLoi?: IPhanTichLoi[];
  donBaoHanh1: any;
  danhSachBienBan: any[] = [];
  idDonBaoHanh = '';
  themMoiBienBan: any;
  phanTichChiTietSanPham?: { tenSanPham: string; tinhTrang: string; slTiepNhan: number; slTon: number };
  predicate!: string;
  ascending!: boolean;
  //-----------------------------------------------------------------------------------------------------------------------------------------
  @Input() searchKey = '';
  //Biến chứa thông tin biên bản
  year = '';
  month = '';
  date = '';
  hours = '';
  minutes = '';
  seconds = '';
  maBienBan = '';
  loaiBienBan = '';
  maKho = '';
  tenKho = '';

  yearTN = 0;
  monthTN = 0;
  dateTN = 0;
  bienBanTiepNhan: any;
  bienBanKiemNghiem: any;
  //--------------------------------------------------------------------------------------------------------
  title = 'Phân tích sản phẩm';
  //danh sách Thông tin chi tiết sản phẩm phân tích
  listOfChiTietSanPhamPhanTichGoc: any[] = [];
  listOfChiTietSanPhamPhanTich: any[] = [];
  listOfChiTietSanPhamPhanTichTL: any[] = [];
  // biến chứa thông tin đơn bảo hành
  donBaoHanh: any = {};

  scanLot = true;
  scanSerial = true;
  // lưu thông tin account
  account: Account | null = null;
  // biến bật tắt popup
  popupPTMTN = false;
  popupChiTietLoi = false;
  popupShowChiTietLoi = false;
  fixKhaiBaoLoi = false;
  type = '';
  //biến đóng mở popup
  popupInBBTN = false;
  popupInBBTN1 = false;
  popupInBBTN2 = false;
  popupInBBTN3 = false;
  popupInBBTN4 = false;
  groupOptionsTN = false;
  groupOptionsKN = false;
  groupOptionsTL = false;

  popupInBBKN = false;
  popupInBBTL = false;
  idBBTN = 0;
  popupSelectButton = false;

  popupInBBTNtest = false;
  // biến chứa index của danh sách sản phẩm cần phân tích
  indexOfPhanTichSanPham = 0;
  // Biến chứa vị trí index của phần tử cần khai báo lỗi
  indexOfChiTietPhanTichSanPham = 0;
  //Biến chứa thông tin scan
  lotNumber = '';
  //Biến chứa thể loại scan
  scanType = '';
  // Biến lưu kết quả tách sản phẩm theo kho
  resultOfSanPhamTheoKho: { key: string; value: any[] }[] = [];
  resultOfSanPhamTheoKhoTL: { key: string; value: any[] }[] = [];
  //Biến lưu danh sách gợi ý trạng thái
  trangThais: { key: string }[] = [{ key: 'Đổi mới' }, { key: 'Sửa chữa' }];
  //Biến lưu key tìm kiếm
  @Input() tinhTrang = '';
  @Input() tenSanPham = '';
  saveSerial = '';
  saveLOT = '';
  saveYear = '';
  saveTheLoai = '';
  saveSanPham = '';
  //Biến lưu thông tin 1 phần tử của phân loại chi tiết sản phẩm
  itemOfPhanLoaiChiTietSanPham: any;
  // biến dùng để check all
  checkedAll = false;
  //Biến chứa danh sách liên
  danhSachLienBienBanTiepNhan: { name: string; value: string }[] = [
    { name: 'Liên 1', value: '(Tổ đổi)' },
    { name: 'Liên 2', value: '(Khách hàng)' },
    { name: 'Liên 3', value: '(P.KHTT)' },
    { name: 'Liên 4', value: '(P.BH 1)' },
  ];

  // Biến đóng mở popup thông báo
  isPopupVisible = false;
  popupMessage = '';
  trangThaiIn = '';
  trangThaiInTN = '';
  trangThaiInKN = '';
  trangThaiInTL = '';
  maKhoPrint = '';
  // Biến giá trị của input range
  inputValues: number[] = [0, 40, 70, 100];
  // rangeColors: { min: number; max: number;  color: string }[] = [
  //   { min: 0, max: 20, color: 'red' },
  //   { min: 21, max: 40, color: 'green' },
  //   { min: 41, max: 60, color: 'yellow' },
  //   { min: 61, max: 80, color: 'orange' },
  //   { min: 81, max: 100, color: 'red' }
  // ]

  indexOfdanhSachLienBienBanTiepNhan = 0;
  phanTichSanPhams: any;
  isChanged = false;
  idAddRow = 0;
  selectedValue = '';
  faPrint = faPrint;
  faBarcode = faBarcode;
  faTrash = faTrash;

  constructor(
    protected phanTichSanPhamService: PhanTichSanPhamService,
    protected donBaoHanhService: DonBaoHanhService,
    protected sanPhamService: SanPhamService,
    protected modalService: NgbModal,
    protected formBuilder: FormBuilder,
    protected applicationConfigService: ApplicationConfigService,
    protected http: HttpClient,
    protected accountService: AccountService,
    protected khoService: KhoService,
    protected navBarComponent: NavbarComponent
  ) {}

  buttonIn: Formatter<any> = (_row, _cell, value) =>
    value
      ? `<button class="btn btn-primary fa fa-print" style="height: 28px; line-height: 14px"></button>`
      : { text: '<i class="fa fa-print" aria-hidden="true"></i>' };

  buttonPT: Formatter<any> = (_row, _cell, value) =>
    value
      ? `<button class="btn btn-warning fa fa-pencil" style="height: 28px; line-height: 14px; width: 15px"></button>`
      : { text: '<button class="btn btn-warning fa fa-pencil" style="height: 28px; line-height: 14px"></button>' };

  buttonCTL: Formatter<any> = (_row, _cell, value) =>
    value
      ? `<button class="btn btn-success fa fa-exclamation-triangle" style="height: 28px; line-height: 14px; "></button>`
      : { text: '<button class="btn btn-success fa fa-exclamation-triangle" style="height: 28px; line-height: 14px; "></button>' };

  loadAll(): void {
    this.navBarComponent.toggleSidebar2();
    this.isLoading = true;
    this.http.get<any>('api/phan-tich-san-pham').subscribe(res => {
      this.donBaoHanhs = res.sort((a: any, b: any) => b.id! - a.id!) ?? [];
      for (let i = 0; i < this.donBaoHanhs.length; i++) {
        this.donBaoHanhs[i].tienDo = (this.donBaoHanhs[i].slDaPhanTich / this.donBaoHanhs[i].slPhanTich) * 100;
      }
      // console.log('bbbb', this.donBaoHanhs);
    });
  }

  ngOnInit(): void {
    console.time('load-phan-tich');
    this.http.get<DonBaoHanh[]>('api/phan-tich-san-pham').subscribe((res: DonBaoHanh[]) => {
      this.donBaoHanhs = res
        .sort((a, b) => b.id - a.id)
        .map(
          (item): DonBaoHanh => ({
            ...item,
            tienDo: item.slPhanTich ? (item.slDaPhanTich / item.slPhanTich) * 100 : 0,
          })
        );
      console.timeEnd('load-phan-tich');
    });

    // Gọi song song các API phụ trợ
    forkJoin({
      lois: this.http.get<any>('api/lois'),
      sanPhams: this.http.get<any>('api/san-phams'),
      kho: this.khoService.query(),
      // bienBan: this.http.get<any>('api/ma-bien-bans'),
      account: this.accountService.identity(),
    }).subscribe(({ lois, sanPhams, kho, account }) => {
      this.lois = lois;
      this.danhSachSanPhams = sanPhams;
      this.danhSachKho = kho.body ?? [];
      // this.danhSachBienBan = bienBan;
      this.account = account;
    });
    // setTimeout(()=>{
    this.columnDefinitions = [];
    this.columnDefinitions1 = [
      {
        id: 'popup',
        field: 'id',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        formatter: this.buttonIn,
        maxWidth: 60,
        minWidth: 60,
        onCellClick: (e: Event, args: OnEventArgs) => {
          this.donBaoHanh = args.dataContext;
          this.openPopupBtn();
          // console.log(args);
          console.log('info don bao hanh: ', this.donBaoHanh);

          this.idBBTN = args.dataContext.id;
          this.showData(args.dataContext.id);
          setTimeout(() => {
            //Loại bỏ sản phẩm có số lượng tiếp nhận = 0
            this.listOfChiTietSanPhamPhanTich = this.listOfChiTietSanPhamPhanTich.filter(item => item.slTiepNhan !== 0);
            for (let i = 0; i < this.listOfChiTietSanPhamPhanTich.length; i++) {
              this.updateTienDoSanPhamPhanTich(this.listOfChiTietSanPhamPhanTich[i].id, i);
            }
            // setTimeout(() => {
            //   this.updateDanhSachBienBanTheoKho();
            // }, 15000);
          }, 3000);
          // this.angularGrid?.gridService.highlightRow(args.row, 1500);
          // this.angularGrid?.gridService.setSelectedRow(args.row);
        },
      },

      {
        id: 'popupPT',
        field: 'idPT',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        formatter: this.buttonPT,
        maxWidth: 60,
        minWidth: 60,
        onCellClick: (e: Event, args: OnEventArgs) => {
          this.openPopupPTMTN();
          this.donBaoHanh = args.dataContext;
          // khởi tạo giá trị để lưu vào trong session
          sessionStorage.setItem('DonBaoHanh', JSON.stringify(args.dataContext));
          // console.log('don bao hanh: ', this.donBaoHanh);
          this.showData(args.dataContext.id);
          setTimeout(() => {
            // console.log('chi tiet san pham phan tich: ', this.listOfChiTietSanPhamPhanTich);
            //Loại bỏ sản phẩm có số lượng tiếp nhận = 0
            this.listOfChiTietSanPhamPhanTich = this.listOfChiTietSanPhamPhanTich.filter(item => item.slTiepNhan !== 0);
            for (let i = 0; i < this.listOfChiTietSanPhamPhanTich.length; i++) {
              this.updateTienDoSanPhamPhanTich(this.listOfChiTietSanPhamPhanTich[i].id, i);
            }
          }, 3000);
        },
      },

      // {
      //   id: 'popupCTL',
      //   field: 'idCTL',
      //   excludeFromColumnPicker: true,
      //   excludeFromGridMenu: true,
      //   excludeFromHeaderMenu: true,
      //   formatter: this.buttonCTL,
      //   maxWidth: 60,
      //   minWidth: 60,
      //   onCellClick: (e: Event, args: OnEventArgs) => {
      //     this.openPopupShowChiTietLoi();
      //   },
      // },
      {
        id: 'id',
        name: 'Mã tiếp nhận',
        field: 'maTiepNhan',
        minWidth: 120,
        sortable: true,
        filterable: true,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            cols: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
      },
      {
        id: 'tenKhachHang',
        name: 'Khách hàng',
        field: 'khachHang.tenKhachHang',
        sortable: true,
        filterable: true,
        minWidth: 300,
        maxWidth: 400,
        formatter: Formatters.complexObject,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            cols: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
      },
      {
        id: 'slTiepNhan',
        name: 'Tổng tiếp nhận',
        field: 'slTiepNhan',
        sortable: true,
        filterable: true,
        minWidth: 80,
        formatter: Formatters.complexObject,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },

      {
        id: 'slPhanTich',
        name: 'Số lượng phân tích',
        field: 'slPhanTich',
        sortable: true,
        filterable: true,
        minWidth: 80,
        formatter: Formatters.complexObject,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },

      {
        id: 'slDaPhanTich',
        name: 'Đã xử lý',
        field: 'slDaPhanTich',
        sortable: true,
        filterable: true,
        formatter: Formatters.complexObject,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },

      {
        id: 'tienDo',
        name: 'Tiến độ',
        field: 'tienDo',
        sortable: true,
        filterable: true,
        minWidth: 200,

        formatter: Formatters.progressBar,
        type: FieldType.number,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },

      {
        id: 'ngayTiepNhan',
        name: 'Ngày tiếp nhận',
        field: 'ngayTiepNhan',
        sortable: true,
        filterable: true,
        minWidth: 200,

        type: FieldType.object,
        formatter: Formatters.dateTimeIso,
        filter: {
          placeholder: 'search',
          model: Filters.compoundDate,
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            cols: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
      },
      {
        id: 'trangThai',
        name: 'Trạng thái',
        field: 'trangThai',
        sortable: true,
        filterable: true,
        minWidth: 200,

        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
        formatter: (row, cell, value, column, dataContext) => {
          const status = String(value);
          const tooltip = `Trạng thái: ${status}`;

          const colorMap: Record<string, string> = {
            'Chờ phân tích': '#f0ad4e',
            'Đang phân tích': '#5bc0de',
            'Hoàn thành phân tích': '#5cb85c',
          };

          const color = colorMap[status] ?? '#999';

          return `
    <div style="display: flex; align-items: center; white-space: normal; word-wrap: break-word;">
      <span style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; display: inline-block; margin-right: 6px;"></span>
      <span>${status}</span>
    </div>
  `;
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            cols: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
      },
    ];
    // console.log('danh sách kho: ', this.danhSachKho);
    // },3000)
    this.gridOptions1 = {
      enableAutoResize: true,
      enableSorting: true,
      enableFiltering: true,
      enablePagination: true,
      enableAutoSizeColumns: true,
      enableGridMenu: true,
      gridMenu: {
        // iconCssClass: 'd-none',
        hideClearAllFiltersCommand: false,
        hideClearAllSortingCommand: false,
        hideExportCsvCommand: false,
        hideExportExcelCommand: false,
        commandTitle: 'Tác vụ lưới',
        columnTitle: 'Hiển thị cột',
      },
      // asyncEditorLoadDelay: 1000,
      // enableColumnPicker: true,
      // enableRowDetailView: true,
      // rowDetailView: {
      //   // đặt button ở vị trí mong muốn
      //   columnIndexPosition: 1,
      //   // hàm thực thi
      //   process: item => this.simulateServerAsyncCall(item),
      //   // chạy lệnh 1 lần , những lần sau sẽ hiển thị dữ liệu của lần chạy đầu tiên
      //   loadOnce: true,
      //   // mở rộng hàng
      //   singleRowExpand: true,
      //   // sử dụng chức năng click trên 1 hàng
      //   useRowClick: true,
      //   // số lượng hàng dùng để hiển thị thông tin của row detail
      //   panelRows: 10,
      //   // component loading
      //   preloadComponent: PhanTichSanPhamReLoadComponent,
      //   // component hiển thị row detail
      //   viewComponent: PhanTichMaTiepNhanComponent,
      //   // chức năng xác định parent
      //   parent: true,
      // },
      pagination: {
        pageSizes: [30, 50, 100],
        pageSize: this.donBaoHanhs.length,
      },
      // columnPicker: {
      //   hideForceFitButton: true,
      //   hideSyncResizeButton: true,
      //   onColumnsChanged(e, args) {
      //     console.log(args.visibleColumns);
      //   },
      // },
      editable: true,
      enableCellNavigation: true,
      gridHeight: 620,
      gridWidth: '100%',
      // autoHeight: true,
      // autoFitColumnsOnFirstLoad: true,
      // asyncEditorLoading: true,
      forceFitColumns: true,
      frozenColumn: 3,
    };
    this.getLois();
    this.getSanPhams();
    this.getDanhSachKho();
    this.getDanhSachBienBan();
    this.accountService.identity().subscribe(account => {
      this.account = account;
    });
    // this.loadAll();
  }
  //lấy danh sách biên bản
  getDanhSachBienBan(): void {
    this.http.get<any>('api/ma-bien-bans').subscribe(res => {
      console.log('danh sach bien ban: ', res);
      this.danhSachBienBan = res;
    });
  }
  getDanhSachKho(): void {
    this.khoService.query().subscribe({
      next: (res: HttpResponse<IKho[]>) => {
        this.danhSachKho = res.body ?? [];
        // console.log('danh sách kho: ', this.danhSachKho);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
  getPhanTichSanPhamByPLCTTN(id: number): void {
    this.http.get<any>(`api/phan-tich-san-pham/${id}`).subscribe(res => {
      this.listOfPhanTichSanPhamByPLCTTN = res;
      // console.log('Danh sach phan tich san pham:', this.listOfPhanTichSanPhamByPLCTTN);
    });
  }
  //=========================================================== popup chi tiết sản phẩm phân tích ======================================================
  // hàm xử lý thông tin chi tiết sản phẩm phân tích
  showData(id: number | undefined): void {
    this.listOfChiTietSanPhamPhanTich = [];
    this.resultOfSanPhamTheoKho = [{ key: '', value: [] }];
    this.resultOfSanPhamTheoKhoTL = [{ key: '', value: [] }];
    this.donBaoHanh.slCanPhanTich = 0;

    if (typeof id !== 'number' || isNaN(id)) {
      return;
    }

    this.http.get<any>(`${this.chiTietSanPhamTiepNhanUrl}/${id}`).subscribe(res => {
      this.chiTietSanPhamTiepNhans = res;

      this.http.get<any>(this.danhSachTinhTrangUrl).subscribe(resTT => {
        this.danhSachTinhTrang = resTT;

        const donBaoHanhId = String(this.donBaoHanh?.id ?? '');
        this.http.get<any[]>(`${this.phanLoaiChiTietTiepNhanUrl}/by-don-bao-hanh/${donBaoHanhId}`).subscribe(res1 => {
          this.phanLoaiChiTietTiepNhans = res1;

          let count = 0;
          const ctMap = new Map<number, any>();
          this.chiTietSanPhamTiepNhans.forEach(ct => {
            if (ct?.id !== undefined) {
              ctMap.set(ct.id, ct);
            }
          });

          this.listOfChiTietSanPhamPhanTich = this.phanLoaiChiTietTiepNhans
            .filter(pl => {
              // eslint-disable-next-line @typescript-eslint/no-shadow
              const id = pl.chiTietSanPhamTiepNhan?.id;
              return pl.danhSachTinhTrang?.id !== 3 && typeof id === 'number' && ctMap.has(id);
            })
            .map(pl => {
              const ctId = pl.chiTietSanPhamTiepNhan?.id;
              if (typeof ctId !== 'number') {
                return null;
              }

              const ct = ctMap.get(ctId);
              if (!ct) {
                return null;
              }

              const item = {
                stt: count++,
                donVi: ct.sanPham?.donVi ?? '',
                phanLoaiChiTietTiepNhan: pl,
                id: pl.id,
                maTiepNhan: this.donBaoHanh.maTiepNhan,
                sanPham: ct.sanPham,
                tenSanPham: ct.sanPham?.name ?? '',
                tinhTrang: pl.danhSachTinhTrang?.tenTinhTrangPhanLoai ?? '',
                slTiepNhan: pl.soLuong ?? 0,
                slDaPhanTich: 0,
                slConLai: 0,
                tienDo: 0,
                check: false,
              };
              return item;
            })
            .filter(item => item !== null);

          // Gom nhóm theo kho
          const khoMap = new Map<string, any[]>();
          this.listOfChiTietSanPhamPhanTich.forEach(item => {
            this.donBaoHanh.slCanPhanTich += item.slTiepNhan;

            const tenKho =
              item.phanLoaiChiTietTiepNhan?.kho?.tenKho ??
              item.phanLoaiChiTietTiepNhan?.chiTietSanPhamTiepNhan?.kho?.tenKho ??
              'Không xác định';

            if (!khoMap.has(tenKho)) {
              khoMap.set(tenKho, []);
            }

            khoMap.get(tenKho)?.push(item);
          });

          this.resultOfSanPhamTheoKho = Array.from(khoMap.entries()).map(([key, value]) => ({ key, value }));
          this.resultOfSanPhamTheoKhoTL = [...this.resultOfSanPhamTheoKho];

          this.resultOfSanPhamTheoKho = this.resultOfSanPhamTheoKho.filter(item => item.key !== '');
          this.resultOfSanPhamTheoKhoTL = this.resultOfSanPhamTheoKhoTL.filter(item => item.key !== '');
          this.listOfChiTietSanPhamPhanTich = this.listOfChiTietSanPhamPhanTich.filter(item => item.slTiepNhan !== 0);

          this.updateDanhSachBienBanTheoKho();

          this.listOfChiTietSanPhamPhanTich.forEach((item, i) => {
            this.updateTienDoSanPhamPhanTich(item.id, i);
          });
        });
      });
    });
  }

  openGridMenu(event?: MouseEvent): void {
    if (!this.angularGrid) {
      console.warn('angularGrid chưa được gán');
      return;
    }

    const gridMenuInstance = this.angularGrid.extensionService?.getExtensionInstanceByName(ExtensionName.gridMenu);
    console.log('GridMenu Instance:', gridMenuInstance);

    if (gridMenuInstance) {
      const mouseEvent = event ?? new MouseEvent('click');
      gridMenuInstance.showGridMenu(mouseEvent);
    } else {
      console.warn('GridMenu chưa được khởi tạo hoặc extension chưa sẵn sàng');
    }
  }
  updateDanhSachBienBanTheoKho(): void {
    //Lọc sản phẩm có sl Tiếp nhận rỗng và check = false
    for (let i = 0; i < this.resultOfSanPhamTheoKho.length; i++) {
      //lọc danh sách từng kho
      this.resultOfSanPhamTheoKho[i].value = this.resultOfSanPhamTheoKho[i].value.filter(
        item => item.slTiepNhan !== 0 && item.tinhTrang === 'Đổi mới'
      );
    }
    for (let i = 0; i < this.resultOfSanPhamTheoKhoTL.length; i++) {
      //lọc danh sách từng kho
      this.resultOfSanPhamTheoKhoTL[i].value = this.resultOfSanPhamTheoKhoTL[i].value.filter(
        item => item.slTiepNhan !== 0 && item.tinhTrang === 'Đổi mới'
      );
    }
    setTimeout(() => {
      this.resultOfSanPhamTheoKho = this.resultOfSanPhamTheoKho.filter((item: any) => item.value.length !== 0);
      this.resultOfSanPhamTheoKhoTL = this.resultOfSanPhamTheoKhoTL.filter((item: any) => item.value.length !== 0);
    }, 500);
    console.log('Danh sách phân tách sản phẩm theo kho: ', this.resultOfSanPhamTheoKho);
  }
  testCheck(test: any): void {
    // console.log(test);
  }
  simulateServerAsyncCall(item: any): Promise<unknown> {
    // random set of names to use for more item detail
    // console.log('tessst:0', item);
    // khởi tạo giá trị để lưu vào trong session
    sessionStorage.setItem('sessionStorage', JSON.stringify(item));
    // fill the template on async delay
    return new Promise(resolve => {
      setTimeout(() => {
        const itemDetail = item;
        // console.log(item);
        // resolve the data after delay specified
        resolve(itemDetail);
      }, 1000);
    });
  }

  resultPopup(a: boolean, type: string): void {
    this.popupChiTietLoi = a;
    // cach 1:
    switch (type) {
      case 'lot':
        this.type = 'lot';
        break;
      case 'serial':
        this.type = 'serial';
        break;
      default:
        this.openPopupNoti('Khong co type nao phu hop');
    }
    // cach 2:
    // this.type = type;
  }

  resultPopupBtn(a: boolean): void {
    this.popupSelectButton = a;
  }

  resultPopupPrintBBTN(type: string): void {
    this.popupInBBTN = true;
    this.type = type;
  }

  openPopupShowChiTietLoi(): void {
    this.popupShowChiTietLoi = true;
    // console.log('mo popup ctl', this.popupShowChiTietLoi);
  }

  closePopupShowChiTietLoi(): void {
    // đóng popup
    this.popupShowChiTietLoi = false;
  }

  closePopup(): void {
    this.popupChiTietLoi = false;
    this.scanLot = true;
    this.scanSerial = true;
    this.fixKhaiBaoLoi = false;
  }

  closePopupPTMTN(): void {
    this.popupPTMTN = false;
  }

  // mở popup chọn loại biên bản
  openPopupBtn(): void {
    this.navBarComponent.toggleSidebar2();
    this.popupSelectButton = true;
    console.log('id dbh', this.donBaoHanh.id);
    if (this.donBaoHanh?.id) {
      this.http.get<any>(`api/danh-sach-bien-ban/${this.donBaoHanh.id as number}`).subscribe(res => {
        console.log('res', res);
        const maKhoArr = new Set<string>();
        let trangThaiInTNUpdate = false;
        let trangThaiInKNUpdate = false;
        let trangThaiInTLUpdate = false;

        res.forEach((item: any) => {
          console.log('dbh id', item.id);
          console.log('so lan in', item.soLanIn);
          console.log('bien ban', item.loaiBienBan);
          if (item.maKho && item.maKho.trim() !== '') {
            maKhoArr.add(item.maKho);
          }
          if (item.loaiBienBan === 'Tiếp nhận') {
            this.trangThaiInTN = item.soLanIn > 0 || item.soLanIn === null || undefined ? 'Đã in' : 'Chưa in';
            trangThaiInTNUpdate = true;
          } else if (item.loaiBienBan === 'Kiểm nghiệm') {
            this.trangThaiInKN = item.soLanIn > 0 || item.soLanIn === null || undefined ? 'Đã in kho' : 'Chưa in';
            trangThaiInKNUpdate = true;
          } else if (item.loaiBienBan === 'Thanh lý') {
            this.trangThaiInTL = item.soLanIn > 0 || item.soLanIn === null || undefined ? 'Đã in kho' : 'Chưa in';
            trangThaiInTLUpdate = true;
          }
        });
        if (!trangThaiInTNUpdate) {
          this.trangThaiInTN = 'Chưa in';
        }
        if (!trangThaiInKNUpdate) {
          this.trangThaiInKN = 'Chưa in';
        }
        if (!trangThaiInTLUpdate) {
          this.trangThaiInTL = 'Chưa in';
        }
        this.maKhoPrint = Array.from(maKhoArr).join(', ');
        console.log('thanh ly', this.trangThaiInTL);
      });
    }
  }

  openPopupPTMTN(): void {
    this.navBarComponent.toggleSidebar2();

    this.popupPTMTN = true;
    setTimeout(() => {
      // console.log('chi tiet san pham phan tich: ', this.listOfChiTietSanPhamPhanTich);
      //Loại bỏ sản phẩm có số lượng tiếp nhận = 0
      this.listOfChiTietSanPhamPhanTich = this.listOfChiTietSanPhamPhanTich.filter(item => item.slTiepNhan !== 0);
      for (let i = 0; i < this.listOfChiTietSanPhamPhanTich.length; i++) {
        this.updateTienDoSanPhamPhanTich(this.listOfChiTietSanPhamPhanTich[i].id, i);
      }
    }, 3000);
  }

  // đóng popup chọn loại biên bản
  closePopupBtn(): void {
    this.popupSelectButton = false;
  }

  // mở popup biên bản tiếp nhận
  openPopupBBTN(): void {
    this.popupInBBTN = true;
    const cacheKey = `TiepNhan ${this.idBBTN}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      this.resultChiTietSanPhamTiepNhans = JSON.parse(cached);
      this.sortResultChiTietSanPham();
      this.extractNgayTiepNhan();
      this.updateMaBienBan();
      return;
    }

    forkJoin({
      chiTiet: this.http.get<any>(`${this.chiTietSanPhamTiepNhanUrl}/${this.idBBTN}`),
      tinhTrang: this.http.get<any>(this.danhSachTinhTrangUrl),
      phanLoai: this.http.get<any>(this.phanLoaiChiTietTiepNhanUrl),
    }).subscribe(({ chiTiet, tinhTrang, phanLoai }) => {
      console.log('📥 Dữ liệu popup BBTN:', { chiTiet, tinhTrang, phanLoai });
      this.chiTietSanPhamTiepNhans = chiTiet;
      this.danhSachTinhTrang = tinhTrang;
      this.phanLoaiChiTietTiepNhans = phanLoai;

      const phanLoaiMap = new Map<number, IPhanLoaiChiTietTiepNhan[]>();
      for (const pl of this.phanLoaiChiTietTiepNhans) {
        const id = pl.chiTietSanPhamTiepNhan?.id;
        if (typeof id === 'number') {
          if (!phanLoaiMap.has(id)) {
            phanLoaiMap.set(id, []);
          }
          phanLoaiMap.get(id)!.push(pl);
        }
      }

      const list = this.chiTietSanPhamTiepNhans.map(ct => {
        const id = ct.id;
        const phanLoais = typeof id === 'number' ? phanLoaiMap.get(id) ?? [] : [];

        let slDoiMoi = 0,
          slSuaChua = 0,
          slKhongBaoHanh = 0;
        for (const pl of phanLoais) {
          const sl = pl.soLuong ?? 0;
          if (pl.danhSachTinhTrang?.id === 1) {
            slDoiMoi += sl;
          } else if (pl.danhSachTinhTrang?.id === 2) {
            slSuaChua += sl;
          } else if (pl.danhSachTinhTrang?.id === 3) {
            slKhongBaoHanh += sl;
          }
        }

        const slTiepNhan = slDoiMoi + slSuaChua + slKhongBaoHanh;

        return {
          id,
          tenSanPham: ct.sanPham?.name,
          donVi: ct.sanPham?.donVi,
          slKhachGiao: ct.soLuongKhachHang,
          slTiepNhanTong: 0,
          slTiepNhan,
          slDoiMoi,
          slSuaChua,
          slKhongBaoHanh,
          chiTietSanPhamTiepNhan: ct,
          tinhTrangBaoHanh: ct.tinhTrangBaoHanh === 'true',
        };
      });

      sessionStorage.setItem(cacheKey, JSON.stringify(list));
      this.resultChiTietSanPhamTiepNhans = list;
      this.sortResultChiTietSanPham();
      this.extractNgayTiepNhan();
      this.updateMaBienBan();
    });
  }
  sortResultChiTietSanPham(): void {
    this.resultChiTietSanPhamTiepNhans.sort((a, b) => {
      if (a.slSuaChua > 0 && b.slSuaChua === 0) {
        return 1;
      }
      if (a.slSuaChua === 0 && b.slSuaChua > 0) {
        return -1;
      }
      return 0;
    });
  }

  extractNgayTiepNhan(): void {
    this.yearTN = this.donBaoHanh.ngayTiepNhan.substr(2, 2);
    this.monthTN = this.donBaoHanh.ngayTiepNhan.substr(5, 2);
    this.dateTN = this.donBaoHanh.ngayTiepNhan.substr(8, 2);
  }

  updateMaBienBan(): void {
    this.maBienBan = '';
    this.loaiBienBan = 'Tiếp nhận';
    for (const bb of this.danhSachBienBan) {
      if (bb.loaiBienBan === this.loaiBienBan && bb.donBaoHanh.id === this.donBaoHanh.id) {
        this.maBienBan = bb.maBienBan;
        this.themMoiBienBan = bb;
      }
    }

    if (!this.maBienBan) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      this.year = now.getFullYear().toString().slice(-2);
      this.month = pad(now.getMonth() + 1);
      this.date = pad(now.getDate());
      this.hours = pad(now.getHours());
      this.minutes = pad(now.getMinutes());
      this.seconds = pad(now.getSeconds());

      this.maBienBan = `TN${this.date}${this.month}${this.year}${this.hours}${this.minutes}${this.seconds}`;
      this.themMoiBienBan = {
        id: null,
        maBienBan: this.maBienBan,
        loaiBienBan: this.loaiBienBan,
        soLanIn: 0,
        donBaoHanh: this.donBaoHanh,
      };
    }
  }

  showGroupOptionsTN(): void {
    this.groupOptionsTN = true;
  }

  showGroupOptionsKN(): void {
    this.groupOptionsKN = true;
  }

  showGroupOptionsTL(): void {
    this.groupOptionsTL = true;
  }
  caculateErrors(index: any): void {
    for (let j = 0; j < this.resultOfSanPhamTheoKho[index].value.length; j++) {
      this.http.get<any>(`api/tinh-toan-so-luong-loi/${this.resultOfSanPhamTheoKho[index].value[j].id as number}`).subscribe(res => {
        this.resultOfSanPhamTheoKho[index].value[j].loiLinhDong = res.loiLinhDong;
        this.resultOfSanPhamTheoKho[index].value[j].loiKyThuat = res.loiKyThuat;
        // console.log(`tinh toan: ${j}`,res)
      });
    }
  }
  openPopupInBBKN(index: number, tenKho: string): void {
    this.isLoading = true;
    const maKho = this.getMaKhoFromTenKho(tenKho);
    this.loaiBienBan = 'Kiểm nghiệm';

    const khoInfo = this.danhSachKho.find(k => k.tenKho === tenKho);
    this.maKho = khoInfo?.maKho ?? '';
    this.tenKho = khoInfo?.tenKho ?? '';

    this.danhSachBienBanSanPhamTheoKho = this.resultOfSanPhamTheoKho[index].value;
    const id = String(this.donBaoHanh.id);
    forkJoin({
      bienBanTiepNhan: this.http.get(`api/danh-sach-bien-ban/tiep-nhan/${id}`),
      danhSachBienBan: this.http.get<any[]>('api/ma-bien-bans'),
    }).subscribe(({ bienBanTiepNhan, danhSachBienBan }) => {
      this.bienBanTiepNhan = bienBanTiepNhan;
      this.danhSachBienBan = danhSachBienBan;

      if (!this.bienBanTiepNhan) {
        this.openPopupNoti('Vui lòng in biên bản tiếp nhận trước');
        return;
      }

      const bienBanKN = danhSachBienBan.find(
        b => b.loaiBienBan === this.loaiBienBan && b.donBaoHanh.id === this.donBaoHanh.id && b.maKho === maKho
      );

      if (bienBanKN) {
        this.maBienBan = bienBanKN.maBienBan;
        this.themMoiBienBan = bienBanKN;
      } else {
        this.maBienBan = this.generateMaBienBan('KN', maKho);
        this.themMoiBienBan = {
          id: null,
          maBienBan: this.maBienBan,
          loaiBienBan: this.loaiBienBan,
          soLanIn: 0,
          donBaoHanh: this.donBaoHanh,
          maKho: maKho,
        };
      }

      this.yearTN = this.donBaoHanh.ngayTiepNhan.substr(2, 2);
      this.monthTN = this.donBaoHanh.ngayTiepNhan.substr(5, 2);
      this.dateTN = this.donBaoHanh.ngayTiepNhan.substr(8, 2);

      this.popupInBBKN = true;
      this.isLoading = false;
    });
  }

  openPopupInBBTL(index: number, tenKho: string): void {
    this.isLoading = true;
    const maKho = this.getMaKhoFromTenKho(tenKho);
    this.loaiBienBan = 'Thanh lý';

    const khoInfo = this.danhSachKho.find(k => k.tenKho === tenKho);
    this.maKho = khoInfo?.maKho ?? '';
    this.tenKho = khoInfo?.tenKho ?? '';

    this.danhSachBienBanSanPhamTheoKho = this.resultOfSanPhamTheoKho[index].value;

    const id = String(this.donBaoHanh.id);
    forkJoin({
      bienBanTiepNhan: this.http.get(`api/danh-sach-bien-ban/tiep-nhan/${id}`),
      bienBanKiemNghiem: this.http.get(`api/danh-sach-bien-ban/kiem-nghiem/${id}`),
      danhSachBienBan: this.http.get<any[]>('api/ma-bien-bans'),
    }).subscribe(({ bienBanTiepNhan, bienBanKiemNghiem, danhSachBienBan }) => {
      const danhSachBBKN = bienBanKiemNghiem as { maKho: string }[];
      this.bienBanTiepNhan = bienBanTiepNhan;
      this.bienBanKiemNghiem = danhSachBBKN.find(b => b.maKho === maKho);
      this.danhSachBienBan = danhSachBienBan;

      if (!this.bienBanTiepNhan || !this.bienBanKiemNghiem) {
        this.openPopupNoti('Vui lòng in biên bản tiếp nhận và kiểm nghiệm trước');
        return;
      }

      const bienBanTL = danhSachBienBan.find(
        b => b.loaiBienBan === this.loaiBienBan && b.donBaoHanh.id === this.donBaoHanh.id && b.maKho === maKho
      );

      if (bienBanTL) {
        this.maBienBan = bienBanTL.maBienBan;
        this.themMoiBienBan = bienBanTL;
      } else {
        this.maBienBan = this.generateMaBienBan('TL', maKho);
        this.themMoiBienBan = {
          id: null,
          maBienBan: this.maBienBan,
          loaiBienBan: this.loaiBienBan,
          soLanIn: 0,
          donBaoHanh: this.donBaoHanh,
          maKho: maKho,
        };
      }

      this.yearTN = this.donBaoHanh.ngayTiepNhan.substr(2, 2);
      this.monthTN = this.donBaoHanh.ngayTiepNhan.substr(5, 2);
      this.dateTN = this.donBaoHanh.ngayTiepNhan.substr(8, 2);

      this.popupInBBTL = true;
      this.isLoading = false;
    });
  }
  getMaKhoFromTenKho(tenKho: string): string {
    const mapping: { [key: string]: string } = {
      Kho1: '01',
      Kho2: '02',
      Kho3: '03',
    };
    return mapping[tenKho] ?? '00';
  }

  generateMaBienBan(prefix: string, maKho: string): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${prefix}${maKho}${date}${month}${year}${hours}${minutes}${seconds}`;
  }

  //đóng popup biên bản tiếp nhận
  closePopupBBTN(): void {
    this.popupInBBTN = false;
    this.http.get<any[]>(this.sanPhamsUrl).subscribe(res => {
      this.danhSachSanPhams = res;
      this.showData(this.donBaoHanh.id);
    });
  }

  closePopupBBKN(): void {
    this.popupInBBKN = false;
    this.http.get<any[]>(this.sanPhamsUrl).subscribe(res => {
      this.danhSachSanPhams = res;
      this.showData(this.donBaoHanh.id);
    });
  }

  closePopupBBTL(): void {
    this.popupInBBTL = false;
  }

  xacNhanInBienBan(): void {
    this.themMoiBienBan.soLanIn++;
    this.donBaoHanh.trangThaiIn = 'Đã in';
    this.http.put<any>(`${this.updateDonBaoHanhUrl}`, this.donBaoHanh).subscribe(() => {
      console.log(this.donBaoHanh);
    });
    this.http.post<any>(this.postMaBienBanUrl, this.themMoiBienBan).subscribe(res => {
      console.log('thành công:', res);
      this.getDanhSachBienBan();
      // window.location.reload();
      this.popupInBBTL = false;
      this.popupInBBTN = false;
      this.popupInBBKN = false;
    });
  }
  getLois(): void {
    this.http.get<any>(this.loisUrl).subscribe(res => {
      this.lois = res;
      // console.log('loi', res);
    });
  }

  getSanPhams(): void {
    this.http.get<any>(this.sanPhamsUrl).subscribe(resSP => {
      this.danhSachSanPhams = resSP;
      // console.log('san pham', resSP);
    });
  }

  //==================================================== Popup chi tiết phân tích sản phẩm và khai báo lỗi ====================================================
  openPopupChiTietLoi(id: number, index: number): void {
    this.popupChiTietLoi = true;
    this.itemOfPhanLoaiChiTietSanPham = this.listOfChiTietSanPhamPhanTich[index].phanLoaiChiTietTiepNhan;
    this.indexOfChiTietPhanTichSanPham = 0;
    this.listOfPhanTichSanPhamByPLCTTN = [];
    this.indexOfPhanTichSanPham = index;
    // lấy danh sách chi tiết sản phẩm phân tích
    // console.log('chi tiet phan tich san pham', this.listOfChiTietSanPhamPhanTich);
    this.getPhanTichSanPhamByPLCTTN(id);
    setTimeout(() => {
      this.getColor(this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo, 'chiTietDonBaoHanh');
      if (this.listOfPhanTichSanPhamByPLCTTN.length === 0) {
        this.addItemForChiTietPhanTichSanPham();
        // them moi phan tu dau tien
        // console.log('them moi danh sach khai bao loi theo san pham');
      } else {
        this.donBaoHanh.slDaPhanTich -= this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slDaPhanTich;
        this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slDaPhanTich = 0;
        //cập nhật tổng lỗi kĩ thuật và lỗi linh động
        for (let i = 0; i < this.listOfPhanTichSanPhamByPLCTTN.length; i++) {
          this.http.get<any>(`api/phan-tich-loi/${this.listOfPhanTichSanPhamByPLCTTN[i].id as number}`).subscribe((res: any[]) => {
            setTimeout(() => {
              this.listOfPhanTichSanPhamByPLCTTN[i].loiKyThuat = 0;
              this.listOfPhanTichSanPhamByPLCTTN[i].loiLinhDong = 0;
              this.listOfPhanTichSanPhamByPLCTTN[i].soLuong = 0;
              for (let j = 0; j < res.length; j++) {
                if (res[j].loi.chiChu === 'Lỗi linh động') {
                  this.listOfPhanTichSanPhamByPLCTTN[i].loiLinhDong += res[j].soLuong;
                }
                if (res[j].loi.chiChu === 'Lỗi kỹ thuật') {
                  this.listOfPhanTichSanPhamByPLCTTN[i].loiKyThuat += res[j].soLuong;
                }
                this.listOfPhanTichSanPhamByPLCTTN[i].soLuong =
                  Number(this.listOfPhanTichSanPhamByPLCTTN[i].loiKyThuat) + Number(this.listOfPhanTichSanPhamByPLCTTN[i].loiLinhDong);
              }
            }, 200);
            // console.log(res);
          });
          if (this.listOfPhanTichSanPhamByPLCTTN[i].trangThai === 'true') {
            this.listOfPhanTichSanPhamByPLCTTN[i].trangThai = true;
            this.listOfPhanTichSanPhamByPLCTTN[i].tenSanPham = this.listOfChiTietSanPhamPhanTich[index].tenSanPham;
            //tiến đến sp tiếp theo
            this.indexOfChiTietPhanTichSanPham = i;
            // cập nhật tiến độ của phân tích sản phẩm
            this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slDaPhanTich += 1;
            this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slConLai =
              this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slTiepNhan -
              this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slDaPhanTich;
            this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo =
              (this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slDaPhanTich /
                this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slTiepNhan) *
              100;
            this.getColor(this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo, this.indexOfPhanTichSanPham);

            // cập nhật tiến độ chung của đơn bảo hành
            this.donBaoHanh.slDaPhanTich! += 1;
            this.donBaoHanh.tienDo = (this.donBaoHanh.slDaPhanTich / this.donBaoHanh.slCanPhanTich) * 100;
            this.getColor(this.donBaoHanh.tienDo, 'donBaoHanh');

            // console.log('Cập nhật tiến độ khi khai báo lỗi', this.indexOfChiTietPhanTichSanPham);
          }
          this.listOfPhanTichSanPhamByPLCTTN[i].loiKyThuat = 0;
          this.listOfPhanTichSanPhamByPLCTTN[i].loiLinhDong = 0;
        }
        this.addItemForChiTietPhanTichSanPham();
        this.indexOfChiTietPhanTichSanPham++;
        // cập nhật số lượng sản phẩm đã phân tích, số lượng còn lại, tiến độ phân tích(chưa làm)
      }
    }, 500);
  }
  //focus con trỏ chuột vào ô input Lot
  buttonScanLot(): void {
    this.scanSerial = !this.scanSerial;
    this.scanType = 'lot';
    const input = document.getElementById(this.scanType);
    if (input) {
      input.focus();
    }
  }
  //focus con trỏ chuột vào ô input Serial
  buttonScanSerial(): void {
    this.scanLot = !this.scanLot;
    this.scanType = 'serial';
    const input = document.getElementById(this.scanType);
    if (input) {
      input.focus();
    }
  }
  // Bắt sự kiện scan LOT
  scanLotEvent(): void {
    this.saveTheLoai = this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].theLoaiPhanTich = 'Lot';
    this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].lotNumber = this.saveLOT;
    this.saveSanPham = this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].tenSanPham =
      this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tenSanPham;
    this.saveYear = this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].namSanXuat = `20${this.saveLOT.substr(0, 2)}`;
  }
  //Bắt sự kiện scan serial
  scanSerialEvent(): void {
    this.saveTheLoai = this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].theLoaiPhanTich = 'Serial';
    this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].detail = this.saveSerial;
    this.saveLOT = this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].lotNumber = this.saveSerial.substr(0, 13);
    this.saveSanPham = this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].tenSanPham =
      this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tenSanPham;
    this.saveYear = this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].namSanXuat = `20${this.saveLOT.substr(0, 2)}`;
  }
  //Cập nhật thông tin sau khi khai báo lỗi
  updatePhanTichSanPham(): void {
    this.listOfKhaiBaoLoi = [];
    if (this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo === 100) {
      this.getColor(this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo, 'chiTietDonBaoHanh');
      this.getColor(this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo, this.indexOfPhanTichSanPham);
      this.openPopupNoti('Đã hoàn thành phân tích');
      // cập nhật check sản phẩm phân tích
      this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].check = true;
      // xóa tên SP đã cập nhật
      this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].tenSanPham = '';
    } else if (
      this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo >= 0 &&
      this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo < 100
    ) {
      const input = document.getElementById(this.scanType);
      if (input) {
        input.focus();
      }
      if (
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].lotNumber === '' ||
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].soLuong === 0 ||
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].lotNumber === undefined ||
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].soLuong === 0
      ) {
        let check = false;
        if (
          (this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].soLuong === 0 &&
            this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].lotNumber !== '') ||
          (this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].soLuong === 0 &&
            this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].lotNumber !== undefined)
        ) {
          this.openPopupNoti('Vui lòng khai báo lỗi');
          check = true;
        }
        if (check === false) {
          this.openPopupNoti('Vui lòng khai báo lỗi và cập nhật mã LOT');
          if (input) {
            input.focus();
          }
        }
      } else {
        //Gán vào danh sách update khai báo lỗi
        this.listOfKhaiBaoLoi = this.catchChangeOfListKhaiBaoLoi.filter((item: any) => item.soLuong > 0);
        // console.log('check khai bao loi: ', this.listOfKhaiBaoLoi);
        //cập nhật trạng thái sản phẩm khai báo lỗi
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].trangThai = true;
        //chuyển đến phân tích sản phẩm tiếp theo
        this.indexOfChiTietPhanTichSanPham++;
        //thêm 1 phần tử mới
        this.addItemForChiTietPhanTichSanPham();
        // cập nhật tiến độ của phân tích sản phẩm
        this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slDaPhanTich += 1;
        this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slConLai =
          this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slTiepNhan -
          this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slDaPhanTich;
        this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo =
          (this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slDaPhanTich /
            this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].slTiepNhan) *
          100;
        this.getColor(this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo, this.indexOfPhanTichSanPham);
        this.getColor(this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo, 'chiTietDonBaoHanh');
        if (this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo === 100) {
          this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].check = true;
          // this.getColor(this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tienDo,this.indexOfPhanTichSanPham);
        }
        const data = [this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham - 1]];
        this.http.post<any>('api/phan-tich-san-pham', data).subscribe(res => {
          this.listOfKhaiBaoLoi[0].phanTichSanPham.id = res[0].id;
          console.log('popup', res);
          console.log('khai bao loi', this.listOfKhaiBaoLoi);
          setTimeout(() => {
            this.postChiTietPhanTichSanPham();
          }, 200);
        });
        // cập nhật tiến độ chung của đơn bảo hành
        this.donBaoHanh.slDaPhanTich! += 1;
        this.donBaoHanh.tienDo = (this.donBaoHanh.slDaPhanTich / this.donBaoHanh.slCanPhanTich) * 100;
        this.getColor(this.donBaoHanh.tienDo, 'donBaoHanh');
        setTimeout(() => {
          if (this.donBaoHanh.tienDo === 100) {
            this.donBaoHanh.trangThai = 'Hoàn thành phân tích';
          }
        }, 100);
        // console.log('danh sach update khai bao loi: ', this.listOfKhaiBaoLoi);
        // console.log('check thông tin phân tích sản phẩm: ', this.listOfPhanTichSanPhamByPLCTTN);
        // console.log('Check thông tin danh sách update khai báo lỗi: ', this.listOfKhaiBaoLoi);
        // console.log('index after: ', this.indexOfChiTietPhanTichSanPham);
      }
    }
  }
  //Lưu thông tin chi tiết phân tích sản phẩm và khai báo lỗi
  postChiTietPhanTichSanPham(): void {
    // lưu trong localStorage
    for (let i = 0; i < this.donBaoHanhs.length; i++) {
      if (this.donBaoHanh.id === this.donBaoHanhs[i].id) {
        this.donBaoHanhs[i].tienDo = this.donBaoHanh.tienDo;
      }
    }
    // Lọc danh sách
    // this.listOfPhanTichSanPhamByPLCTTN = this.listOfPhanTichSanPhamByPLCTTN.filter(item => item.tenSanPham !== '');
    // console.log(this.listOfPhanTichSanPhamByPLCTTN);
    if (this.donBaoHanh.tienDo > 0) {
      // console.log('Đang phân tích');
      this.donBaoHanh.trangThai = 'Đang phân tích';
      this.http.put<any>(this.updateTrangThaiDonBaoHanhUrl, this.donBaoHanh).subscribe();
    }
    if (this.donBaoHanh.tienDo === 100) {
      // console.log('Hoàn thành phân tích');
      this.donBaoHanh.trangThai = 'Hoàn thành phân tích';
      this.http.put<any>(this.updateTrangThaiDonBaoHanhUrl, this.donBaoHanh).subscribe();
    }
    // console.log('Kết quả cập nhật chi tiết phân tích sản phẩm: ', this.listOfPhanTichSanPhamByPLCTTN);
    setTimeout(() => {
      // console.log('list khai báo lỗi: ', this.listOfKhaiBaoLoi);
      this.http.post<any>('api/phan-tich-loi', this.listOfKhaiBaoLoi).subscribe(() => {
        this.listOfKhaiBaoLoi = [];
        this.openPopupNoti('Cập nhật thành công');
        this.closePopup();
        // console.log('khai bao loi', this.listOfKhaiBaoLoi)
        // console.log('popup', this.openPopupNoti)
      });
    }, 200);
    // console.log('danh sach update khai bao loi: ', this.listOfKhaiBaoLoi);
    // cập nhật phân tích lỗi
    // cập nhật số lượng đã phân tích ở đơn bảo hành
  }
  timKiemPhanTichSanPham(): void {
    this.listOfChiTietSanPhamPhanTich = this.listOfChiTietSanPhamPhanTichGoc.filter(
      item => item.tenSanPham.includes(this.tenSanPham) && item.tinhTrang.includes(this.tinhTrang)
    );
    // console.log({ result: this.listOfChiTietSanPhamPhanTich, SP: this.tenSanPham, tt: this.tinhTrang });
  }
  addItemForChiTietPhanTichSanPham(): void {
    this.catchChangeOfListKhaiBaoLoi = [];
    const item = {
      soThuTu: this.indexOfChiTietPhanTichSanPham + 1,
      tenSanPham: this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tenSanPham,
      tenNhanVienPhanTich: `${this.account?.firstName as string} ${this.account?.lastName as string}`,
      theLoaiPhanTich: this.saveTheLoai,
      lotNumber: this.saveLOT,
      detail: this.saveSerial,
      soLuong: 0,
      ngayKiemTra: new Date(),
      username: this.account?.login,
      namSanXuat: this.saveYear,
      trangThai: false,
      loiKyThuat: 0,
      loiLinhDong: 0,
      phanLoaiChiTietTiepNhan: this.itemOfPhanLoaiChiTietSanPham,
    };
    this.listOfPhanTichSanPhamByPLCTTN.push(item);
    // thêm mới khai báo lỗi cho từng sản phẩm
    for (let i = 0; i < this.lois!.length; i++) {
      const today = dayjs().startOf('second');
      const khaiBaoLoi = {
        soLuong: 0,
        ngayPhanTich: today,
        username: this.account?.login,
        ghiChu: this.lois![i].nhomLoi!.tenNhomLoi,
        loi: this.lois![i],
        phanTichSanPham: item,
        tenNhomLoi: this.lois![i].nhomLoi!.tenNhomLoi,
      };
      this.catchChangeOfListKhaiBaoLoi.push(khaiBaoLoi);
    }
    // console.log('danh sách khai báo lỗi: ', this.listOfPhanTichSanPhamByPLCTTN);
    // console.log('index before: ', this.indexOfChiTietPhanTichSanPham);
  }

  // hàm xử lý check all
  checkAll(): void {
    this.checkedAll = !this.checkedAll;
    // this.itemCheckedState = this.itemCheckedState.map(() => this.checkedAll)
    this.listOfChiTietSanPhamPhanTich.forEach(item => {
      item.check = this.checkedAll;
    });
    // console.log('checked all', this.checkedAll);
  }

  // hàm xử lý check từng thông tin sản phẩm
  checkItem(index: number): void {
    this.listOfChiTietSanPhamPhanTich[index].check = !this.listOfChiTietSanPhamPhanTich[index].check;
    // this.checkedAll = this.itemCheckedState.every(state => state)
    // console.log('check item', this.listOfChiTietSanPhamPhanTich[index]);
    this.checkedAll = this.listOfChiTietSanPhamPhanTich.every(item => item.check);
  }
  catchEventKhaiBaoLois(index: any): void {
    // console.log('kiểm tra mã LOT', this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham]);
    if (
      (this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].lotNumber === '' &&
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].detail === '') ||
      (this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].lotNumber === undefined &&
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].detail === undefined)
    ) {
      this.openPopupNoti('Chưa có thông tin LOT/SERIAL !!!');
      const input = document.getElementById(this.scanType);
      if (input) {
        input.focus();
      }
    } else {
      //reset kết quả
      this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiKyThuat = 0;
      this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiLinhDong = 0;
      //cập nhật số lượng lỗi linh động, lỗi kĩ thuật
      for (let i = 0; i < this.catchChangeOfListKhaiBaoLoi.length; i++) {
        if (this.catchChangeOfListKhaiBaoLoi[i].loi.chiChu === 'Lỗi kỹ thuật') {
          this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiKyThuat += this.catchChangeOfListKhaiBaoLoi[i].soLuong;
        }
        if (this.catchChangeOfListKhaiBaoLoi[i].loi.chiChu === 'Lỗi linh động') {
          this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiLinhDong += this.catchChangeOfListKhaiBaoLoi[i].soLuong;
        }
      }
      this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].soLuong =
        Number(this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiKyThuat) +
        Number(this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiLinhDong);
    }
  }
  // cập nhật số lượng lỗi trong button
  catchEventKhaiBaoLoi(index: any): void {
    // console.log('kiểm tra mã LOT', this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham]);
    if (
      (this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].lotNumber === '' &&
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].detail === '') ||
      (this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].lotNumber === undefined &&
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].detail === undefined)
    ) {
      this.openPopupNoti('Chưa có thông tin LOT/SERIAL !!!');
      const input = document.getElementById(this.scanType);
      if (input) {
        input.focus();
      }
    } else {
      this.catchChangeOfListKhaiBaoLoi[index].soLuong++;
      // console.log(index);
      //cập nhật số lượng lỗi linh động, lỗi kĩ thuật
      if (this.catchChangeOfListKhaiBaoLoi[index].loi.chiChu === 'Lỗi kỹ thuật') {
        // console.log({
        //   tenLoi: this.indexOfChiTietPhanTichSanPham,
        //   nLoi: this.catchChangeOfListKhaiBaoLoi[index].tenNhomLoi,
        //   sl: this.catchChangeOfListKhaiBaoLoi[index].soLuong,
        // });
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiKyThuat++;
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].soLuong =
          Number(this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiKyThuat) +
          Number(this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiLinhDong);
      }
      if (this.catchChangeOfListKhaiBaoLoi[index].loi.chiChu === 'Lỗi linh động') {
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiLinhDong++;
        this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].soLuong =
          Number(this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiKyThuat) +
          Number(this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham].loiLinhDong);
      }
      this.updatePhanTichSanPham();
    }
  }
  //Hàm cập nhật tiến độ sản phẩm phân tích
  updateTienDoSanPhamPhanTich(id: number, index: number): void {
    this.donBaoHanh.slDaPhanTich = 0;
    this.indexOfChiTietPhanTichSanPham = 0;
    this.listOfPhanTichSanPhamByPLCTTN = [];
    this.indexOfPhanTichSanPham = index;
    //reset tổng lỗi kĩ thuật và lỗi linh động
    this.listOfChiTietSanPhamPhanTich[index].loiKyThuat = 0;
    this.listOfChiTietSanPhamPhanTich[index].loiLinhDong = 0;
    //trường hợp số lượng tiếp nhận = 0
    if (this.listOfChiTietSanPhamPhanTich[index].slTiepNhan === 0) {
      // điều chỉnh tiến độ lên 100%
      this.listOfChiTietSanPhamPhanTich[index].tienDo = 100;
      this.listOfChiTietSanPhamPhanTich[index].check = true;
      this.getColor(this.listOfChiTietSanPhamPhanTich[index].tienDo, this.indexOfPhanTichSanPham);
      // cập nhật tiến độ chung của đơn bảo hành
      this.donBaoHanh.slDaPhanTich!++;
      this.donBaoHanh.tienDo = (this.donBaoHanh.slDaPhanTich / this.donBaoHanh.slCanPhanTich) * 100;
      this.getColor(this.donBaoHanh.tienDo, 'donBaoHanh');
    } else {
      // lấy danh sách chi tiết sản phẩm phân tích
      this.http.get<any>(`api/phan-tich-san-pham/${id}`).subscribe(res => {
        this.listOfPhanTichSanPhamByPLCTTN = res;
        // console.log('Độ dài danh sách: ', this.listOfPhanTichSanPhamByPLCTTN);
        // console.log({ PLCTTNID: id, PLCTTNINDEX: index });
        //cập nhật tổng lỗi kĩ thuật và lỗi linh động
        for (let i = 0; i < this.listOfPhanTichSanPhamByPLCTTN.length; i++) {
          // console.log({ checkIndexOfSanPhamPhanTich: this.listOfPhanTichSanPhamByPLCTTN[i] });
          if (this.listOfPhanTichSanPhamByPLCTTN[i].trangThai === 'true') {
            // cập nhật tiến độ của phân tích sản phẩm
            // console.log('Cập nhật tiến độ khi khai báo lỗi', this.listOfChiTietSanPhamPhanTich);
            this.listOfChiTietSanPhamPhanTich[index].slDaPhanTich += 1;
            this.listOfChiTietSanPhamPhanTich[index].slConLai =
              this.listOfChiTietSanPhamPhanTich[index].slTiepNhan - this.listOfChiTietSanPhamPhanTich[index].slDaPhanTich;
            this.listOfChiTietSanPhamPhanTich[index].tienDo =
              (this.listOfChiTietSanPhamPhanTich[index].slDaPhanTich / this.listOfChiTietSanPhamPhanTich[index].slTiepNhan) * 100;
            if (this.listOfChiTietSanPhamPhanTich[index].tienDo === 100) {
              this.getColor(this.listOfChiTietSanPhamPhanTich[index].tienDo, index);
              // cập nhật check sản phẩm phân tích
              this.listOfChiTietSanPhamPhanTich[index].check = true;
            }
            // cập nhật tiến độ chung của đơn bảo hành
            this.donBaoHanh.slDaPhanTich!++;
            this.donBaoHanh.tienDo = (this.donBaoHanh.slDaPhanTich / this.donBaoHanh.slCanPhanTich) * 100;
            this.getColor(this.donBaoHanh.tienDo, 'donBaoHanh');

            //cập nhật tổng lỗi linh động, lỗi kĩ thuật
            // for (let j = 0; j < this.listOfPhanTichSanPhamByPLCTTN[i].phanTichLois.length; j++) {
            //   // console.log({ checkIndex: this.listOfPhanTichSanPhamByPLCTTN[i].phanTichLois });
            //   if (this.listOfPhanTichSanPhamByPLCTTN[i].phanTichLois[j].ghiChu === 'Lỗi kỹ thuật') {
            //     // console.log('test');
            //     this.listOfChiTietSanPhamPhanTich[index].loiKyThuat =
            //       Number(this.listOfChiTietSanPhamPhanTich[index].loiKyThuat) +
            //       Number(this.listOfPhanTichSanPhamByPLCTTN[i].phanTichLois[j].soLuong);
            //   }
            //   if (this.listOfPhanTichSanPhamByPLCTTN[i].phanTichLois[j].ghiChu === 'Lỗi linh động') {
            //     this.listOfChiTietSanPhamPhanTich[index].loiLinhDong =
            //       Number(this.listOfChiTietSanPhamPhanTich[index].loiLinhDong) +
            //       Number(this.listOfPhanTichSanPhamByPLCTTN[i].phanTichLois[j].soLuong);
            //   }
            // }
          }
        }
        // cập nhật số lượng sản phẩm đã phân tích, số lượng còn lại, tiến độ phân tích(chưa làm)
      });
    }
  }

  chinhSuaKhaiBaoLoi(index: any): void {
    // console.log(this.listOfPhanTichSanPhamByPLCTTN[index].id);
    if (this.listOfPhanTichSanPhamByPLCTTN[index].id === undefined) {
      alert('Cần lưu thông tin khai báo trước khi chỉnh sửa');
    } else {
      this.fixKhaiBaoLoi = true;
      this.indexOfChiTietPhanTichSanPham = index;
      //cập nhật phần tử hiển thị từ api
      this.http.get<any>(`api/phan-tich-loi/${this.listOfPhanTichSanPhamByPLCTTN[index].id as number}`).subscribe(res => {
        // this.popupChiTietLoi = false;
        this.catchChangeOfListKhaiBaoLoi = res;
        //cập nhật index
      });
    }
  }

  deleteKhaiBaoLoi(index: any): void {
    const id: number = this.listOfPhanTichSanPhamByPLCTTN[index]?.id;
    console.log('id', id);
    if (id !== undefined) {
      this.http.delete(`api/phan-tich-loi/delete/${id}`).subscribe();
    } else {
      console.log('invalid id');
    }
  }

  saveKhaiBaoLoi(): void {
    //Gán vào danh sách update khai báo lỗi
    for (let i = 0; i < this.catchChangeOfListKhaiBaoLoi.length; i++) {
      this.listOfKhaiBaoLoi.push(this.catchChangeOfListKhaiBaoLoi[i]);
    }
    setTimeout(() => {
      this.http.post<any>('api/phan-tich-loi', this.listOfKhaiBaoLoi).subscribe(() => {
        this.openPopupNoti('Cập nhật thành công');
        //reset dữ liệu
        this.listOfKhaiBaoLoi = [];
        this.fixKhaiBaoLoi = false;
      });
      // lưu trong localStorage
      for (let i = 0; i < this.donBaoHanhs.length; i++) {
        if (this.donBaoHanh.id === this.donBaoHanhs[i].id) {
          this.donBaoHanhs[i].tienDo = this.donBaoHanh.tienDo;
        }
      }
      // window.localStorage.setItem('DonBaoHanhs', JSON.stringify(this.donBaoHanhs));
      this.fixKhaiBaoLoi = false;
    }, 200);
  }

  openPopupNoti(message: string): void {
    this.popupMessage = message;
    this.isPopupVisible = true;
    // console.log('popup thong bao', this.popupMessage);
    document.getElementById('popupNoti')!.style.display = 'block';
  }
  closePopupNoti(): void {
    this.isPopupVisible = false;
    // console.log('dong popup', this.isPopupVisible)
    document.getElementById('popupNoti')!.style.display = 'none';
  }
  angularGridReady(angularGrid: any): void {
    console.log('Grid đã sẵn sàng:', angularGrid);
    this.angularGrid = angularGrid;
    // the Angular Grid Instance exposes both Slick Grid & DataView objects
    this.gridObj = angularGrid.slickGrid;
    this.dataViewObj = angularGrid.dataView;
    const gridMenuInstance = angularGrid.extensionService?.getExtensionInstanceByName?.('gridMenu');
    console.log('GridMenu trong angularGridReady:', gridMenuInstance);
    // console.log('onGridMenuColumnsChanged11111', this.angularGrid);
  }
  getColor(value: number, index: any): void {
    if (value >= 0 && value < 40) {
      document.getElementById(index as string)!.style.accentColor = 'red';
      // console.log('red', value, index);
    } else if (value >= 40 && value < 70) {
      document.getElementById(index as string)!.style.accentColor = 'yellow';
      // console.log('yellow', value, index);
    } else if (value > 70) {
      document.getElementById(index as string)!.style.accentColor = 'green';
      // console.log('green', value, index);
    }
  }
  addRow(): void {
    this.isChanged = true;
    this.idAddRow++;
    const newRow = {
      id: this.idAddRow,
      tenSanPham: '',
      donVi: '',
      slKhachGiao: '',
      slTiepNhanTong: '',
      slTiepNhan: '',
      slDoiMoi: '',
      slSuaChua: '',
      slKhongBaoHanh: '',
    };
    this.resultChiTietSanPhamTiepNhans.push(newRow);
  }

  onSelectChanged(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedValue = selectElement.value;
  }

  openPopupInBBTnTest(): void {
    this.popupInBBTNtest = true;
  }

  closePopupInBBTnTest(): void {
    this.popupInBBTNtest = false;
  }
}
