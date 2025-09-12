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
import { PqcCheckDetailComponent } from '../detail/pqc-check-detail.component';
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
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IPhanTichSanPham } from '../phan-tich-san-pham.model';
import { PhanTichSanPhamService } from '../service/phan-tich-san-pham.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

import dayjs from 'dayjs/esm';
import { IKho } from 'app/entities/kho/kho.model';
import { KhoService } from 'app/entities/kho/service/kho.service';
import { faBarcode, faL, faPrint, faTrash, faInfoCircle, faEye } from '@fortawesome/free-solid-svg-icons';
import { NavbarComponent } from 'app/layouts/navbar/navbar.component';
import { ConstantPool } from '@angular/compiler';
import { forkJoin } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { GET_WORK_ORDER_BY_LOT } from '../service/phan-tich-san-pham-graphql.service';

type DonBaoHanh = {
  id: number;
  slDaPhanTich: number;
  slPhanTich: number;
  tienDo?: number;
  [key: string]: any;
};
interface LotSummary {
  lot: string;
  bomErrors: any[];
  testNVL: any[];
  scan100Pass: any[];
  returnDay: string;
  totalQty: number;
}
interface TestNVL {
  note?: string;
  itemName: string;
  sampleQuantity: number;
  regulationCheck: string;
  allowResult: number;
  realResult: number;
  paramMin: number;
  paramMax: number;
  checkDate: string;
  returnDay: string;
  unit: string;
  [key: string]: any;
}
interface Scan100PassItem {
  stt: number;
  tenSanPham: string;
  lotNumber: string;
  vendor: string;
  partNumber: string;
  sap: string;
  username: string;
  tenNhanVienPhanTich: string;
  ngayKiemTra: string;
  qr: string;
  material?: string;
  user_check?: string;
  reason?: string;
  createdAt?: string;
}

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
  isLoadingBB = false;
  listOfPhanTichSanPhamByPLCTTN: any[] = [];
  listOfKhaiBaoLoi: any[] = [];
  catchChangeOfListKhaiBaoLoi: any[] = [];
  danhSachBienBanSanPhamTheoKho: any[] = [];
  danhSachKho: IKho[] = [];
  //---------------------------------------------------------------set up khung hien thi loi-----------------------------------------
  columnOne: any[] = [];
  columnTwo: any[] = [];
  columnThree: any[] = [];
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
  lotValue = '';
  serialValue = '';
  listBomErrorDetails: any[] = [];
  listDrawTestNvls: any[] = [];
  listOfSanPhamTrongDialog: any[] = [];
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
  lotInput = '';
  scanLot = true;
  scanSerial = true;
  currentPageScan100 = 1;
  pageSizeScan100 = 20;
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
  selectedLotDetail?: LotSummary & {
    checkNVL: any[];
    testNVL: any[];
    scan100Pass: Scan100PassItem[];
    bomErrors: any[];
  };
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
  scanMode: 'lot' | 'serial' | null = null;
  saveSerial = '';
  saveLOT = '';
  saveYear = '';
  saveTheLoai = '';
  saveSanPham = '';
  lotStatus: 'empty' | 'invalid' | 'valid' = 'empty';
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
  selectedFontSize = '14px';
  printStyles: { [key: string]: { [key: string]: string } } = {
    '#BBTN': {
      'font-size': '14px !important',
    },
  };
  onPrintedCallback?: () => void;
  readonly danhSachLoiCanDung: string[] = [
    'Cầu chì',
    'Lỗi nguồn',
    'Hỏng Led',
    'Vasitor',
    'Chập mạch',
    'Nút vỡ nhựa, cover',
    'Cầu Diode Hy',
    'Bong mạch',
    'Móp, nứt vỡ đui',
    'Cầu Diode Silijino',
    'Công tắc',
    'Gãy cổ + Cơ khớp, tai cài',
    'Tụ hoá L.H',
    'Long keo',
    'Nước vào',
    'Tụ hoá Aishi',
    'Đôminô, rác cắm',
    'Điện áp cao',
    'Tụ fiml CCTC',
    'Dây nối Led',
    'Cháy nổ nguồn',
    'Tụ fiml hulysol',
    'Mất lò xo,tai cài',
    'Cũ, ẩm mốc, ố rỉ',
    'Transistor',
    'Dây DC',
    'Om nhiệt',
    'Điện trở',
    'Dây AC',
    'Vỡ ống, kính',
    'Chặn(Biến áp)',
    'Bong, nứt mối hàn',
    'Lỗi khác',
    'Cuộn lọc',
    'Pin, tiếp xúc lò xo',
    'Sáng bt',
    'Hỏng IC VCC',
  ];

  indexOfdanhSachLienBienBanTiepNhan = 0;
  phanTichSanPhams: any;
  isChanged = false;
  idAddRow = 0;
  selectedValue = '';
  faPrint = faPrint;
  faBarcode = faBarcode;
  faTrash = faTrash;
  faEye = faEye;
  faInfoCircle = faInfoCircle;
  @ViewChild('scanLotModal') scanLotModal?: TemplateRef<any>;
  @ViewChild('detailModal') detailModalTpl?: TemplateRef<any>;
  @ViewChild('lotInput') lotInputRef!: ElementRef;
  @ViewChild('serialInput') serialInputRef!: ElementRef;
  private isGridReady = false;
  private trustedTypesPolicy?: any;

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
    protected navBarComponent: NavbarComponent,
    private apollo: Apollo,
    private cdr: ChangeDetectorRef
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
        const tongCanPhanTich = this.donBaoHanhs[i].slCanPhanTich ?? this.donBaoHanhs[i].slPhanTich;
        this.donBaoHanhs[i].tienDo = tongCanPhanTich > 0 ? (this.donBaoHanhs[i].slDaPhanTich / tongCanPhanTich) * 100 : 0;
      }
      // console.log('bbbb', this.donBaoHanhs);
    });
  }

  ngOnInit(): void {
    // console.time('load-phan-tich');
    if (window.trustedTypes && !this.trustedTypesPolicy) {
      try {
        this.trustedTypesPolicy = window.trustedTypes.createPolicy('print-policy', {
          createHTML: (input: string) => input,
          createScript: (input: string) => input,
          createScriptURL: (input: string) => input,
        });
      } catch (e) {
        console.warn('Could not create trusted types policy:', e);
      }
    }
    this.loadData();

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
              this.updateTienDoSanPhamPhanTich(this.listOfChiTietSanPhamPhanTich[i].id);
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
              this.updateTienDoSanPhamPhanTich(this.listOfChiTietSanPhamPhanTich[i].id);
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
        cssClass: 'wrap-text-cell',
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
        minWidth: 350,
        width: 350,
        cssClass: 'wrap-text-cell',
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
        cssClass: 'wrap-text-cell',
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
        cssClass: 'wrap-text-cell',
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
        cssClass: 'wrap-text-cell',
        minWidth: 80,
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
        minWidth: 120,
        cssClass: 'wrap-text-cell',
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
        minWidth: 110,
        cssClass: 'wrap-text-cell',
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
        minWidth: 150,
        cssClass: 'wrap-text-cell',
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
      enableHeaderMenu: false,
      enableColumnPicker: false,
      enableGridMenu: true,
      rowHeight: 60,
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
        pageSize: 50,
        // pageSize: this.donBaoHanhs.length,
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
      forceFitColumns: false,
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
  getStyle(status: string): any {
    switch (status) {
      case 'Chờ phân tích':
        return { backgroundColor: '#f0ad4e', color: '#fff', fontSize: '14' };
      case 'Đang phân tích':
        return { backgroundColor: '#4da3bdff', color: '#fff', fontSize: '14' };
      case 'Hoàn thành phân tích':
        return { backgroundColor: '#49a849ff', color: '#fff', fontSize: '14' };
      default:
        return { backgroundColor: '#777', color: '#fff', fontSize: '14' };
    }
  }
  isTenLoiHienThi(tenLoi: string): boolean {
    return this.danhSachLoiCanDung.some(loi => loi.trim().toLowerCase() === tenLoi.trim().toLowerCase());
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
  showData(id: number | undefined): void {
    this.listOfChiTietSanPhamPhanTich = [];
    this.resultOfSanPhamTheoKho = [{ key: '', value: [] }];
    this.resultOfSanPhamTheoKhoTL = [{ key: '', value: [] }];
    this.donBaoHanh.slCanPhanTich = 0;

    if (typeof id !== 'number' || isNaN(id)) {
      return;
    }

    this.donBaoHanh.id = id;

    this.http.get<any>(`${this.chiTietSanPhamTiepNhanUrl}/${id}`).subscribe(res => {
      this.chiTietSanPhamTiepNhans = res;

      this.http.get<any>(this.danhSachTinhTrangUrl).subscribe(resTT => {
        this.danhSachTinhTrang = resTT;

        this.http.get<any[]>(`${this.phanLoaiChiTietTiepNhanUrl}/by-don-bao-hanh/${id}`).subscribe(resPL => {
          this.phanLoaiChiTietTiepNhans = resPL;

          // map phân loại theo chi tiết
          const plMap = new Map<number, any[]>();
          this.phanLoaiChiTietTiepNhans.forEach(pl => {
            const ctId = pl.chiTietSanPhamTiepNhan?.id;
            if (typeof ctId === 'number') {
              if (!plMap.has(ctId)) {
                plMap.set(ctId, []);
              }
              plMap.get(ctId)!.push(pl);
            }
          });

          // build list giữ nguyên order gốc theo chiTietSanPhamTiepNhans
          let count = 0;
          this.listOfChiTietSanPhamPhanTich = this.chiTietSanPhamTiepNhans.flatMap(ct => {
            const pls = plMap.get(ct.id ?? -1) ?? [];
            return pls
              .filter(pl => pl.danhSachTinhTrang?.id !== 3) // bỏ không BH
              .map(pl => {
                let tenKho = 'Không xác định';
                if (ct.sanPham?.id && this.danhSachSanPhams) {
                  const sp = this.danhSachSanPhams.find((s: any) => s.id === ct.sanPham?.id);
                  if (sp?.kho?.tenKho) {
                    tenKho = sp.kho.tenKho;
                  }
                }

                return {
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
                  tenKho,
                  loiKyThuat: 0,
                  loiLinhDong: 0,
                };
              });
          });

          // bỏ item slTiepNhan = 0
          this.listOfChiTietSanPhamPhanTich = this.listOfChiTietSanPhamPhanTich.filter(item => item.slTiepNhan > 0);
          // copy list gốc
          this.listOfChiTietSanPhamPhanTichGoc = [...this.listOfChiTietSanPhamPhanTich];

          // gom theo kho
          const khoMap = new Map<string, any[]>();
          this.listOfChiTietSanPhamPhanTich.forEach(item => {
            this.donBaoHanh.slCanPhanTich += item.slTiepNhan;
            const tenKho = item.tenKho ?? 'Không xác định';
            if (!khoMap.has(tenKho)) {
              khoMap.set(tenKho, []);
            }
            khoMap.get(tenKho)!.push(item);
          });

          this.resultOfSanPhamTheoKho = Array.from(khoMap.entries()).map(([key, value]) => ({ key, value }));
          this.resultOfSanPhamTheoKhoTL = [...this.resultOfSanPhamTheoKho];

          // bỏ kho trống hoặc không xác định
          this.resultOfSanPhamTheoKho = this.resultOfSanPhamTheoKho.filter(
            item => item.key && item.key.trim() !== '' && item.key !== 'Không xác định'
          );
          this.resultOfSanPhamTheoKhoTL = this.resultOfSanPhamTheoKhoTL.filter(
            item => item.key && item.key.trim() !== '' && item.key !== 'Không xác định'
          );

          this.updateDanhSachBienBanTheoKho();

          // gọi update tiến độ nhưng chỉ truyền id (ko truyền index nữa)
          const updatePromises = this.listOfChiTietSanPhamPhanTich.map(item => this.updateTienDoSanPhamPhanTich(item.id));

          Promise.all(updatePromises).then(() => {
            const newKhoMap = new Map<string, any[]>();
            this.listOfChiTietSanPhamPhanTich.forEach(item => {
              const tenKho = item.tenKho ?? 'Không xác định';
              if (!newKhoMap.has(tenKho)) {
                newKhoMap.set(tenKho, []);
              }
              newKhoMap.get(tenKho)!.push(item);
            });

            this.resultOfSanPhamTheoKho = Array.from(newKhoMap.entries()).map(([key, value]) => ({ key, value }));
            this.resultOfSanPhamTheoKhoTL = [...this.resultOfSanPhamTheoKho];

            this.resultOfSanPhamTheoKho = this.resultOfSanPhamTheoKho.filter(
              item => item.key && item.key.trim() !== '' && item.key !== 'Không xác định'
            );
            this.resultOfSanPhamTheoKhoTL = this.resultOfSanPhamTheoKhoTL.filter(
              item => item.key && item.key.trim() !== '' && item.key !== 'Không xác định'
            );
          });
        });
      });
    });
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
    document.body.classList.remove('popup-open');
  }

  // mở popup chọn loại biên bản
  openPopupBtn(): void {
    this.navBarComponent.toggleSidebar2();
    this.popupSelectButton = true;
    console.log('id dbh', this.donBaoHanh.id);
    if (this.donBaoHanh?.id) {
      this.http.get<any>(`api/danh-sach-bien-ban/${this.donBaoHanh.id as number}`).subscribe(res => {
        console.log('res', res);
        this.danhSachBienBan = res;
        this.bienBanTiepNhan = res.find((item: any) => item.loaiBienBan === 'Tiếp nhận');
        this.bienBanKiemNghiem = res.find((item: any) => item.loaiBienBan === 'Kiểm nghiệm');
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
    document.body.classList.add('popup-open');
    this.popupPTMTN = true;
    setTimeout(() => {
      // console.log('chi tiet san pham phan tich: ', this.listOfChiTietSanPhamPhanTich);
      //Loại bỏ sản phẩm có số lượng tiếp nhận = 0
      this.listOfChiTietSanPhamPhanTich = this.listOfChiTietSanPhamPhanTich.filter(item => item.slTiepNhan !== 0);
      for (let i = 0; i < this.listOfChiTietSanPhamPhanTich.length; i++) {
        this.updateTienDoSanPhamPhanTich(this.listOfChiTietSanPhamPhanTich[i].id);
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

    // if (cached) {
    //   this.resultChiTietSanPhamTiepNhans = JSON.parse(cached);
    //   this.sortResultChiTietSanPham();
    //   this.extractNgayTiepNhan();
    //   this.updateMaBienBan();
    //   return;
    // }

    forkJoin({
      chiTiet: this.http.get<any>(`${this.chiTietSanPhamTiepNhanUrl}/${this.idBBTN}`),
      tinhTrang: this.http.get<any>(this.danhSachTinhTrangUrl),
      phanLoai: this.http.get<any>(`${this.phanLoaiChiTietTiepNhanUrl}/by-don-bao-hanh/${this.idBBTN}`),
    }).subscribe(({ chiTiet, tinhTrang, phanLoai }) => {
      console.log('📥 Dữ liệu popup BBTN:', { chiTiet, tinhTrang, phanLoai });
      console.log('📦 chiTietSanPhamTiepNhans:', chiTiet);

      this.chiTietSanPhamTiepNhans = chiTiet;
      this.danhSachTinhTrang = tinhTrang;
      this.phanLoaiChiTietTiepNhans = phanLoai;

      // Lọc phân loại trùng theo chiTiet.id + tinhTrang.id + số lượng
      const filteredPhanLoai = this.phanLoaiChiTietTiepNhans.filter(
        (item, index, self) =>
          item.chiTietSanPhamTiepNhan?.id &&
          item.danhSachTinhTrang?.id &&
          item.soLuong !== undefined &&
          index ===
            self.findIndex(
              i =>
                i.chiTietSanPhamTiepNhan?.id === item.chiTietSanPhamTiepNhan?.id &&
                i.danhSachTinhTrang?.id === item.danhSachTinhTrang?.id &&
                i.soLuong === item.soLuong
            )
      );

      // Tạo map phân loại theo chiTiet.id
      const phanLoaiMap = new Map<number, IPhanLoaiChiTietTiepNhan[]>();
      for (const pl of filteredPhanLoai) {
        const id = pl.chiTietSanPhamTiepNhan?.id;
        if (typeof id === 'number') {
          if (!phanLoaiMap.has(id)) {
            phanLoaiMap.set(id, []);
          }
          phanLoaiMap.get(id)!.push(pl);
        }
      }

      // Loại bỏ bản ghi trùng hoàn toàn trong chiTietSanPhamTiepNhans
      const uniqueChiTietSanPham = this.chiTietSanPhamTiepNhans.filter(
        (item, index, self) =>
          item.id &&
          index ===
            self.findIndex(
              i =>
                i.id === item.id &&
                i.sanPham?.name === item.sanPham?.name &&
                i.soLuongKhachHang === item.soLuongKhachHang &&
                i.tinhTrangBaoHanh === item.tinhTrangBaoHanh
            )
      );

      // Xử lý dữ liệu hiển thị
      const list = uniqueChiTietSanPham.map(ct => {
        const id = ct.id;
        const phanLoais = typeof id === 'number' ? phanLoaiMap.get(id) ?? [] : [];

        let slDoiMoi = 0,
          slSuaChua = 0,
          slKhongBaoHanh = 0;

        for (const pl of phanLoais) {
          const sl = pl.soLuong ?? 0;
          const tinhTrangId = pl.danhSachTinhTrang?.id;
          if (tinhTrangId === 1) {
            slDoiMoi += sl;
          } else if (tinhTrangId === 2) {
            slSuaChua += sl;
          } else if (tinhTrangId === 3) {
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
    if (this.trangThaiInTN !== 'Đã in' || !this.bienBanTiepNhan) {
      this.openPopupNoti('Vui lòng in biên bản tiếp nhận trước');
      return;
    }
    this.groupOptionsKN = true;
    this.groupOptionsTL = false;
    this.groupOptionsTN = false;
    console.log('trangThaiInTN:', this.trangThaiInTN);
    console.log('bienBanTiepNhan:', this.bienBanTiepNhan);
    console.log('bienBanKiemNghiem:', this.bienBanKiemNghiem);
  }

  showGroupOptionsTL(): void {
    if (this.trangThaiInTN !== 'Đã in' || !this.bienBanTiepNhan || !this.bienBanKiemNghiem) {
      this.openPopupNoti('Vui lòng in biên bản tiếp nhận và kiểm nghiệm trước');
      return;
    }
    this.groupOptionsTL = true;
    this.groupOptionsKN = false;
    this.groupOptionsTN = false;
    console.log('trangThaiInTN:', this.trangThaiInTN);
    console.log('bienBanTiepNhan:', this.bienBanTiepNhan);
    console.log('bienBanKiemNghiem:', this.bienBanKiemNghiem);
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
    this.popupInBBKN = true;
    this.isLoadingBB = true;

    // Kiểm tra dữ liệu kho kiểm nghiệm
    const khoData = this.resultOfSanPhamTheoKho[index];
    if (!khoData) {
      this.openPopupNoti('Không tìm thấy dữ liệu kho kiểm nghiệm');
      this.isLoadingBB = false;
      return;
    }

    // Lấy mã kho từ tên kho
    const maKho = this.getMaKhoFromTenKho(tenKho);
    this.loaiBienBan = 'Kiểm nghiệm';

    const khoInfo = this.danhSachKho.find(k => k.tenKho === tenKho);
    this.maKho = khoInfo?.maKho ?? '';
    this.tenKho = khoInfo?.tenKho ?? '';

    const id = String(this.donBaoHanh.id);

    //  Gọi API trước, xử lý dữ liệu sau
    forkJoin({
      bienBanTiepNhan: this.http.get(`api/danh-sach-bien-ban/tiep-nhan/${id}`),
      danhSachBienBan: this.http.get<any[]>(`api/ma-bien-bans?loai=KN&idDonBaoHanh=${id}&maKho=${maKho}`),
    }).subscribe(({ bienBanTiepNhan, danhSachBienBan }) => {
      const bienBanTN = Array.isArray(bienBanTiepNhan)
        ? bienBanTiepNhan.find(b => b?.donBaoHanh?.id === this.donBaoHanh.id)
        : (bienBanTiepNhan as any)?.donBaoHanh?.id === this.donBaoHanh.id
        ? bienBanTiepNhan
        : null;

      if (!bienBanTN) {
        this.openPopupNoti('Vui lòng in biên bản tiếp nhận trước');
        this.isLoadingBB = false;
        return;
      }

      const bienBanKN = danhSachBienBan.find(
        b => b.loaiBienBan === this.loaiBienBan && b.donBaoHanh.id === this.donBaoHanh.id && b.maKho === maKho
      );

      this.maBienBan = bienBanKN?.maBienBan ?? this.generateMaBienBan('KN', maKho);
      this.themMoiBienBan = bienBanKN ?? {
        id: null,
        maBienBan: this.maBienBan,
        loaiBienBan: this.loaiBienBan,
        soLanIn: 0,
        donBaoHanh: this.donBaoHanh,
        maKho: maKho,
      };

      const d = this.donBaoHanh.ngayTiepNhan;
      this.yearTN = d.substr(2, 2);
      this.monthTN = d.substr(5, 2);
      this.dateTN = d.substr(8, 2);

      //  Xử lý lọc trùng sau khi API xong
      const rawList = khoData.value;
      for (const item of rawList) {
        const matched = this.listOfChiTietSanPhamPhanTich.find(i => i.id === item.id);
        if (matched) {
          item.loiKyThuat = matched.loiKyThuat;
          item.loiLinhDong = matched.loiLinhDong;
        }
      }
      // console.log('📦 Dữ liệu kiểm nghiệm:', rawList);

      this.danhSachBienBanSanPhamTheoKho = rawList.filter(
        (item, idx, self) =>
          item.sanPham?.name &&
          item.phanLoaiChiTietTiepNhan?.danhSachTinhTrang?.id &&
          idx ===
            self.findIndex(
              i =>
                i.sanPham?.name === item.sanPham?.name &&
                i.phanLoaiChiTietTiepNhan?.danhSachTinhTrang?.id === item.phanLoaiChiTietTiepNhan?.danhSachTinhTrang?.id
            )
      );

      //  Mở popup sau khi mọi thứ đã xong
      this.isLoadingBB = false;
    });
  }

  openPopupInBBTL(index: number, tenKho: string): void {
    this.isLoading = true;

    if (!this.resultOfSanPhamTheoKhoTL[index]) {
      this.openPopupNoti('Không tìm thấy dữ liệu kho thanh lý');
      this.isLoading = false;
      return;
    }

    const maKho = this.getMaKhoFromTenKho(tenKho);
    this.loaiBienBan = 'Thanh lý';

    const khoInfo = this.danhSachKho.find(k => k.tenKho === tenKho);
    this.maKho = khoInfo?.maKho ?? '';
    this.tenKho = khoInfo?.tenKho ?? '';

    const rawList = this.resultOfSanPhamTheoKhoTL[index].value;

    const uniqueList = rawList.filter(
      (item, idx, self) =>
        item.sanPham?.name &&
        item.phanLoaiChiTietTiepNhan?.danhSachTinhTrang?.id &&
        idx ===
          self.findIndex(
            i =>
              i.sanPham?.name === item.sanPham?.name &&
              i.phanLoaiChiTietTiepNhan?.danhSachTinhTrang?.id === item.phanLoaiChiTietTiepNhan?.danhSachTinhTrang?.id
          )
    );

    this.danhSachBienBanSanPhamTheoKho = uniqueList;

    const id = String(this.donBaoHanh.id);

    forkJoin({
      bienBanTiepNhan: this.http.get(`api/danh-sach-bien-ban/tiep-nhan/${id}`),
      bienBanKiemNghiem: this.http.get(`api/danh-sach-bien-ban/kiem-nghiem/${id}`),
      danhSachBienBan: this.http.get<any[]>(`api/ma-bien-bans?loai=TL&idDonBaoHanh=${id}&maKho=${maKho}`),
    }).subscribe(({ bienBanTiepNhan, bienBanKiemNghiem, danhSachBienBan }) => {
      let bienBanTN: any = null;
      if (Array.isArray(bienBanTiepNhan)) {
        bienBanTN = bienBanTiepNhan.find(b => b?.donBaoHanh?.id === this.donBaoHanh.id);
      } else if ((bienBanTiepNhan as any)?.donBaoHanh?.id === this.donBaoHanh.id) {
        bienBanTN = bienBanTiepNhan;
      }

      const danhSachBBKN = bienBanKiemNghiem as any[];
      this.bienBanKiemNghiem = danhSachBBKN.find(b => b?.maKho === maKho);

      this.danhSachBienBan = danhSachBienBan;

      if (!bienBanTN || !this.bienBanKiemNghiem) {
        this.openPopupNoti('Vui lòng in biên bản tiếp nhận và kiểm nghiệm trước');
        this.isLoading = false;
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

      const d = this.donBaoHanh.ngayTiepNhan;
      this.yearTN = d.substr(2, 2);
      this.monthTN = d.substr(5, 2);
      this.dateTN = d.substr(8, 2);

      this.popupInBBTL = true;
      this.isLoading = false;
    });
  }
  get dynamicValue(): string {
    return this.scanMode === 'lot' ? this.saveLOT : this.saveSerial;
  }

  set dynamicValue(val: string) {
    if (this.scanMode === 'lot') {
      this.saveLOT = val;
    } else {
      this.saveSerial = val;
    }
    this.onScan(this.scanMode!, val);
  }
  setScanMode(mode: 'lot' | 'serial'): void {
    this.scanMode = mode;

    setTimeout(() => {
      if (mode === 'lot') {
        this.lotInputRef?.nativeElement?.focus();
      } else {
        this.serialInputRef?.nativeElement?.focus();
      }
    }, 0);
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
    this.themMoiBienBan.createdAt = new Date().toISOString();
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
    this.saveLOT = '';
    this.saveSerial = '';
    this.saveYear = '';
    this.lotInput = '';
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
  openScanLotDialog(): void {
    this.lotInput = this.saveLOT?.trim();

    const modalRef = this.modalService.open(this.scanLotModal, {
      windowClass: 'modal-full-width',
      scrollable: true,
    });

    if (this.lotInput) {
      this.handleScanLot(modalRef);
    }
  }

  openDetail(lotSummary: { lot: string }): void {
    this.isLoading = true;

    this.apollo
      .query<any>({
        query: GET_WORK_ORDER_BY_LOT,
        variables: {
          lotNumber: String(lotSummary.lot),
        },
      })
      .subscribe({
        next: res => {
          this.isLoading = false;

          const info = res?.data?.qmsToDoiTraInfoByLotNumber;
          if (!info) {
            return;
          }

          const scan100Pass: any[] = Array.isArray(info.pqcScan100Pass) ? info.pqcScan100Pass : [];
          const testNVLRaw: TestNVL[] = Array.isArray(info.pqcCheckTestNVL) ? info.pqcCheckTestNVL : [];
          const checkNVL: any[] = Array.isArray(info.pqcCheckNVL) ? info.pqcCheckNVL : [];
          const bomErrors: any[] = Array.isArray(info.pqcBomErrorDetail) ? info.pqcBomErrorDetail : [];

          this.selectedLotDetail = {
            ...lotSummary,
            scan100Pass,
            testNVL: testNVLRaw,
            checkNVL,
            bomErrors,
            returnDay: '',
            totalQty: 0,
          };

          this.modalService.open(this.detailModalTpl, {
            windowClass: 'full-screen-modal',
            scrollable: true,
          });
        },
        error: err => {
          this.isLoading = false;
          console.error('Lỗi khi lấy dữ liệu LOT:', err);
        },
      });
  }

  handleScanLot(modal: any): void {
    this.isLoading = true;
    if (!this.lotInput || this.lotInput.trim().length === 0) {
      this.openPopupNoti('Vui lòng nhập mã LOT');
      this.isLoading = false;
      return;
    }

    this.onScanLotChange(this.lotInput.trim());
  }
  //focus con trỏ chuột vào ô input Lot
  onScan(type: 'lot' | 'serial', value: string): void {
    if (value.length >= 2) {
      this.saveYear = `20${value.substr(0, 2)}`;
    } else {
      this.saveYear = '';
    }

    const product = this.listOfPhanTichSanPhamByPLCTTN[this.indexOfChiTietPhanTichSanPham];
    if (!product) {
      console.warn('Không tìm thấy sản phẩm để gán dữ liệu');
      return;
    }

    product.namSanXuat = this.saveYear;

    if (type === 'lot') {
      product.lotNumber = value;
    } else {
      const lotFromSerial = value.substr(0, 13);
      this.saveLOT = lotFromSerial;
      product.detail = value;
      product.lotNumber = lotFromSerial;
    }
  }

  parseQR(qr: string): { vendor: string; sap: string; partNumber: string } {
    const parts = qr?.split('#') || [];
    // console.log('QR parts:', parts);

    return {
      partNumber: parts[1] || '',
      sap: parts.length > 14 ? parts[14] : '',
      vendor: parts.length > 2 ? parts[2] : '',
    };
  }
  get paginatedScan100(): Scan100PassItem[] {
    const start = (this.currentPageScan100 - 1) * this.pageSizeScan100;
    const scan100 = this.selectedLotDetail?.scan100Pass as Scan100PassItem[] | undefined;
    return scan100?.slice(start, start + this.pageSizeScan100) ?? [];
  }

  get totalPages(): number {
    const totalItems = this.selectedLotDetail?.scan100Pass?.length ?? 0;
    return Math.ceil(totalItems / this.pageSizeScan100);
  }

  onScanLotChange(lot: string): void {
    this.isLoading = true;
    this.lotStatus = 'empty';
    if (!lot || lot.trim().length === 0) {
      this.isLoading = false;
      this.lotStatus = 'empty';
      return;
    }

    if (lot === '2400000000000' || lot === '240000000000K') {
      this.isLoading = false;
      this.lotStatus = 'invalid';
      return;
    }
    if (!lot || lot.trim().length === 0) {
      return;
    }
    this.apollo
      .watchQuery({
        query: GET_WORK_ORDER_BY_LOT,
        variables: { lotNumber: lot },
      })
      .valueChanges.subscribe(
        (result: any) => {
          const data = result?.data?.qmsToDoiTraInfoByLotNumber;
          if (!data || (!data.pqcBomWorkOrder?.length && !data.pqcCheckTestNVL?.length && !data.pqcBomErrorDetail?.length)) {
            this.isLoading = false;
            this.lotStatus = 'invalid';
            return;
          }

          const testNVLs = data.pqcCheckTestNVL || [];
          const bomErrors = data.pqcBomErrorDetail || [];
          const bomWorkOrders = data.pqcBomWorkOrder || [];
          const bomQuantities = data.pqcBomQuantity || [];
          const checkNVLInfo = data.pqcCheckNVL?.[0] || {};
          const scan100Raw = data.pqcScan100Pass || [];

          // Bóc tách từng dòng scan100Pass
          const scan100Pass: Scan100PassItem[] = scan100Raw.map((item: any, index: number): Scan100PassItem => {
            const parts = item.qr?.split('#') || [];
            return {
              stt: index + 1,
              tenSanPham: item.material || '',
              lotNumber: lot,
              vendor: parts[2] || '',
              partNumber: parts[1] || '',
              sap: parts[parts.length - 1] || '',
              username: item.user_check || '',
              tenNhanVienPhanTich: item.reason || '',
              ngayKiemTra: item.createdAt,
              qr: item.qr,
              material: item.material,
              user_check: item.user_check,
              reason: item.reason,
              createdAt: item.createdAt,
            };
          });

          const qrRaw = scan100Pass?.[0]?.qr || '';
          const { sap, vendor, partNumber } = scan100Pass?.[0] || {};

          const bomData = bomWorkOrders.map((bom: any, index: number) => {
            const matchedQuantity = bomQuantities.find((q: any) => q.pqcBomWorkOrderId === bom.id);

            return {
              stt: index + 1,
              tenSanPham: bom.itemName,
              lotNumber: lot,
              sap: sap,
              vendor: bom.vendor,
              partNumber: bom.partNumber,
              detail: bom.itemCode,
              // namSanXuat: bom.createdAt?.slice(0, 4) || '',
              namSanXuat: this.saveYear,
              slThucNhap: Number(matchedQuantity?.quantity) || 0,
              ngayKiemTra: bom.createdAt,
              ghiChu: bom.uremarks || '',
              nhomLoi: '',
              tenLoi: '',
              soLuongLoi: Number(matchedQuantity?.totalError) || 0,
              ngayCapNhat: bom.updatedAt,
              trangThai: false,
              username: '',
              tenNhanVienPhanTich: '',
              loiKyThuat: '',
              loiLinhDong: '',
              type: 'bom',
              raw: bom,
            };
          });

          const testNVLData = testNVLs.map((item: any, index: number) => ({
            stt: index + 1 + Number(bomData.length),
            tenSanPham: item.itemName,
            lotNumber: lot,
            sap: sap,
            vendor: vendor,
            partNumber: item.partNumber || '',
            detail: item.itemCode,
            namSanXuat: checkNVLInfo.createdAt?.slice(0, 4) || '',
            slThucNhap: Number(item.qty) || 0,
            ngayKiemTra: item.checkDate,
            ghiChu: item.note,
            nhomLoi: '',
            tenLoi: '',
            soLuongLoi: '',
            ngayCapNhat: checkNVLInfo.createdAt,
            trangThai: false,
            username: checkNVLInfo.CheckPerson || '',
            tenNhanVienPhanTich: checkNVLInfo.note || '',
            loiKyThuat: '',
            loiLinhDong: '',
            type: 'testNVL',
            raw: item,
          }));

          const bomErrorData = bomErrors.map((item: any, index: number) => ({
            stt: index + 1 + Number(bomData.length) + Number(testNVLData.length),
            tenSanPham: '',
            lotNumber: '',
            sap: '',
            vendor: '',
            partNumber: '',
            detail: '',
            namSanXuat: '',
            slThucNhap: '',
            ngayKiemTra: '',
            ghiChu: item.note,
            nhomLoi: item.errorCode,
            tenLoi: item.errorName,
            soLuongLoi: Number(item.quantity) || 0,
            ngayCapNhat: item.updatedAt,
            trangThai: false,
            username: '',
            tenNhanVienPhanTich: '',
            loiKyThuat: '',
            loiLinhDong: '',
            type: 'bomError',
            raw: item,
          }));

          this.listOfSanPhamTrongDialog = [...bomData, ...testNVLData, ...bomErrorData];

          this.selectedLotDetail = {
            lot: lot,
            bomErrors,
            checkNVL: data.pqcCheckNVL || [],
            scan100Pass,
            testNVL: testNVLs,
            returnDay: '',
            totalQty: 0,
          };

          this.isLoading = false;
          this.lotStatus = 'valid';
        },
        error => {
          this.isLoading = false;
          this.lotStatus = 'invalid';
        }
      );
  }

  openChiTiet(data: any): void {
    if (data.type === 'testNVL') {
      const modalRef = this.modalService.open(PqcCheckDetailComponent, { size: 'lg' });
      modalRef.componentInstance.data = data.raw;
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
  activateScan(type: 'lot' | 'serial'): void {
    this.scanType = type;
    if (type === 'lot') {
      this.scanLot = true;
      this.scanSerial = false;
    } else {
      this.scanSerial = true;
      this.scanLot = false;
    }

    const input = document.getElementById(type);
    if (input) {
      input.focus();
    }
  }

  // Bắt sự kiện scan LOT
  scanLotEvent(): void {
    const idx = this.indexOfChiTietPhanTichSanPham;
    const lot = this.saveLOT?.trim() || '';
    this.saveTheLoai = this.listOfPhanTichSanPhamByPLCTTN[idx].theLoaiPhanTich = 'Lot';
    this.listOfPhanTichSanPhamByPLCTTN[idx].lotNumber = lot;
    // gán lại tên sản phẩm
    this.listOfPhanTichSanPhamByPLCTTN[idx].tenSanPham = this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tenSanPham;
    // Năm sản xuất lấy 2 ký tự đầu của lot
    this.listOfPhanTichSanPhamByPLCTTN[idx].namSanXuat = lot.length >= 2 ? `20${lot.substr(0, 2)}` : '';
  }
  //Bắt sự kiện scan serial
  scanSerialEvent(): void {
    const idx = this.indexOfChiTietPhanTichSanPham;
    const serial = this.saveSerial?.trim() || '';
    this.saveTheLoai = this.listOfPhanTichSanPhamByPLCTTN[idx].theLoaiPhanTich = 'Serial';
    // detail = serial, lotNumber = prefix của serial
    this.listOfPhanTichSanPhamByPLCTTN[idx].detail = serial;
    const lot = serial.substr(0, 13);
    this.listOfPhanTichSanPhamByPLCTTN[idx].lotNumber = lot;
    // gán lại tên sản phẩm
    this.listOfPhanTichSanPhamByPLCTTN[idx].tenSanPham = this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham].tenSanPham;
    // Năm sản xuất
    this.listOfPhanTichSanPhamByPLCTTN[idx].namSanXuat = lot.length >= 2 ? `20${lot.substr(0, 2)}` : '';
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
        // this.openPopupNoti('Cập nhật thành công');
        // this.closePopup();
        // console.log('khai bao loi', this.listOfKhaiBaoLoi)
        // console.log('popup', this.openPopupNoti)
      });
    }, 200);
    // console.log('danh sach update khai bao loi: ', this.listOfKhaiBaoLoi);
    // cập nhật phân tích lỗi
    // cập nhật số lượng đã phân tích ở đơn bảo hành
  }
  timKiemPhanTichSanPham(): void {
    setTimeout(() => {
      const ten = (this.tenSanPham ?? '').trim().toLowerCase();
      const tinhTrang = (this.tinhTrang ?? '').trim().toLowerCase();

      this.listOfChiTietSanPhamPhanTich = this.listOfChiTietSanPhamPhanTichGoc.filter(item => {
        const tenSP = (item.tenSanPham ?? '').toLowerCase();
        const ttSP = (item.tinhTrang ?? '').toLowerCase();

        const matchTen = tenSP.includes(ten);
        const matchTinhTrang = !tinhTrang || ttSP.includes(tinhTrang);

        return matchTen && matchTinhTrang;
      });

      // console.log('🔍 Giá trị tìm:', this.tenSanPham, this.tinhTrang);
      // console.log('📦 Dữ liệu sau lọc:', this.listOfChiTietSanPhamPhanTich);
    }, 0);
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
  recalculateErrorSummary(product: { loiKyThuat: number; loiLinhDong: number; soLuong: number }): void {
    const loiKyThuatList = this.catchChangeOfListKhaiBaoLoi
      .filter(e => e.loi?.chiChu === 'Lỗi kỹ thuật')
      .map(e => Math.max(Number(e.soLuong), 0));

    const loiLinhDongList = this.catchChangeOfListKhaiBaoLoi
      .filter(e => e.loi?.chiChu === 'Lỗi linh động')
      .map(e => Math.max(Number(e.soLuong), 0));

    const totalKyThuat = loiKyThuatList.reduce((a: number, b: number) => a + b, 0);
    const totalLinhDong = loiLinhDongList.reduce((a: number, b: number) => a + b, 0);

    product.loiKyThuat = totalKyThuat;
    product.loiLinhDong = totalLinhDong;
    product.soLuong = totalKyThuat + totalLinhDong;
  }
  // catchEventKhaiBaoLoi(index: number): void {
  //   // console.log('Clicked', index);
  //   // 1. Lấy product đang thao tác từ listOfPhanTichSanPhamByPLCTTN
  //   const prodIdx = this.indexOfChiTietPhanTichSanPham;
  //   const product = this.listOfPhanTichSanPhamByPLCTTN[prodIdx];
  //   if (typeof product.detail !== 'object') {
  //     product.detail = {};
  //   }

  //   if (!product?.lotNumber) {
  //     // this.openPopupNoti('Chưa có thông tin LOT !!!');
  //     document.getElementById(this.scanType)?.focus();
  //     return;
  //   }

  //   // 2. Tăng số lượng lỗi trong mảng lỗi popup
  //   const errItem = this.catchChangeOfListKhaiBaoLoi[index];
  //   const current = Number(errItem.soLuong) || 0;
  //   errItem.soLuong = Math.max(current + 1, 0);

  //   // 3. Tính lại 3 cột lỗi trên product
  //   this.recalculateErrorSummary(product);

  //   // 4. Cập nhật tiến độ cá nhân
  //   const detail = this.listOfChiTietSanPhamPhanTich[this.indexOfPhanTichSanPham];
  //   detail.slDaPhanTich = (Number(detail.slDaPhanTich) || 0) + 1;
  //   detail.slConLai = (Number(detail.slTiepNhan) || 0) - detail.slDaPhanTich;
  //   detail.tienDo = detail.slTiepNhan ? (detail.slDaPhanTich / detail.slTiepNhan) * 100 : 100;

  //   // 5. Cập nhật tiến độ chung đơn bảo hành
  //   this.donBaoHanh.slDaPhanTich = (Number(this.donBaoHanh.slDaPhanTich) || 0) + 1;
  //   this.donBaoHanh.tienDo = this.donBaoHanh.slCanPhanTich ? (this.donBaoHanh.slDaPhanTich / this.donBaoHanh.slCanPhanTich) * 100 : 100;
  //   console.log(errItem);
  //   // 6. Ép Angular update view nếu cần (OnPush)
  //   this.cdr.detectChanges();
  // }

  // 2. Phương thức chung để tính lại 3 cột trên bảng Chi tiết sản phẩm

  //Hàm cập nhật tiến độ sản phẩm phân tích
  updateTienDoSanPhamPhanTich(id: number): Promise<void> {
    return new Promise(resolve => {
      // Tìm item theo id thay vì index
      const item = this.listOfChiTietSanPhamPhanTich.find(i => i.id === id);
      if (!item) {
        resolve();
        return;
      }

      item.loiKyThuat = 0;
      item.loiLinhDong = 0;

      if (item.slTiepNhan === 0) {
        item.tienDo = 100;
        item.check = true;
        this.getColor(100, id); // truyền id hoặc 'donBaoHanh' nếu cần
        resolve();
        return;
      }

      this.http.get<any[]>(`api/phan-tich-san-pham/${id}`).subscribe(res => {
        this.listOfPhanTichSanPhamByPLCTTN = res;

        const slDaPhanTich = res.filter(pt => pt.trangThai === 'true').length;
        const slTiepNhan = item.slTiepNhan;
        const slConLai = Math.max(slTiepNhan - slDaPhanTich, 0);
        const tienDo = slTiepNhan > 0 ? (slDaPhanTich / slTiepNhan) * 100 : 0;

        item.slDaPhanTich = slDaPhanTich;
        item.slConLai = slConLai;
        item.tienDo = tienDo;

        if (tienDo === 100) {
          item.check = true;
          this.getColor(tienDo, id);
        }

        // Gọi từng API lỗi để tính tổng lỗi kỹ thuật và linh động
        const loiRequests = res.map(pt => this.http.get<any[]>(`api/phan-tich-loi/${Number(pt.id)}`).toPromise());

        Promise.all(loiRequests).then(allLois => {
          allLois.forEach(lois => {
            if (Array.isArray(lois)) {
              lois.forEach(loi => {
                const soLuong = Number(loi?.soLuong) || 0;
                const ghiChu = loi?.loi?.chiChu;
                if (ghiChu === 'Lỗi kỹ thuật') {
                  item.loiKyThuat += soLuong;
                }
                if (ghiChu === 'Lỗi linh động') {
                  item.loiLinhDong += soLuong;
                }
              });
            }
          });

          const tongDaPhanTich = this.listOfChiTietSanPhamPhanTich.reduce(
            (sum: number, i: { slDaPhanTich: number }) => sum + (Number(i.slDaPhanTich) || 0),
            0
          );

          this.donBaoHanh.slDaPhanTich = tongDaPhanTich;
          this.donBaoHanh.tienDo = this.donBaoHanh.slCanPhanTich > 0 ? (tongDaPhanTich / this.donBaoHanh.slCanPhanTich) * 100 : 0;

          this.getColor(this.donBaoHanh.tienDo, 'donBaoHanh');
          resolve();
        });
      });
    });
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

  deleteKhaiBaoLoi(index: number): void {
    const product = this.listOfPhanTichSanPhamByPLCTTN[index];
    const id = product.id;

    // Nếu đã lưu backend, gọi API xóa
    if (id !== undefined) {
      this.http
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .delete(`api/phan-tich-loi/delete/${id}`)
        .subscribe(() => {
          // sau khi xóa thành công, xóa khỏi UI
          this.listOfPhanTichSanPhamByPLCTTN.splice(index, 1);
          this.recalculateDonBaoHanh();
        });
    } else {
      // nếu chưa có id (chưa lưu lần nào), chỉ bỏ khỏi UI
      this.listOfPhanTichSanPhamByPLCTTN.splice(index, 1);
      this.recalculateDonBaoHanh();
    }
  }

  /**
   * Cập nhật lại tổng slDaPhanTich và tienDo của donBaoHanh sau khi xóa
   */
  recalculateDonBaoHanh(): void {
    // Tính tổng slDaPhanTich từ các product trong listOfPhanTichSanPhamByPLCTTN
    this.donBaoHanh.slDaPhanTich = this.listOfPhanTichSanPhamByPLCTTN.reduce(
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-return
      (sum, p) => sum + (p.soLuong || 0),
      0
    );
    this.donBaoHanh.tienDo = (this.donBaoHanh.slDaPhanTich / this.donBaoHanh.slCanPhanTich) * 100;
    this.getColor(this.donBaoHanh.tienDo, 'donBaoHanh');
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

  openPopupNoti(msg: string): void {
    this.popupMessage = msg;
    this.isPopupVisible = true;
    setTimeout(() => (this.isPopupVisible = false), 2000);
  }
  closePopupNoti(): void {
    this.isPopupVisible = false;
    // console.log('dong popup', this.isPopupVisible)
    // document.getElementById('popupNoti')!.style.display = 'none';
  }
  loadData(): void {
    this.http.get<DonBaoHanh[]>('api/phan-tich-san-pham').subscribe((res: DonBaoHanh[]) => {
      this.donBaoHanhs = res
        .sort((a, b) => b.id - a.id)
        .map(
          (item): DonBaoHanh => ({
            ...item,
            tienDo: item.slPhanTich ? Math.round((item.slDaPhanTich / item.slPhanTich) * 1000) / 10 : 0,
          })
        );
      if (!this.angularGrid?.dataView || !this.donBaoHanhs.length) {
        return;
      }

      this.angularGrid.dataView.beginUpdate();
      this.angularGrid.dataView.setItems(this.donBaoHanhs, 'id');

      this.angularGrid.dataView.setPagingOptions({ pageSize: 50, pageNum: 0 });
      this.angularGrid.dataView.endUpdate();

      this.angularGrid.slickGrid.invalidate();
      this.angularGrid.slickGrid.render();
    });
  }
  angularGridReady(angularGrid: any): void {
    this.angularGrid = (event as CustomEvent).detail;
    console.log('AngularGrid đã sẵn sàng:', this.angularGrid);
    console.log('onAngularGridCreated event:', event);
    this.isGridReady = true;
    // the Angular Grid Instance exposes both Slick Grid & DataView objects
    this.gridObj = angularGrid.slickGrid;
    // setInterval(()=>{
    this.dataViewObj = angularGrid.dataView;
  }
  getColor(value: number, index: any): void {
    const el = document.getElementById(index as string);
    if (!el) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.warn(`Không tìm thấy phần tử với id: ${index}`);
      return;
    }

    if (value >= 0 && value < 40) {
      el.style.backgroundColor = 'red';
    } else if (value >= 40 && value < 70) {
      el.style.backgroundColor = 'yellow';
    } else if (value >= 70) {
      el.style.backgroundColor = 'green';
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
  onFontSizeChange(): void {
    // Áp dụng font size ngay lập tức cho preview
    const bbtnElement = document.getElementById('BBTN');
    if (bbtnElement) {
      bbtnElement.style.fontSize = this.selectedFontSize;
    }
  }

  // Inject inline style với !important
  get printStyle(): Record<string, any> {
    const s = this.selectedFontSize;
    return {
      '#BBTN, #BBTN *': {
        'font-size': `${s} !important`,
        'font-family': 'Arial, sans-serif !important',
      },
    };
  }
  getUniqueCount(list: any[]): number {
    if (!Array.isArray(list)) {
      return 0;
    }

    const unique = list.filter(
      (item, idx, self) =>
        item.sanPham?.name &&
        item.phanLoaiChiTietTiepNhan?.danhSachTinhTrang?.id &&
        idx ===
          self.findIndex(
            i =>
              i.sanPham?.name === item.sanPham?.name &&
              i.phanLoaiChiTietTiepNhan?.danhSachTinhTrang?.id === item.phanLoaiChiTietTiepNhan?.danhSachTinhTrang?.id
          )
    );

    return unique.length;
  }
}
