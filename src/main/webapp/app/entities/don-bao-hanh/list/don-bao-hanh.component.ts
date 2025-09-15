import { IDanhSachTinhTrang } from 'app/entities/danh-sach-tinh-trang/danh-sach-tinh-trang.model';
import { IChiTietSanPhamTiepNhan } from 'app/entities/chi-tiet-san-pham-tiep-nhan/chi-tiet-san-pham-tiep-nhan.model';
import { ChiTietSanPhamTiepNhan } from './../../chi-tiet-san-pham-tiep-nhan/chi-tiet-san-pham-tiep-nhan.model';
import { IPhanLoaiChiTietTiepNhan } from './../../phan-loai-chi-tiet-tiep-nhan/phan-loai-chi-tiet-tiep-nhan.model';
import { ApplicationConfigService } from './../../../core/config/application-config.service';
import { ISanPham } from './../../san-pham/san-pham.model';
import { FormBuilder } from '@angular/forms';
import { IKhachHang } from './../../khach-hang/khach-hang.model';
import { KhachHangService } from './../../khach-hang/service/khach-hang.service';
import {
  Column,
  GridOption,
  ContainerService,
  Formatters,
  OnEventArgs,
  AngularGridInstance,
  FieldType,
  Filters,
  Editors,
  LongTextEditorOption,
  AngularUtilService,
  SlickCompositeEditor,
  Formatter,
  SlickEventData,
  ExtensionName,
} from './../../../../../../../node_modules/angular-slickgrid';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { IDonBaoHanh } from '../don-bao-hanh.model';
import { DonBaoHanhService } from '../service/don-bao-hanh.service';
import { RowDetailViewComponent } from './rowdetail-view.component';
import * as XLSX from 'xlsx';
import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { DanhSachTinhTrangService } from 'app/entities/danh-sach-tinh-trang/service/danh-sach-tinh-trang.service';
import { SanPhamService } from 'app/entities/san-pham/service/san-pham.service';
import dayjs from 'dayjs/esm';
import { NavbarComponent } from 'app/layouts/navbar/navbar.component';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';
interface IResultItem {
  id: number;
  tenSanPham?: string;
  donVi?: string;
  slKhachGiao?: number;
  slTiepNhanTong: number;
  slTiepNhan: number;
  slDoiMoi: number;
  slSuaChua: number;
  slKhongBaoHanh: number;
  chiTietSanPhamTiepNhan: any;
  tinhTrangBaoHanh: boolean;
}
@Component({
  selector: 'jhi-don-bao-hanh',
  templateUrl: './don-bao-hanh.component.html',
  styleUrls: ['./don-bao-hanh.component.scss'],
})
export class DonBaoHanhComponent implements OnInit {
  phanLoaiChiTietTiepNhanUrl = this.applicationConfigService.getEndpointFor('api/phan-loai-chi-tiet-tiep-nhans');
  chiTietSanPhamTiepNhanUrl = this.applicationConfigService.getEndpointFor('api/chi-tiet-don-bao-hanhs');
  danhSachTinhTrangUrl = this.applicationConfigService.getEndpointFor('api/danh-sach-tinh-trangs');
  updateDonBaoHanhUrl = this.applicationConfigService.getEndpointFor('api/update-don-bao-hanh');
  deleteDonBaoHanhUrl = this.applicationConfigService.getEndpointFor('api/don-bao-hanh/delete');
  updateDonBaoHanhPhanLoaiUrl = this.applicationConfigService.getEndpointFor('api/update-don-bao-hanh-phan-loai');
  postDonBaoHanhUrl = this.applicationConfigService.getEndpointFor('api/don-bao-hanh/them-moi');
  postDonBaoHanhNewUrl = this.applicationConfigService.getEndpointFor('api/don-bao-hanh/them-moi-new');
  postChiTietDonBaoHanhUrl = this.applicationConfigService.getEndpointFor('api/don-bao-hanh/them-moi-chi-tiet');
  postPhanLoaiChiTietTiepNhanUrl = this.applicationConfigService.getEndpointFor('api/don-bao-hanh/them-moi-phan-loai');
  putPhanLoaiChiTietTiepNhanUrl = this.applicationConfigService.getEndpointFor(
    'api/don-bao-hanh/phan-loai/update-phan-loai-chi-tiet-tiep-nhan'
  );
  putChiTietSanPhamTiepNhanUrl = this.applicationConfigService.getEndpointFor(
    'api/don-bao-hanh/phan-loai/update-chi-tiet-san-pham-tiep-nhan'
  );
  hoanThanhPhanLoaiUrl = this.applicationConfigService.getEndpointFor('api/don-bao-hanh/hoan-thanh-phan-loai');
  postMaBienBanUrl = this.applicationConfigService.getEndpointFor('api/ma-bien-ban/post');
  getMaxIdChiTietSanPhamTiepNhanUrl = this.applicationConfigService.getEndpointFor('api/chi-tiet-san-pham-tiep-nhan-max-id');
  deleteDetailDonBaoHanhUrl = this.applicationConfigService.getEndpointFor('api/phan-loai/delete');
  // biến lưu danh sách dữ liệu
  donBaoHanhs: any[] = [];
  khachHangs?: IKhachHang[];
  isLoading = false;
  danhSachTinhTrangs: IDanhSachTinhTrang[] = [];
  danhSachSanPham: ISanPham[] = [];
  danhSachGocPopupPhanLoai: any[] = [];
  danhSachBienBan: any[] = [];
  phanLoaiChiTietTiepNhans: IPhanLoaiChiTietTiepNhan[] = [];
  // biến lưu key session
  keySession = '';
  // biến lưu thông tin thêm mới
  themMoiDonBaoHanh: any;
  donBaoHanh: any;
  chiTietDonBaoHanh: IChiTietSanPhamTiepNhan[] = [];
  themMoiPhanLoaiChiTietTiepNhan: IPhanLoaiChiTietTiepNhan[] = [];
  themMoiBienBan: any;
  idAddRow = 0;
  //thông tin phân loại
  listOfDetailPl: any[] = [];
  //------------------------------------------------
  columnDefinitions?: IDonBaoHanh[];
  columnDefinitions1: Column[] = [];
  gridOptions1: GridOption = {};
  angularGrid?: AngularGridInstance;
  gridObj: any;
  dataViewObj: any;
  detailViewRowCount = 9;
  compositeEditorInstance!: SlickCompositeEditor;
  chiTietSanPhamTiepNhans: IChiTietSanPhamTiepNhan[] = [];
  resultChiTietSanPhamTiepNhans: any[] = [];
  title = 'Quản lý mã tiếp nhận';

  yearTN = 0;
  monthTN = 0;
  dateTN = 0;

  predicate!: string;
  ascending!: boolean;
  // biến lưu thông tin từng đơn bảo hành
  thongTinDonBaoHanh: any;
  danhSachTrangThai = [
    { label: 'Chờ xử lý', value: 'CHO_XU_LY' },
    { label: 'Đang xử lý', value: 'DANG_XU_LY' },
    { label: 'Hoàn thành', value: 'HOAN_THANH' },
  ];

  // biến đóng mở popup
  popupChinhSuaThongTin = false;
  popupPhanLoai = false;
  popupThemMoi = false;
  popupSelectButton = false;
  popupInBBTN = false;
  popupInBBTN1 = false;
  popupInBBTN2 = false;
  popupInBBTN3 = false;
  popupInBBTN4 = false;
  // lưu thông tin account
  account: Account | null = null;
  //Biến check sự thay đổi thông tin trong popup phân loại
  isChanged = false;
  //biến tìm kiếm
  @Input() searchKey = '';
  //Biến lưu thông tin Date
  year = '';
  month = '';
  date = '';
  hours = '';
  minutes = '';
  seconds = '';
  maBienBan = '';
  loaiBienBan = '';
  idDonBaoHanh = '';
  //lưu thông tin import
  ExcelData: any;
  //Lưu tiến độ phân loại
  tienDo = 0;
  countItem = 0;
  //lưu thông tin check All
  checkAll = false;
  //--------------------------------------------------------------------------
  id?: number | null | undefined;
  idMaTiepNhan?: number | null | undefined;
  tenSanPham?: string | null | undefined;
  soLuong?: number | null | undefined;
  doiMoi?: number | null | undefined;
  suaChua?: number | null | undefined;
  khongBaoHanh?: number | null | undefined;
  soLuongDaNhan?: number | null | undefined;
  idsToDelete: number[] = [];

  listOfMaTiepNhan: {
    id: number | null | undefined;
    idMaTiepNhan: number | null | undefined;
    tenSanPham: string | null | undefined;
    soLuong: number | null | undefined;
    doiMoi: number | null | undefined;
    suaChua: number | null | undefined;
    khongBaoHanh: number | null | undefined;
    soLuongDaNhan: number | null | undefined;
  }[] = [
    {
      id: this.idMaTiepNhan,
      idMaTiepNhan: this.idMaTiepNhan,
      tenSanPham: this.tenSanPham,
      soLuong: this.soLuong,
      doiMoi: this.doiMoi,
      suaChua: this.suaChua,
      khongBaoHanh: this.khongBaoHanh,
      soLuongDaNhan: this.soLuongDaNhan,
    },
  ];

  editForm = this.formBuilder.group({
    id: [],
  });
  //phan loai tiep nhan phan trang
  pagePLTN = 1;
  pageSizePLTN = 20;

  @Input() itemPerPage = 10;
  page?: number;

  // Biến đóng mở popup thông báo
  isPopupVisible = false;
  popupMessage = '';

  // Biến đóng mở popup xoá màn hình phân loại
  isModalOpenConfirm = false;
  deleteId: any;

  // Biến đóng mở popup xoá màn hình thêm mới
  isModalOpenConfirmAdd = false;
  deleteTenSanPham: any;

  isModalOpenConfirmDeletePhanLoai = false;

  savePhanLoai: any;
  selectedValue = 'Đỗ Văn Việt';

  popupInBBTNtest = false;
  loading = false;
  isAdmin = false;
  faPrint = faPrint;
  indexToDelete = -1;
  ngayTraBienBan = '';

  selectedFontSize = '14px';
  printStyles: { [key: string]: { [key: string]: string } } = {
    '#BBTN': {
      'font-size': '14px !important',
    },
  };
  onPrintedCallback?: () => void;
  nguoiNhan = '';
  selectedRowData: any;
  // logoPath = window.location.origin + '/content/images/logoRD.png';
  @ViewChild('nhapNguoiNhanTemplate', { static: true }) nhapNguoiNhanTemplate!: TemplateRef<any>;
  private isGridReady = false;
  private shouldReloadAfterPopup = false;
  private trustedTypesPolicy?: any;
  constructor(
    protected rowDetailViewComponent: RowDetailViewComponent,
    protected donBaoHanhService: DonBaoHanhService,
    protected khachHangService: KhachHangService,
    protected modalService: NgbModal,
    protected containerService: ContainerService,
    protected angularUtilService: AngularUtilService,
    protected formBuilder: FormBuilder,
    protected applicationConfigService: ApplicationConfigService,
    protected http: HttpClient,
    protected accountService: AccountService,
    protected danhSachTinhTrangService: DanhSachTinhTrangService,
    protected sanPhamService: SanPhamService, // protected dialog: MatDialog,
    protected navBarComponent: NavbarComponent,
    protected cdr: ChangeDetectorRef
  ) {}
  trackByResult(_idx: number, item: IResultItem): number {
    // console.log('[DEBUG] trackByResult idx, id=', _idx, item.id);
    return item.id;
  }
  buttonnguoiNhan: Formatter<any> = (_row, _cell, _value, _colDef, dataContext) => {
    const isEnabled = dataContext?.nguoiNhanEnabled;
    const disabledClass = isEnabled ? '' : 'btn-disabled-custom';
    const disabledAttr = isEnabled ? '' : 'disabled';

    return `<button class="btn btn-info fa fa-user-plus btn-nhap-nguoi-nhan ${disabledClass}" ${disabledAttr}
    style="height: 28px; line-height: 14px; min-width: 28px; padding: 0 10px"
    title="${isEnabled ? 'Nhập người nhận' : 'Chưa đủ tiến độ để nhập người nhận'}"> </button>`;
  };

  buttonBBTN: Formatter<any> = (_row, _cell, value) =>
    value
      ? `<button class="btn btn-success fa fa-print" style="height: 28px; line-height: 14px" title="In biên bản tiếp nhận"></button>`
      : { text: '<i class="fa fa-print" aria-hidden="true"></i>' };

  buttonPL: Formatter<any> = (_row, _cell, value) =>
    value
      ? `<button class="btn btn-primary fa fa-eye" style="height: 28px; line-height: 14px; width: 15px">PL</button>`
      : {
          text: '<button class="btn btn-primary fa fa-eye" style="height: 28px; line-height: 14px" title="Phân loại"></button>',
        };

  buttonEdit: Formatter<any> = (_row, _cell, value) =>
    value
      ? `<button class="btn btn-warning fa fa-pencil" style="height: 28px; line-height: 14px; width: 15px"></button>`
      : { text: '<button class="btn btn-warning fa fa-pencil" style="height: 28px; line-height: 14px" title="Chỉnh sửa"></button>' };

  buttonDelete: Formatter<any> = (_row, _cell, value) =>
    value
      ? `<button class="btn btn-danger fa fa-trash" style="height: 28px; line-height: 14px; width: 15px"></button>`
      : { text: '<button class="btn btn-danger fa fa-trash" style="height: 28px; line-height: 14px" title="Xoá"></button>' };

  loadAll(): void {
    this.navBarComponent.toggleSidebar2();
    this.isLoading = true;
    this.donBaoHanhService.query().subscribe({
      next: (res1: HttpResponse<IDonBaoHanh[]>) => {
        this.isLoading = false;
        this.donBaoHanhs = res1.body!.sort((a, b) => b.id! - a.id!) ?? [];
        //Cập nhật tiến độ phân loại
        for (let i = 0; i < this.donBaoHanhs.length; i++) {
          this.donBaoHanhs[i].tienDo = 0;
          this.http.get<any>(`${this.chiTietSanPhamTiepNhanUrl}/${this.donBaoHanhs[i].id as number}`).subscribe(res2 => {
            let count1 = 0;
            // console.log(this.donBaoHanhs[i].id);
            this.chiTietSanPhamTiepNhans = res2;
            for (let h = 0; h < this.chiTietSanPhamTiepNhans.length; h++) {
              if (
                this.chiTietSanPhamTiepNhans[h].tinhTrangBaoHanh === 'true' &&
                this.chiTietSanPhamTiepNhans[h].donBaoHanh!.id === this.donBaoHanhs[i].id
              ) {
                count1++;
                this.donBaoHanhs[i].tienDo = (count1 / this.chiTietSanPhamTiepNhans.length) * 100;
              }
            }
          });
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
  ngOnInit(): void {
    // if (window.trustedTypes && !this.trustedTypesPolicy) {
    //   try {
    //     this.trustedTypesPolicy = window.trustedTypes.createPolicy('fast-html', {
    //       createHTML: (input: string) => input,
    //     });
    //   } catch (e) {
    //     console.warn('Could not create trusted types policy:', e);
    //   }
    // }
    this.http.get<any[]>('api/tiep-nhan').subscribe((res: any[]) => {
      this.donBaoHanhs = res.sort((a, b) => b.id! - a.id!);
      // console.log('tiep-nhan:', res);
      for (let i = 0; i < this.donBaoHanhs.length; i++) {
        this.donBaoHanhs[i].tienDo = Number(this.donBaoHanhs[i].slDaPhanLoai / this.donBaoHanhs[i].slSanPham) * 100;
        this.donBaoHanhs[i].nguoiNhanEnabled = this.donBaoHanhs[i].tienDo === 100;
      }
      if (!this.isGridReady || !this.donBaoHanhs.length) {
        return;
      }

      this.angularGrid?.dataView.beginUpdate();
      this.angularGrid?.dataView.setItems(this.donBaoHanhs, 'id');

      this.angularGrid?.dataView.setPagingOptions({ pageSize: 50, pageNum: 0 });
      this.angularGrid?.dataView.endUpdate();

      this.angularGrid?.slickGrid.invalidate();
      this.angularGrid?.slickGrid.render();
    });

    this.columnDefinitions = [];
    this.columnDefinitions1 = [
      {
        id: 'btnNguoiNhan',
        field: 'btnNguoiNhan',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        formatter: this.buttonnguoiNhan,
        maxWidth: 55,
        cssClass: 'wrap-text',
        minWidth: 55,
        onCellClick: (e: Event, args: OnEventArgs) => {
          const rowData = args.dataContext;
          if (rowData.tienDo === 100) {
            this.openNhapNguoiNhanDialog(rowData);
          }
        },
      },
      {
        id: 'bbtn',
        field: 'id',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        formatter: this.buttonBBTN,
        maxWidth: 55,
        cssClass: 'wrap-text',
        minWidth: 55,
        onCellClick: (e: Event, args: OnEventArgs) => {
          this.idDonBaoHanh = args.dataContext.id;
          this.donBaoHanh = args.dataContext;
          this.openPopupInBBTNTest(args.dataContext.id);
          // console.log('id? ', args.dataContext.id);
          // this.angularGrid?.gridService.highlightRow(args.row, 1500);
          // this.angularGrid?.gridService.setSelectedRow(args.row);
        },
      },
      {
        id: 'phanLoai',
        field: 'idPL',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        formatter: this.buttonPL,
        cssClass: 'wrap-text',
        maxWidth: 55,
        minWidth: 55,
        onCellClick: (e: Event, args: OnEventArgs) => {
          this.openPopupPhanLoai(args.dataContext.id);
          // console.log('idPL? ', args.dataContext);
          this.donBaoHanh = args.dataContext;
          this.donBaoHanh.nguoiTaoDon = this.account?.login;
          // this.dataPL = args.dataContext;
          // this.angularGrid?.gridService.highlightRow(args.row, 1500);
          // this.angularGrid?.gridService.setSelectedRow(args.row);
        },
      },
      {
        id: 'edit',
        field: 'idEdit',
        excludeFromColumnPicker: true,
        excludeFromGridMenu: true,
        excludeFromHeaderMenu: true,
        cssClass: 'wrap-text',
        formatter: this.buttonEdit,
        minWidth: 55,
        maxWidth: 55,
        onCellClick: (e: Event, args: OnEventArgs) => {
          this.openPopupEdit(args.dataContext.id);
          // console.log('edit', args.dataContext.id);
          //lưu thông tin đơn bảo hành vào session
          sessionStorage.setItem('sessionStorage', JSON.stringify(args));
          // this.alertWarning = `Editing: ${args.dataContext.title}`
          this.angularGrid?.gridService.highlightRow(args.row, 1500);
          this.angularGrid?.gridService.setSelectedRow(args.row);
        },
      },
      {
        id: 'id',
        name: 'Mã tiếp nhận',
        field: 'maTiepNhan',
        sortable: true,
        filterable: true,
        formatter: (_row, _cell, value) => `<div class="wrap-text-cell">${value as string}</div>`,
        minWidth: 140,
        // maxWidth: 200,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },

      {
        id: 'khachHang',
        name: 'Khách hàng',
        field: 'tenKhachHang',
        cssClass: 'wrap-text',
        sortable: true,
        filterable: true,
        // formatter: (_row, _cell, value) => {
        //   const safeValue = String(value ?? '');
        //   return `<div style="white-space: normal; word-break: break-word; line-height: 1.4;">${safeValue}</div>`;
        // },
        minWidth: 300,
        // maxWidth: 400,
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },

      {
        id: 'ngayTiepNhan',
        name: 'Ngày tạo đơn',
        cssClass: 'wrap-text-cell',
        field: 'ngayTiepNhan',
        dataKey: 'ngayTiepNhan',
        sortable: true,
        defaultSortAsc: false,
        filterable: true,
        minWidth: 140,
        // width: 140,
        // maxWidth: 160,
        type: FieldType.object,
        formatter: Formatters.dateTimeIso,
        filter: {
          placeholder: 'search',
          model: Filters.compoundDate,
        },
        editor: {
          model: Editors.date,
          required: true,
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
        minWidth: 85,
        maxWidth: 85,
        type: FieldType.number,
        cssClass: 'wrap-text-cell number-cell',
        filter: {
          placeholder: 'Search...',
          model: Filters.compoundInputText,
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            col: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
      },

      {
        id: 'slDaPhanTich',
        name: 'Đã xử lý',
        field: 'slDaPhanTich',
        cssClass: 'wrap-text-cell number-cell',
        sortable: true,
        filterable: true,
        minWidth: 75,
        maxWidth: 75,
        type: FieldType.number,
        filter: {
          placeholder: 'Search...',
          model: Filters.compoundInputText,
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            col: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        formatter: (_row, _cell, value) => `<div class="number-cell">${value}</div>`,
      },
      {
        id: 'tienDo',
        name: 'Tiến độ phân loại',
        field: 'tienDo',
        sortable: true,
        filterable: true,
        formatter: Formatters.progressBar,
        minWidth: 100,
        maxWidth: 100,
        // alwaysRenderColumn: true,
        onCellChange: (e: SlickEventData, args: OnEventArgs) => console.log('tesssst: ', args),
        type: FieldType.string,
        filter: {
          placeholder: 'search',
          model: Filters.compoundInputText,
        },
      },
      {
        id: 'ngaykhkb',
        name: 'Ngày tiếp nhận',
        field: 'ngaykhkb',
        sortable: true,
        filterable: true,
        minWidth: 140,
        width: 140,
        // maxWidth: 140,
        type: FieldType.object,
        formatter: Formatters.dateTimeIso,
        filter: {
          placeholder: 'Search...',
          model: Filters.compoundDate,
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            col: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
      },
      {
        id: 'ngayTraBienBan',
        name: 'Ngày trả biên bản',
        field: 'ngayTraBienBan',
        dataKey: 'ngayTraBienBan',
        width: 140,
        sortable: true,
        filterable: true,
        minWidth: 140,
        // maxWidth: 140,
        type: FieldType.object,
        formatter: Formatters.dateTimeIso,
        filter: {
          placeholder: 'Search...',
          model: Filters.compoundDate,
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            col: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
      },
      {
        id: 'nguoiTaoDon',
        name: 'Người tạo đơn',
        field: 'nguoiTaoDon',
        sortable: true,
        filterable: true,
        minWidth: 115,
        maxWidth: 115,
        width: 115,
        type: FieldType.string,
        filter: {
          placeholder: 'Search...',
          model: Filters.compoundInputText,
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            col: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
      },
      {
        id: 'nguoiNhan',
        name: 'Người nhận',
        field: 'nguoiNhan',
        sortable: true,
        filterable: true,
        minWidth: 115,
        maxWidth: 115,
        width: 115,
        type: FieldType.string,
        filter: {
          placeholder: 'Search...',
          model: Filters.compoundInputText,
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            col: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
      },
      {
        id: 'nhanVienGiaoHang',
        name: 'Nhân viên giao vận',
        field: 'nhanVienGiaoHang',
        sortable: true,
        filterable: true,
        minWidth: 90,
        width: 90,
        type: FieldType.string,
        cssClass: 'wrap-text-cell',
        filter: {
          placeholder: 'Search',
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
        id: 'trangThai',
        name: 'Trạng thái',
        field: 'trangThai',
        sortable: true,
        filterable: true,
        minWidth: 180,
        maxWidth: 180,
        type: FieldType.string,
        filter: {
          placeholder: 'Search...',
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
        customTooltip: {
          useRegularTooltip: true,
          useRegularTooltipFromFormatterOnly: true,
          maxWidth: 200,
        },
        editor: {
          model: Editors.text,
          required: true,
          maxLength: 100,
          editorOptions: {
            col: 42,
            rows: 5,
          } as LongTextEditorOption,
        },
      },
    ];
    this.accountService.identity().subscribe(account => {
      this.account = account;

      const hasDeletePermission = this.accountService.hasAnyAuthority('ROLE_ADMIN_TEM');

      if (hasDeletePermission) {
        this.columnDefinitions1.push({
          id: 'delete',
          field: 'idDelete',
          excludeFromColumnPicker: true,
          excludeFromGridMenu: true,
          excludeFromHeaderMenu: true,
          cssClass: 'wrap-text',
          formatter: this.buttonDelete,
          minWidth: 55,
          maxWidth: 55,
          onCellClick: (e: Event, args: OnEventArgs) => {
            const id: number = args.dataContext.id;
            this.deleteId = id;
            this.isModalOpenConfirm = true;
            document.getElementById('modal-confirm')!.style.display = 'block';
          },
        });
      }
      const presetColumns: { columnId: string }[] = [
        { columnId: 'btnNguoiNhan' },
        { columnId: 'bbtn' },
        { columnId: 'phanLoai' },
        { columnId: 'edit' },
      ];

      if (hasDeletePermission) {
        presetColumns.push({ columnId: 'delete' });
      }

      presetColumns.push(
        { columnId: 'id' },
        { columnId: 'khachHang' },
        { columnId: 'ngayTiepNhan' },
        { columnId: 'slTiepNhan' },
        { columnId: 'slDaPhanTich' },
        { columnId: 'tienDo' },
        { columnId: 'ngaykhkb' },
        { columnId: 'ngayTraBienBan' },
        { columnId: 'nguoiTaoDon' },
        { columnId: 'nguoiNhan' },
        { columnId: 'nhanVienGiaoHang' },
        { columnId: 'trangThai' }
      );
      this.gridOptions1 = {
        enableAutoResize: true,
        enableSorting: true,
        enableFiltering: true,
        enablePagination: true,
        // enableAutoSizeColumns: true,
        asyncEditorLoadDelay: 2000,
        frozenColumn: hasDeletePermission ? 4 : 3,
        enableGridMenu: true,
        gridMenu: {
          iconCssClass: 'd-none',
          hideClearAllFiltersCommand: false,
          hideClearAllSortingCommand: false,
          hideExportCsvCommand: false,
          hideExportExcelCommand: false,
          commandTitle: 'Tác vụ lưới',
          columnTitle: 'Hiển thị cột',
        },
        pagination: {
          pageSizes: [30, 50, 100],
          pageSize: 50,
        },
        editable: true,
        enableCellNavigation: true,
        gridHeight: 620,
        rowHeight: 48,
        gridWidth: '100%',
        autoFitColumnsOnFirstLoad: true,
        asyncEditorLoading: true,
        forceFitColumns: false,

        presets: {
          columns: presetColumns,
        },
      };
    });
    this.columnDefinitions1 = this.columnDefinitions1.map(col => {
      const isTextType = ['string', 'object'].includes(col.type ?? '');
      if (isTextType && !col.formatter) {
        return { ...col, formatter: this.wrapTextFormatter };
      }
      return col;
    });
    this.getPhanLoaiChiTietTiepNhan();
    this.getKhachHangs();
    this.getDanhSachTinhTrang();
    this.getSanPhams();
    this.getDanhSachBienBan();
    this.getMaxId();
    // this.getChiTietPhanLoais(Number(this.idDonBaoHanh));
    this.accountService.identity().subscribe(account => {
      this.account = account;
    });
  }

  simulateServerAsyncCall(item: any): Promise<unknown> {
    sessionStorage.setItem('sessionStorage', JSON.stringify(item));
    return new Promise(resolve => {
      setTimeout(() => {
        const itemDetail = item;
        // console.log(item);

        // resolve the data after delay specified
        resolve(itemDetail);
      }, 1000);
    });
  }

  // lấy id lớn nhất trong ds chi tiết sản phẩm tiếp nhận
  getMaxId(): void {
    this.http.get<ChiTietSanPhamTiepNhan>(this.getMaxIdChiTietSanPhamTiepNhanUrl).subscribe(res => {
      this.idAddRow = res.id!;
      // console.log('max id', this.idAddRow);
    });
  }
  randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  addItem(): void {
    this.donBaoHanhs = [
      ...this.donBaoHanhs,
      {
        id: this.donBaoHanhs.length + 1,
        maTiepNhan: this.donBaoHanhs[this.donBaoHanhs.length]?.maTiepNhan,
        khachHang: this.donBaoHanhs[this.donBaoHanhs.length]?.tenKhachHang,
        ngayTaoDon: this.donBaoHanhs[this.donBaoHanhs.length]?.ngayTaoDon,
        tongTiepNhan: this.donBaoHanhs[this.donBaoHanhs.length]?.tongTiepNhan,
        slDaPhanTich: this.donBaoHanhs[this.donBaoHanhs.length]?.slDaPhanTich,
        ngaykhkb: this.donBaoHanhs[this.donBaoHanhs.length]?.ngaykhkb,
        createBy: this.donBaoHanhs[this.donBaoHanhs.length]?.nguoiTaoDon,
        trangThai: this.donBaoHanhs[this.donBaoHanhs.length]?.trangThai,
      },
    ];
    this.donBaoHanhs.sort((a, b) => b.id - a.id);
  }
  //format xuống dòng dùng chung cho các cell
  wrapTextFormatter: Formatter<any> = (_row, _cell, value) => {
    const safeValue = String(value ?? '');
    return `<div class="wrap-text-cell">${safeValue}</div>`;
    // return `<div style="white-space: normal; word-break: break-word; line-height: 1.4;display: flex; align-items: center;">${safeValue}</div>`;
  };

  //lấy danh sách biên bản
  getDanhSachBienBan(): void {
    this.http.get<any>('api/ma-bien-bans').subscribe(res => {
      // console.log('danh sach bien ban: ', res);
      this.danhSachBienBan = res;
    });
  }
  // lấy danh sách sản phẩm
  getSanPhams(): void {
    this.sanPhamService.query().subscribe({
      next: (res: HttpResponse<ISanPham[]>) => {
        this.danhSachSanPham = res.body ?? [];
        // console.log('danh sach san pham:', this.danhSachSanPham);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
  getPhanLoaiChiTietTiepNhan(): void {
    this.http.get<any>(this.phanLoaiChiTietTiepNhanUrl).subscribe(resPLTN => {
      this.phanLoaiChiTietTiepNhans = resPLTN;
      // sessionStorage.setItem('sessionStorage', JSON.stringify(resPLTN));
      // console.log('sessionStorage', resPLTN);
    });
  }
  //Lấy danh sách khách hàng
  getKhachHangs(): void {
    this.khachHangService.query().subscribe({
      next: (res: HttpResponse<IKhachHang[]>) => {
        this.khachHangs = res.body ?? [];
        // console.log('danh sách khách hàng: ', this.khachHangs);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
  // lấy danh sách tình trạng
  getDanhSachTinhTrang(): void {
    this.danhSachTinhTrangService.query().subscribe({
      next: (res: HttpResponse<IDanhSachTinhTrang[]>) => {
        this.danhSachTinhTrangs = res.body ?? [];
        // console.log('danh sach tinh trang:', this.danhSachTinhTrangs);
      },
    });
  }
  onPrintClick(): void {
    console.log('[DEBUG] vào onPrintClick()');
    this.openPopupInBBTN4();
  }
  get paginatedPhanLoai(): IResultItem[] {
    const start = (this.pagePLTN - 1) * this.pageSizePLTN;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.resultChiTietSanPhamTiepNhans.slice(start, start + this.pageSizePLTN);
  }
  getDuLieuPhanLoai(id: number): void {
    this.isLoading = true;
    this.countItem = 0;
    this.resultChiTietSanPhamTiepNhans = [];

    forkJoin([
      this.http.get<any>(`${this.chiTietSanPhamTiepNhanUrl}/${id}`),
      this.http.get<any>(`${this.phanLoaiChiTietTiepNhanUrl}/by-don-bao-hanh/${id}`),
    ]).subscribe(([resChiTiet, resPhanLoai]) => {
      this.chiTietSanPhamTiepNhans = resChiTiet;
      this.phanLoaiChiTietTiepNhans = resPhanLoai;

      // Tạo map để tra nhanh phân loại theo chi tiết sản phẩm
      const phanLoaiMap = new Map<number, IPhanLoaiChiTietTiepNhan[]>();
      for (const pl of resPhanLoai) {
        const chiTietId = pl.chiTietSanPhamTiepNhan?.id;
        if (typeof chiTietId === 'number') {
          if (!phanLoaiMap.has(chiTietId)) {
            phanLoaiMap.set(chiTietId, []);
          }
          phanLoaiMap.get(chiTietId)!.push(pl);
        }
      }

      let countTinhTrangBaoHanh = 0;

      for (const chiTiet of resChiTiet) {
        const item = {
          id: chiTiet.id,
          tenSanPham: chiTiet.sanPham?.name,
          donVi: chiTiet.sanPham?.donVi,
          slKhachGiao: chiTiet.soLuongKhachHang,
          slTiepNhanTong: 0,
          slTiepNhan: 0,
          slDoiMoi: 0,
          slSuaChua: 0,
          slKhongBaoHanh: 0,
          chiTietSanPhamTiepNhan: chiTiet,
          tinhTrangBaoHanh: chiTiet.tinhTrangBaoHanh === 'true',
        };

        const danhSachPhanLoai = phanLoaiMap.get(item.id) ?? [];
        for (const phanLoai of danhSachPhanLoai) {
          const tinhTrangId = phanLoai.danhSachTinhTrang?.id;
          const soLuong = phanLoai.soLuong ?? 0;

          switch (tinhTrangId) {
            case 1:
              item.slDoiMoi += soLuong;
              break;
            case 2:
              item.slSuaChua += soLuong;
              break;
            case 3:
              item.slKhongBaoHanh += soLuong;
              break;
          }

          item.slTiepNhan += soLuong;
        }

        if (item.tinhTrangBaoHanh) {
          countTinhTrangBaoHanh++;
        }
        this.resultChiTietSanPhamTiepNhans.push(item);
      }

      // Gán mảng gốc một lần duy nhất
      this.danhSachGocPopupPhanLoai = this.resultChiTietSanPhamTiepNhans;

      // Tính tiến độ
      this.countItem = countTinhTrangBaoHanh;
      const total = this.resultChiTietSanPhamTiepNhans.length;
      this.tienDo = total > 0 ? Number(((countTinhTrangBaoHanh / total) * 100).toFixed(2)) : 0;

      this.isLoading = false;
    });
  }

  getDuLieuInTest(id: number): void {
    this.isLoading = true;
    this.resultChiTietSanPhamTiepNhans = [];

    // 1) Fetch chi tiết cùng phân loại (eager load phanLoaiChiTietTiepNhans)
    this.http.get<ChiTietSanPhamTiepNhan[]>(`${this.chiTietSanPhamTiepNhanUrl}/${id}?eagerload=true`).subscribe(chiTiets => {
      chiTiets.forEach(ct => {
        // Cơ bản
        let slTiepNhan = 0;
        let slDoiMoi = 0;
        let slSuaChua = 0;
        let slKhongBH = 0;

        // 2) Duyệt bộ phân loại để cộng số
        ct.phanLoaiChiTietTiepNhans?.forEach(pl => {
          const qty = pl.soLuong ?? 0;
          console.log('Tinh trạng:', pl.danhSachTinhTrang);
          switch (pl.danhSachTinhTrang?.id) {
            case 1:
              slDoiMoi += qty;
              break;
            case 2:
              slSuaChua += qty;
              break;
            case 3:
              slKhongBH += qty;
              break;
          }
          slTiepNhan += qty;
        });

        // 3) Đẩy vào mảng kết quả
        const exists = this.resultChiTietSanPhamTiepNhans.some(item => item.id === ct.id);
        if (!exists) {
          if (ct.phanLoaiChiTietTiepNhans && ct.phanLoaiChiTietTiepNhans.length > 0) {
            this.resultChiTietSanPhamTiepNhans.push({
              id: ct.id!,
              tenSanPham: ct.sanPham?.name ?? '',
              donVi: ct.sanPham?.donVi ?? '',
              slKhachGiao: ct.soLuongKhachHang ?? 0,
              slTiepNhan: slTiepNhan,
              slDoiMoi: slDoiMoi,
              slSuaChua: slSuaChua,
              slKhongBaoHanh: slKhongBH,
              slTiepNhanTong: slTiepNhan,
              chiTietSanPhamTiepNhan: ct,
              tinhTrangBaoHanh: ct.tinhTrangBaoHanh === 'true',
            });
          }
        }
      });

      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  getDuLieuInChinhThuc(id: number): void {
    this.isLoading = true;
    this.resultChiTietSanPhamTiepNhans = [];

    this.http.get<any>(`${this.chiTietSanPhamTiepNhanUrl}/${id}`).subscribe(res => {
      this.chiTietSanPhamTiepNhans = res;

      this.http.get<any>(this.danhSachTinhTrangUrl).subscribe(resTT => {
        this.danhSachTinhTrangs = resTT;

        for (const chiTiet of this.chiTietSanPhamTiepNhans) {
          const item = {
            id: chiTiet.id,
            tenSanPham: chiTiet.sanPham?.name,
            donVi: chiTiet.sanPham?.donVi,
            slKhachGiao: chiTiet.soLuongKhachHang,
            slTiepNhanTong: 0,
            slTiepNhan: chiTiet.slTiepNhan,
            slDoiMoi: 0,
            slSuaChua: 0,
            slKhongBaoHanh: 0,
            chiTietSanPhamTiepNhan: chiTiet,
            tinhTrangBaoHanh: chiTiet.tinhTrangBaoHanh === 'true',
          };

          this.resultChiTietSanPhamTiepNhans.push(item);
        }

        this.isLoading = false;
      });
    });
  }

  //get thông tin phân loại
  // getChiTietPhanLoais(id: number): void {
  //   console.log('→ URL chiTiet$ =', `${this.chiTietSanPhamTiepNhanUrl}/${id}`);
  //   const chiTiet$ = this.http.get<IChiTietSanPhamTiepNhan[]>(`${this.chiTietSanPhamTiepNhanUrl}/${id}`).pipe(
  //     catchError(e => {
  //       console.error('[ERROR] chiTiet$ failed', e);
  //       return of([]);
  //     })
  //   );

  //   console.log('→ URL tinhTrang$ =', this.danhSachTinhTrangUrl);
  //   const tinhTrang$ = this.http.get<IDanhSachTinhTrang[]>(this.danhSachTinhTrangUrl).pipe(
  //     catchError(e => {
  //       console.error('[ERROR] tinhTrang$ failed', e);
  //       return of([]);
  //     })
  //   );

  //   console.log('→ URL phanLoai$ =', `${this.phanLoaiChiTietTiepNhanUrl}?donBaoHanhId=${id}`);
  //   const phanLoai$ = this.http.get<IPhanLoaiChiTietTiepNhan[]>(`${this.phanLoaiChiTietTiepNhanUrl}?donBaoHanhId=${id}`).pipe(
  //     catchError(e => {
  //       console.error('[ERROR] phanLoai$ failed', e);
  //       return of([]);
  //     })
  //   );

  //   forkJoin({ chiTiet: chiTiet$, tinhTrang: tinhTrang$, phanLoai: phanLoai$ })
  //     .pipe(tap(() => console.log('[DEBUG] forkJoin bắt đầu')))
  //     .subscribe(
  //       ({ chiTiet, tinhTrang, phanLoai }) => {
  //         console.log(
  //           '[DEBUG] forkJoin result lengths:',
  //           'chiTiet=',
  //           chiTiet.length,
  //           'tinhTrang=',
  //           tinhTrang.length,
  //           'phanLoai=',
  //           phanLoai.length
  //         );
  //         this.chiTietSanPhamTiepNhans = chiTiet;
  //         this.phanLoaiChiTietTiepNhans = phanLoai;
  //         // (Nếu bạn cần danhSachTinhTrang sau này thì gán vào property tương ứng)
  //         this.processDataAndRender();
  //       },
  //       err => console.error('[ERROR] forkJoin subscribe', err)
  //     );
  // }

  processDataAndRender(): void {
    // 1) Group phân loại theo chi tiết
    // 1) Lọc out những ct.id == null
    const validChiTiets = this.chiTietSanPhamTiepNhans.filter((ct): ct is IChiTietSanPhamTiepNhan & { id: number } => ct.id != null);

    // 2) Build a lookup map trước
    const mapPL: Record<number, IPhanLoaiChiTietTiepNhan[]> = {};
    for (const pl of this.phanLoaiChiTietTiepNhans) {
      const key = pl.chiTietSanPhamTiepNhan?.id;
      if (key == null) {
        continue;
      }
      (mapPL[key] ||= []).push(pl);
    }

    // 3) Tạo result với kiểu an toàn
    this.resultChiTietSanPhamTiepNhans = validChiTiets.map((ct): IResultItem => {
      const pls = mapPL[ct.id] ?? [];
      const item: IResultItem = {
        id: ct.id,
        tenSanPham: ct.sanPham?.name ?? undefined,
        donVi: ct.sanPham?.donVi ?? undefined,
        slKhachGiao: ct.soLuongKhachHang ?? undefined,
        slTiepNhanTong: 0,
        slTiepNhan: 0,
        slDoiMoi: 0,
        slSuaChua: 0,
        slKhongBaoHanh: 0,
        chiTietSanPhamTiepNhan: ct,
        tinhTrangBaoHanh: ct.tinhTrangBaoHanh === 'true',
      };

      for (const pl of pls) {
        const qty = pl.soLuong as number;
        switch (pl.danhSachTinhTrang?.id) {
          case 1:
            item.slDoiMoi += qty;
            break;
          case 2:
            item.slSuaChua += qty;
            break;
          case 3:
            item.slKhongBaoHanh += qty;
            break;
        }
        item.slTiepNhan += qty;
      }

      return item;
    });
    console.log('[DEBUG] processed result rows:', this.resultChiTietSanPhamTiepNhans.length);

    // 3) Tính progress
    this.countItem = this.resultChiTietSanPhamTiepNhans.filter(x => x.tinhTrangBaoHanh).length;
    this.tienDo = Number(((this.countItem / this.resultChiTietSanPhamTiepNhans.length) * 100).toFixed(2));

    this.isLoading = false;
    this.cdr.markForCheck();
  }
  // ================================= popup chỉnh sửa thông tin ==================================
  openPopupEdit(id: number): void {
    this.popupChinhSuaThongTin = true;
    this.navBarComponent.toggleSidebar2();

    const result = sessionStorage.getItem(`TiepNhan ${id.toString()}`);

    // Tìm đơn bảo hành theo ID
    const don = this.donBaoHanhs.find(d => d.id === id);
    if (!don) {
      return;
    }

    // Gán thông tin đơn bảo hành
    this.thongTinDonBaoHanh = { ...don };

    // Tìm khách hàng theo tên (vì maKhachHang đang null)
    const tenKH = don.tenKhachHang?.trim();
    const khachHangTimDuoc = this.khachHangs?.find(kh => kh.tenKhachHang?.trim() === tenKH);

    if (khachHangTimDuoc) {
      this.thongTinDonBaoHanh.khachHang = khachHangTimDuoc;
      this.thongTinDonBaoHanh.tenKhachHang = khachHangTimDuoc.tenKhachHang ?? '';
    } else {
      this.thongTinDonBaoHanh.khachHang = null;
      this.thongTinDonBaoHanh.tenKhachHang = don.tenKhachHang ?? '';
    }

    // Gán dữ liệu chi tiết sản phẩm tiếp nhận
    this.resultChiTietSanPhamTiepNhans = JSON.parse(result as string);
  }

  openGridMenu(event?: MouseEvent): void {
    if (!this.angularGrid) {
      // console.warn('angularGrid chưa được gán');
      return;
    }

    const gridMenuInstance = this.angularGrid.extensionService?.getExtensionInstanceByName(ExtensionName.gridMenu);
    console.log('GridMenu Instance:', gridMenuInstance);

    if (gridMenuInstance) {
      const mouseEvent = event ?? new MouseEvent('click');
      gridMenuInstance.showGridMenu(mouseEvent);
    } else {
      // console.warn('GridMenu chưa được khởi tạo hoặc extension chưa sẵn sàng');
    }
  }

  closePopupEdit(): void {
    this.popupChinhSuaThongTin = false;
    console.log('Đã click Huỷ hoặc X');
  }
  getStyle(status: string): any {
    switch (status) {
      case 'Chờ phân tích':
        return { backgroundColor: '#f0ad4e', color: '#fff' };
      case 'Đang phân tích':
        return { backgroundColor: '#4da3bdff', color: '#fff' };
      case 'Hoàn thành phân tích':
        return { backgroundColor: '#49a849ff', color: '#fff' };
      default:
        return { backgroundColor: '#777', color: '#fff' };
    }
  }
  capNhatThongTinKhachHang(tenKhachHang: string): void {
    for (let i = 0; i < this.khachHangs!.length; i++) {
      if (this.khachHangs![i].tenKhachHang === tenKhachHang) {
        const khachHangGoc = this.khachHangs?.[i];
        const khachHangClone = {
          ...khachHangGoc,
          tenKhachHang: this.thongTinDonBaoHanh.tenKhachHang,
        };
        this.thongTinDonBaoHanh.khachHang = khachHangClone;

        console.log({ goc: this.khachHangs![i], capNhat: this.thongTinDonBaoHanh.khachHang });
      }
    }
  }
  xacNhanCapNhatDonBaoHanh(): void {
    const khachHangDaChon = this.khachHangs?.find(kh => kh.tenKhachHang === this.thongTinDonBaoHanh.tenKhachHang);
    if (khachHangDaChon) {
      this.thongTinDonBaoHanh.khachHang = { id: khachHangDaChon.id };
    }

    const rawDate = this.thongTinDonBaoHanh.ngaykhkb;
    if (typeof rawDate === 'string') {
      // Trường hợp chuỗi có định dạng "yyyy-MM-dd HH:mm:ss.SSS"
      const cleaned = rawDate.trim().replace(' ', 'T').replace('.0', '');
      const date = new Date(cleaned);

      if (!isNaN(date.getTime())) {
        this.thongTinDonBaoHanh.ngaykhkb = date.toISOString(); // ISO-8601
      } else {
        console.warn('Ngày không hợp lệ:', rawDate);
        this.thongTinDonBaoHanh.ngaykhkb = null; //  fallback
      }
    }

    this.http.put<any>(this.updateDonBaoHanhUrl, this.thongTinDonBaoHanh).subscribe({
      next: updated => {
        if (updated?.id) {
          const idx = this.donBaoHanhs.findIndex(d => d.id === updated.id);
          if (idx !== -1) {
            this.donBaoHanhs[idx] = updated;
          }
        }
        this.openPopupNoti('Cập nhật thành công', true);
        this.closePopupEdit();
        // window.location.reload();
      },
      error: err => {
        alert('Update failed!');
        console.log(err.message);
      },
    });
  }

  // ========================================= popup thêm mới đơn bảo hành và chi tiết đơn bảo hành =======================================
  openPopupThemMoi(): void {
    this.popupThemMoi = true;
    this.navBarComponent.toggleSidebar2();
    //reset dữ liệu
    this.themMoiDonBaoHanh = [];
    this.themMoiPhanLoaiChiTietTiepNhan = [];
    this.chiTietDonBaoHanh = [];
    this.donBaoHanh = {
      khachHang: { tenKhachHang: '' },
      ngayTiepNhan: new Date(),
      nguoiTaoDon: this.account?.login,
      trangThai: 'Chờ phân loại',
      slDaPhanTich: 0,
    };
  }
  checkDuLieuThemMoi(tenKhachHang: string): void {
    this.isChanged = true;
    // cập nhật lại thông tin khách hàng
    for (let i = 0; i < this.khachHangs!.length; i++) {
      if (this.khachHangs![i].tenKhachHang === tenKhachHang) {
        this.donBaoHanh.khachHang = this.khachHangs![i];
        // console.log({ goc: this.khachHangs![i], capNhat: this.donBaoHanh.khachHang });
        // console.log('cập nhật: ', this.donBaoHanh);
      }
    }
    // console.log('check dữ liệu thêm mới: ', this.donBaoHanh);
  }
  // thêm mới đơn bảo hành và chi tiết
  postDonBaoHanh(): void {
    if (this.donBaoHanh.khachHang.tenKhachHang === '' || this.donBaoHanh.nhanVienGiaoHang === '') {
      let check = false;
      if (this.donBaoHanh.khachHang.tenKhachHang !== '' && this.donBaoHanh.nhanVienGiaoHang === '') {
        check = true;
        this.openPopupNoti('Chưa điền thông tin nhân viên giao vận');
      }
      if (this.donBaoHanh.khachHang.tenKhachHang === '' && this.donBaoHanh.nhanVienGiaoHang !== '') {
        check = true;
        this.openPopupNoti('Chưa điền thông tin khách hàng');
      }
      if (check === false) {
        this.openPopupNoti('Chưa điền thông tin khách hàng và nhân viên giao vận');
      }
    } else {
      this.donBaoHanh.maTiepNhan = this.taoMaTiepNhan();
      this.http.post<any>(this.postDonBaoHanhNewUrl, this.donBaoHanh).subscribe(res => {
        this.themMoiDonBaoHanh.forEach((item: { sanPham: ISanPham; tenSanPham: string | null }) => {
          if (!item.sanPham && item.tenSanPham) {
            const matched = this.danhSachSanPham.find(sp => sp.name === item.tenSanPham);
            if (matched) {
              item.sanPham = matched;
            }
          }
        });
        this.chiTietDonBaoHanh = this.themMoiDonBaoHanh.map((item: { slKhachGiao: any; slTiepNhan: any; sanPham: any }) => ({
          soLuongKhachHang: item.slKhachGiao,
          idKho: '0',
          idBienBan: '0',
          tongLoiKiThuat: 0,
          tongLoiLinhDong: 0,
          ngayPhanLoai: null,
          slTiepNhan: item.slTiepNhan,
          slTon: 0,
          tinhTrangBaoHanh: 'false',
          trangThaiIn: null,
          sanPham: item.sanPham,
          donBaoHanh: res,
        }));

        this.http.post<any>(this.postChiTietDonBaoHanhUrl, this.chiTietDonBaoHanh).subscribe(res1 => {
          this.themMoiPhanLoaiChiTietTiepNhan = [];

          res1.forEach((chiTiet: IChiTietSanPhamTiepNhan, i: number) => {
            this.danhSachTinhTrangs.forEach((tinhTrang: IDanhSachTinhTrang) => {
              const sl =
                tinhTrang.id === 1
                  ? this.themMoiDonBaoHanh[i].slDoiMoi
                  : tinhTrang.id === 2
                  ? this.themMoiDonBaoHanh[i].slSuaChua
                  : tinhTrang.id === 3
                  ? this.themMoiDonBaoHanh[i].slKhongBaoHanh
                  : 0;

              if (sl > 0) {
                this.themMoiPhanLoaiChiTietTiepNhan.push({
                  soLuong: sl,
                  chiTietSanPhamTiepNhan: chiTiet,
                  danhSachTinhTrang: tinhTrang,
                });
              }
            });
          });

          this.http.post<any>(this.postPhanLoaiChiTietTiepNhanUrl, this.themMoiPhanLoaiChiTietTiepNhan).subscribe(res2 => {
            this.openPopupNoti('Thêm mới thành công', true);
            // window.location.reload();
          });
        });
      });
    }
  }

  //cập nhật thông tin sl Tổng tiếp nhận đơn bảo hành và sl tiếp nhận của chi tiết đơn bảo hành
  updateChiTietDonBaoHanhInfo(slDoiMoi: any, slSuaChua: any, slKhongBaoHanh: any, index: number): void {
    this.donBaoHanh.slTiepNhan = 0;
    // sl tiếp nhận của chi tiết đơn bảo hành
    const slTiepNhan = Number(slDoiMoi) + Number(slSuaChua) + Number(slKhongBaoHanh);
    //cập nhật thông tin sl Tổng tiếp nhận đơn bảo hành
    for (let i = 0; i < this.themMoiDonBaoHanh.length; i++) {
      this.donBaoHanh.slTiepNhan =
        Number(this.donBaoHanh.slTiepNhan) +
        Number(this.themMoiDonBaoHanh[i].slDoiMoi) +
        Number(this.themMoiDonBaoHanh[i].slSuaChua) +
        Number(this.themMoiDonBaoHanh[i].slKhongBaoHanh);
      if (index === i) {
        this.themMoiDonBaoHanh[i].slNhan = slTiepNhan;
      }
    }
    // console.log({ slTiepNhan1: slTiepNhan, danhsach: this.themMoiDonBaoHanh });
  }

  // deleteRow(tenSanPham: any): void {
  //   if (confirm('Bạn chắc chắn muốn xóa thông số này?') === true) {
  //     console.log()
  //     this.donBaoHanh.slTiepNhan = 0;
  //     this.themMoiDonBaoHanh = this.themMoiDonBaoHanh.filter((d: any) => d.tenSanPham !== tenSanPham);
  //     // cập nhật lại tổng số lượng tiếp nhận
  //     for (let i = 0; i < this.themMoiDonBaoHanh.length; i++) {
  //       this.donBaoHanh.slTiepNhan =
  //         Number(this.donBaoHanh.slTiepNhan) +
  //         Number(this.themMoiDonBaoHanh[i].slDoiMoi) +
  //         Number(this.themMoiDonBaoHanh[i].slSuaChua) +
  //         Number(this.themMoiDonBaoHanh[i].slKhongBaoHanh);
  //     }
  //   }
  // }
  closePopupThemMoi(): void {
    this.popupThemMoi = false;
  }
  taoMaTiepNhan(): string {
    const date = new Date();
    this.year = date.getFullYear().toString().slice(-2);
    const getMonth = date.getMonth() + 1;
    if (getMonth < 10) {
      this.month = `0${getMonth}`;
    } else {
      this.month = getMonth.toString();
    }
    const maTiepNhan = `DBH${this.year}${this.month}`;
    // console.log('tao moi ma tiep nhan:', maTiepNhan);
    return maTiepNhan;
  }

  //=============================================== Popup Nhập người nhận ================================================
  openNhapNguoiNhanDialog(rowData: any): void {
    this.selectedRowData = rowData;
    this.nguoiNhan = '';
    this.modalService.open(this.nhapNguoiNhanTemplate, {
      size: 'xl',
      centered: true,
      windowClass: 'custom-modal-height',
    });
  }
  submitNguoiNhan(modal: NgbModalRef): void {
    if (!this.selectedRowData || !this.nguoiNhan || !this.ngayTraBienBan) {
      return;
    }

    this.selectedRowData.nguoiNhan = this.nguoiNhan;

    const selectedDate = new Date(this.ngayTraBienBan);
    const now = new Date();
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    this.selectedRowData.ngayTraBienBan = selectedDate.toISOString();

    if (this.selectedRowData.ngaykhkb) {
      const date = new Date(this.selectedRowData.ngaykhkb);
      this.selectedRowData.ngaykhkb = date.toISOString();
    }

    modal.close();
    this.donBaoHanh = { ...this.selectedRowData };

    this.openPopupInBBTNSaveNguoiNhan(this.selectedRowData.id, () => {
      this.luuSauKhiIn();
    });
  }

  luuSauKhiIn(): void {
    this.http.put(`${this.updateDonBaoHanhUrl}`, this.selectedRowData).subscribe({
      next: () => {
        this.openPopupNoti('Đã lưu người nhận sau khi in', true);
        const idx = this.donBaoHanhs.findIndex(d => d.id === this.selectedRowData.id);
        if (idx > -1) {
          this.donBaoHanhs[idx].nguoiNhan = this.selectedRowData.nguoiNhan;
          this.angularGrid?.dataView.updateItem(this.selectedRowData.id, this.donBaoHanhs[idx]);
          this.angularGrid?.slickGrid.invalidate();
          this.angularGrid?.slickGrid.render();
        }
      },
      error: () => {
        this.openPopupNoti('Lưu người nhận thất bại sau khi in', false);
      },
    });
  }

  luuNguoiNhan(modal: NgbModalRef): void {
    if (!this.selectedRowData || !this.nguoiNhan || !this.ngayTraBienBan) {
      return;
    }

    this.selectedRowData.nguoiNhan = this.nguoiNhan;

    const selectedDate = new Date(this.ngayTraBienBan);
    const now = new Date();
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    this.selectedRowData.ngayTraBienBan = selectedDate.toISOString();

    if (this.selectedRowData.ngaykhkb) {
      const date = new Date(this.selectedRowData.ngaykhkb);
      this.selectedRowData.ngaykhkb = date.toISOString();
    }

    this.http.put(`${this.updateDonBaoHanhUrl}`, this.selectedRowData).subscribe({
      next: () => {
        this.openPopupNoti('Đã lưu người nhận thành công', true);
        const idx = this.donBaoHanhs.findIndex(d => d.id === this.selectedRowData.id);
        if (idx > -1) {
          this.donBaoHanhs[idx].nguoiNhan = this.selectedRowData.nguoiNhan;
          this.donBaoHanhs[idx].ngayTraBienBan = this.selectedRowData.ngayTraBienBan;

          this.angularGrid?.dataView.updateItem(this.selectedRowData.id, this.donBaoHanhs[idx]);
          this.angularGrid?.slickGrid.invalidate();
          this.angularGrid?.slickGrid.render();
        }
        modal.close();
      },
      error: () => {
        this.openPopupNoti('Lưu người nhận thất bại', false);
      },
    });
  }

  //=============================================== Popup phân loại ================================================
  closePopupPhanLoai(): void {
    this.popupPhanLoai = false;
  }
  openPopupPhanLoai(id: number): void {
    this.popupPhanLoai = true;
    this.navBarComponent.toggleSidebar2();

    //reset bien dem signal
    this.countItem = 0;
    this.getDuLieuPhanLoai(id);
  }
  // cập nhật tên sản phẩm
  updateTenSanPham(tenSanPham: string, index: number): void {
    this.isChanged = true;
    let resultCheck = false;
    const result = sessionStorage.getItem(this.keySession);
    this.listOfDetailPl = JSON.parse(result as string);
    //tạo 1 biến lưu phần tử check
    const item = this.danhSachGocPopupPhanLoai[index];
    // kiểm tra sự tồn tại của sản phẩm trong danh sách chi tiết
    for (let i = 0; i < this.listOfDetailPl.length; i++) {
      if (tenSanPham === this.listOfDetailPl[i].tenSanPham) {
        // console.log({ tenSP: tenSanPham, tenSPtrongDS: this.listOfDetailPl[i].tenSanPham, indexs: i });
        this.openPopupNoti('Sản phẩm đã tồn tại');
        this.resultChiTietSanPhamTiepNhans[index].tenSanPham = '';
        resultCheck = true;
        break;
      }
    }
    setTimeout(() => {
      if (resultCheck === false) {
        this.listOfDetailPl.push(item);
        sessionStorage.setItem(this.keySession, JSON.stringify(this.listOfDetailPl));
        // console.log('them san pham vao session: ', this.listOfDetailPl);
      }
    }, 500);
  }
  //Cập nhật thông tin trong popup phân loại
  updatePopupPhanLoai(index: number): void {
    this.isChanged = true;

    const item = this.resultChiTietSanPhamTiepNhans[index];
    item.slTiepNhan = Number(item.slDoiMoi ?? 0) + Number(item.slSuaChua ?? 0) + Number(item.slKhongBaoHanh ?? 0);

    // Đồng bộ với danhSachGocPopupPhanLoai
    const matched = this.danhSachGocPopupPhanLoai.find(d => d.id === item.id || d.tenSanPham === item.tenSanPham);
    if (matched) {
      matched.slDoiMoi = item.slDoiMoi;
      matched.slSuaChua = item.slSuaChua;
      matched.slKhongBaoHanh = item.slKhongBaoHanh;
      matched.slTiepNhan = item.slTiepNhan;
    }

    // Tính lại tổng tiếp nhận
    this.donBaoHanh.slTiepNhan = this.resultChiTietSanPhamTiepNhans.reduce((tong: number, sp: any) => {
      const doiMoi = typeof sp.slDoiMoi === 'number' ? sp.slDoiMoi : Number(sp.slDoiMoi) || 0;
      const suaChua = typeof sp.slSuaChua === 'number' ? sp.slSuaChua : Number(sp.slSuaChua) || 0;
      const khongBH = typeof sp.slKhongBaoHanh === 'number' ? sp.slKhongBaoHanh : Number(sp.slKhongBaoHanh) || 0;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/restrict-plus-operands
      return tong + doiMoi + suaChua + khongBH;
    }, 0);
  }

  // xacNhanPhanLoai(): void {
  //   const today = dayjs().startOf('second');
  //   this.themMoiPhanLoaiChiTietTiepNhan = [];
  //   this.chiTietDonBaoHanh = [];
  //   // xử lý dữ liệu để lưu vào DB
  //   // loại bỏ các phẩn tử không có tên sản phẩm
  //   this.resultChiTietSanPhamTiepNhans = this.resultChiTietSanPhamTiepNhans.filter(item => item.tenSanPham !== '');
  //   //cập nhật thông tin sản phẩm trong chi tiết sản phẩm tiếp nhận
  //   for (let i = 0; i < this.resultChiTietSanPhamTiepNhans.length; i++) {
  //     for (let j = 0; j < this.danhSachSanPham.length; j++) {
  //       if (this.resultChiTietSanPhamTiepNhans[i].tenSanPham === this.danhSachSanPham[j].name) {
  //         const item: IChiTietSanPhamTiepNhan = {
  //           id: this.resultChiTietSanPhamTiepNhans[i].id,
  //           soLuongKhachHang: this.resultChiTietSanPhamTiepNhans[i].slKhachGiao,
  //           idKho: '0',
  //           idBienBan: '0',
  //           tongLoiKiThuat: 0,
  //           tongLoiLinhDong: 0,
  //           ngayPhanLoai: today,
  //           slTiepNhan: this.resultChiTietSanPhamTiepNhans[i].slTiepNhan,
  //           slTon: 0,
  //           tinhTrangBaoHanh: '',
  //           trangThaiIn: null,
  //           sanPham: this.danhSachSanPham[j],
  //           donBaoHanh: this.donBaoHanh,
  //         };
  //         if (this.resultChiTietSanPhamTiepNhans[i].tinhTrangBaoHanh) {
  //           item.tinhTrangBaoHanh = 'true';
  //         } else {
  //           item.tinhTrangBaoHanh = 'false';
  //         }
  //         this.chiTietDonBaoHanh.push(item);
  //         break;
  //       }
  //     }
  //   }
  //   //cập nhật thông tin đơn bảo hành
  //   if (this.isChanged === true) {
  //     if (confirm('Xác nhận lưu sự thay đổi ?') === true) {
  //       this.http.put<any>(`${this.updateDonBaoHanhUrl}`, this.donBaoHanh).subscribe(() => {
  //         // cập nhật thông tin chi tiết sản phẩm tiếp nhận
  //         this.http.put<any>(this.putChiTietSanPhamTiepNhanUrl, this.chiTietDonBaoHanh).subscribe(res => {
  //           // console.log('check ket qua chi tiet phan loaij: ', res);
  //           // tạo danh sách phân loại sau khi cập nhật thông tin chi tiết sản phẩm tiếp nhận
  //           setTimeout(() => {
  //             for (let i = 0; i < res.length; i++) {
  //               for (let k = 0; k < this.danhSachTinhTrangs.length; k++) {
  //                 // trường hợp đổi mới
  //                 if (this.danhSachTinhTrangs[k].id === 1) {
  //                   const item1: IPhanLoaiChiTietTiepNhan = {
  //                     id: 0,
  //                     soLuong: this.resultChiTietSanPhamTiepNhans[i].slDoiMoi,
  //                     chiTietSanPhamTiepNhan: res[i],
  //                     danhSachTinhTrang: this.danhSachTinhTrangs[k],
  //                   };
  //                   this.themMoiPhanLoaiChiTietTiepNhan.push(item1);
  //                 }
  //                 // trường hợp sửa chữa
  //                 if (this.danhSachTinhTrangs[k].id === 2) {
  //                   const item1: IPhanLoaiChiTietTiepNhan = {
  //                     id: 0,
  //                     soLuong: this.resultChiTietSanPhamTiepNhans[i].slSuaChua,
  //                     chiTietSanPhamTiepNhan: res[i],
  //                     danhSachTinhTrang: this.danhSachTinhTrangs[k],
  //                   };
  //                   this.themMoiPhanLoaiChiTietTiepNhan.push(item1);
  //                 }
  //                 //trường hợp không bảo hành
  //                 if (this.danhSachTinhTrangs[k].id === 3) {
  //                   const item1: IPhanLoaiChiTietTiepNhan = {
  //                     id: 0,
  //                     soLuong: this.resultChiTietSanPhamTiepNhans[i].slKhongBaoHanh,
  //                     chiTietSanPhamTiepNhan: res[i],
  //                     danhSachTinhTrang: this.danhSachTinhTrangs[k],
  //                   };
  //                   this.themMoiPhanLoaiChiTietTiepNhan.push(item1);
  //                 }
  //               }
  //             }
  //             this.http.put<any>(this.putPhanLoaiChiTietTiepNhanUrl, this.themMoiPhanLoaiChiTietTiepNhan).subscribe(() => {
  //               this.isChanged = false;
  //               setTimeout(() => {
  //                 console.log('Chi tiet don bao hanh: ', this.chiTietDonBaoHanh);
  //                 console.log('Phan loai chi tiet don hang tiep nhan: ', this.themMoiPhanLoaiChiTietTiepNhan);
  //                 this.openPopupNoti('Hoàn thành phân loại');
  //                 window.location.reload();
  //               }, 500);
  //             });
  //           }, 500);
  //         });
  //       });
  //     }
  //   } else {
  //     this.http.put<any>(`${this.updateDonBaoHanhUrl}`, this.donBaoHanh).subscribe(() => {
  //       setTimeout(() => {
  //         this.openPopupNoti('Hoàn thành phân loại');
  //         window.location.reload();
  //       }, 1000);
  //     });
  //   }
  // }
  searchInPopupPhanLoai(): void {
    if (!this.searchKey || this.searchKey.trim() === '') {
      this.resultChiTietSanPhamTiepNhans = [...this.danhSachGocPopupPhanLoai];
      return;
    }

    this.resultChiTietSanPhamTiepNhans = this.danhSachGocPopupPhanLoai.filter(a => a.tenSanPham.includes(this.searchKey));
  }

  // // cập nhật tiến độ phân loại
  // deleteRowPopupPhanLoai(id: any): void {
  //   this.isChanged = true;
  //   if (confirm('Bạn chắc chắn muốn xóa thông số này?') === true) {
  //     this.donBaoHanh.slTiepNhan = 0;
  //     // cập nhật lại danh sách chi tiết đơn bảo hành
  //     this.resultChiTietSanPhamTiepNhans = this.resultChiTietSanPhamTiepNhans.filter((d: any) => d.id !== id);
  //     this.danhSachGocPopupPhanLoai = this.danhSachGocPopupPhanLoai.filter((d: any) => d.id !== id);
  //     this.http.delete(`${this.deleteDetailDonBaoHanhUrl}/${id as number}`).subscribe(() => {
  //       console.log('xóa thành công');
  //     });
  //     // cập nhật lại tổng số lượng tiếp nhận
  //     for (let i = 0; i < this.resultChiTietSanPhamTiepNhans.length; i++) {
  //       this.donBaoHanh.slTiepNhan =
  //         Number(this.donBaoHanh.slTiepNhan) +
  //         Number(this.resultChiTietSanPhamTiepNhans[i].slDoiMoi) +
  //         Number(this.resultChiTietSanPhamTiepNhans[i].slSuaChua) +
  //         Number(this.resultChiTietSanPhamTiepNhans[i].slKhongBaoHanh);
  //     }
  //   }
  // }

  addRow(context: 'phanLoai' | 'taoDon'): void {
    this.isChanged = true;
    this.idAddRow++;

    const newRow = {
      id: this.idAddRow,
      tenSanPham: '',
      donVi: '',
      slKhachGiao: 0,
      slTiepNhanTong: 0,
      slTiepNhan: 0,
      slNhan: 0,
      slDoiMoi: 0,
      slSuaChua: 0,
      slKhongBaoHanh: 0,
      chiTietSanPhamTiepNhan: null,
    };

    // Chỉ thêm vào đúng mảng theo ngữ cảnh
    if (context === 'phanLoai') {
      this.danhSachGocPopupPhanLoai.push({ ...newRow });
    } else if (context === 'taoDon') {
      this.resultChiTietSanPhamTiepNhans.push({ ...newRow });
      this.themMoiDonBaoHanh.push({ ...newRow });
    }
  }
  //chinh co chu khi in
  onFontSizeChange(): void {
    // Áp dụng font size ngay lập tức cho preview
    const bbtnElement = document.getElementById('BBTN');
    if (bbtnElement) {
      bbtnElement.style.fontSize = this.selectedFontSize;
    }
  }

  //tích phân loại nhanh
  phanLoaiCheckAll(): void {
    this.isChanged = true;
    this.checkAll = !this.checkAll;
    for (let i = 0; i < this.resultChiTietSanPhamTiepNhans.length; i++) {
      this.resultChiTietSanPhamTiepNhans[i].tinhTrangBaoHanh = this.checkAll;
    }
    if (this.checkAll === true) {
      this.tienDo = 100;
      this.getColor(this.tienDo, 'donBaoHanh');
      this.countItem = this.resultChiTietSanPhamTiepNhans.length;
      sessionStorage.setItem(`TiepNhan ${this.donBaoHanh.id as string}`, JSON.stringify(this.resultChiTietSanPhamTiepNhans));
      this.donBaoHanh.trangThai = 'Chờ phân tích';
    }
    if (this.checkAll === false) {
      this.tienDo = 0;
      this.countItem = 0;
      this.getColor(this.tienDo, 'donBaoHanh');
      sessionStorage.setItem(`TiepNhan ${this.donBaoHanh.id as string}`, JSON.stringify(this.resultChiTietSanPhamTiepNhans));
      this.donBaoHanh.trangThai = 'Chờ phân loại';
    }
    // console.log(this.resultChiTietSanPhamTiepNhans);
  }
  updateSignalPhanLoai(index: any): void {
    this.isChanged = true;
    this.donBaoHanh.trangThai = 'Đang phân loại';
    if (this.resultChiTietSanPhamTiepNhans[index].tinhTrangBaoHanh === true) {
      this.countItem++;
      this.tienDo = Number(((this.countItem / this.resultChiTietSanPhamTiepNhans.length) * 100).toFixed(2));
      this.getColor(this.tienDo, 'donBaoHanh');
      sessionStorage.setItem(`TiepNhan ${this.donBaoHanh.id as string}`, JSON.stringify(this.resultChiTietSanPhamTiepNhans));
    }
    if (this.resultChiTietSanPhamTiepNhans[index].tinhTrangBaoHanh === false) {
      this.countItem--;
      this.tienDo = Number(((this.countItem / this.resultChiTietSanPhamTiepNhans.length) * 100).toFixed(2));
      this.getColor(this.tienDo, 'donBaoHanh');
      sessionStorage.setItem(`TiepNhan ${this.donBaoHanh.id as string}`, JSON.stringify(this.resultChiTietSanPhamTiepNhans));
    }
    if (this.tienDo === 100) {
      this.donBaoHanh.trangThai = 'Chờ phân tích';
      // console.log(this.resultChiTietSanPhamTiepNhans);
    }
    if (this.tienDo === 0) {
      this.donBaoHanh.trangThai = 'Chờ phân loại';
      // console.log(this.resultChiTietSanPhamTiepNhans);
    }
  }
  //==================================================   Popup biên bản tiếp nhận =====================================================
  openPopupBBTN(id: number): void {
    this.popupInBBTN = true;
    this.navBarComponent.toggleSidebar2();

    // lấy dữ liệu từ sessision
    this.getDuLieuInChinhThuc(id);
  }

  openPopupInBBTNSaveNguoiNhan(id: number, onPrinted?: () => void): void {
    this.maBienBan = '';
    this.popupInBBTNtest = true;
    this.navBarComponent.toggleSidebar2();
    this.loaiBienBan = 'Tiếp nhận';
    this.resultChiTietSanPhamTiepNhans.sort((a, b) => b.slSuaChua - a.slSuaChua);
    console.log(
      'sap xep ',
      this.resultChiTietSanPhamTiepNhans.sort((a, b) => b.slSuaChua - a.slSuaChua)
    );
    for (let i = 0; i < this.danhSachBienBan.length; i++) {
      if (this.loaiBienBan === this.danhSachBienBan[i].loaiBienBan && this.idDonBaoHanh === this.danhSachBienBan[i].donBaoHanh.id) {
        this.maBienBan = this.danhSachBienBan[i].maBienBan;
        //lưu thông tin thêm mới biên bản
        this.themMoiBienBan = this.danhSachBienBan[i];
        // console.log('Cap nhat thong tin bien ban:', this.themMoiBienBan);
      }
    }
    if (this.maBienBan === '') {
      const date = new Date();
      this.year = date.getFullYear().toString().slice(-2);
      const getMonth = date.getMonth() + 1;
      if (getMonth < 10) {
        this.month = `0${getMonth}`;
      } else {
        this.month = getMonth.toString();
      }
      if (date.getDate() < 10) {
        this.date = `0${date.getDate()}`;
      } else {
        this.date = date.getDate().toString();
      }
      if (date.getHours() < 10) {
        this.hours = `0${date.getHours()}`;
      } else {
        this.hours = date.getHours().toString();
      }
      if (date.getMinutes() < 10) {
        this.minutes = `0${date.getMinutes()}`;
      } else {
        this.minutes = date.getMinutes().toString();
      }
      if (date.getSeconds() < 10) {
        this.seconds = `0${date.getSeconds()}`;
      } else {
        this.seconds = date.getSeconds().toString();
      }
      this.maBienBan = `TN${this.date}${this.month}${this.year}${this.hours}${this.minutes}${this.seconds}`;
      this.themMoiBienBan = { id: null, maBienBan: this.maBienBan, loaiBienBan: this.loaiBienBan, soLanIn: 0, donBaoHanh: this.donBaoHanh };
      this.yearTN = this.donBaoHanh?.ngayTiepNhan.substr(2, 2);
      this.monthTN = this.donBaoHanh?.ngayTiepNhan.substr(5, 2);
      this.dateTN = this.donBaoHanh?.ngayTiepNhan.substr(8, 2);
      console.log('ngày', this.dateTN);
      console.log('tháng', this.monthTN);
      console.log('năm', this.yearTN);

      // console.log('them moi bien ban:', this.themMoiBienBan);
    }
    this.resultChiTietSanPhamTiepNhans.sort((a, b) => b.slSuaChua - a.slSuaChua);
    console.log(
      'sap xep ',
      this.resultChiTietSanPhamTiepNhans.sort((a, b) => b.slSuaChua - a.slSuaChua)
    );
    // lấy dữ liệu từ sessision
    this.getDuLieuInTest(id);
    if (onPrinted) {
      this.onPrintedCallback = onPrinted;
    }
  }

  openPopupInBBTNTest(id: number): void {
    this.maBienBan = '';
    this.popupInBBTNtest = true;
    this.navBarComponent.toggleSidebar2();
    this.loaiBienBan = 'Tiếp nhận';
    this.resultChiTietSanPhamTiepNhans.sort((a, b) => b.slSuaChua - a.slSuaChua);
    console.log(
      'sap xep ',
      this.resultChiTietSanPhamTiepNhans.sort((a, b) => b.slSuaChua - a.slSuaChua)
    );
    for (let i = 0; i < this.danhSachBienBan.length; i++) {
      if (this.loaiBienBan === this.danhSachBienBan[i].loaiBienBan && this.idDonBaoHanh === this.danhSachBienBan[i].donBaoHanh.id) {
        this.maBienBan = this.danhSachBienBan[i].maBienBan;
        //lưu thông tin thêm mới biên bản
        this.themMoiBienBan = this.danhSachBienBan[i];
        // console.log('Cap nhat thong tin bien ban:', this.themMoiBienBan);
      }
    }
    if (this.maBienBan === '') {
      const date = new Date();
      this.year = date.getFullYear().toString().slice(-2);
      const getMonth = date.getMonth() + 1;
      if (getMonth < 10) {
        this.month = `0${getMonth}`;
      } else {
        this.month = getMonth.toString();
      }
      if (date.getDate() < 10) {
        this.date = `0${date.getDate()}`;
      } else {
        this.date = date.getDate().toString();
      }
      if (date.getHours() < 10) {
        this.hours = `0${date.getHours()}`;
      } else {
        this.hours = date.getHours().toString();
      }
      if (date.getMinutes() < 10) {
        this.minutes = `0${date.getMinutes()}`;
      } else {
        this.minutes = date.getMinutes().toString();
      }
      if (date.getSeconds() < 10) {
        this.seconds = `0${date.getSeconds()}`;
      } else {
        this.seconds = date.getSeconds().toString();
      }
      this.maBienBan = `TN${this.date}${this.month}${this.year}${this.hours}${this.minutes}${this.seconds}`;
      this.themMoiBienBan = { id: null, maBienBan: this.maBienBan, loaiBienBan: this.loaiBienBan, soLanIn: 0, donBaoHanh: this.donBaoHanh };
      this.yearTN = this.donBaoHanh.ngayTiepNhan.substr(2, 2);
      this.monthTN = this.donBaoHanh.ngayTiepNhan.substr(5, 2);
      this.dateTN = this.donBaoHanh.ngayTiepNhan.substr(8, 2);
      console.log('ngày', this.dateTN);
      console.log('tháng', this.monthTN);
      console.log('năm', this.yearTN);

      // console.log('them moi bien ban:', this.themMoiBienBan);
    }
    this.resultChiTietSanPhamTiepNhans.sort((a, b) => b.slSuaChua - a.slSuaChua);
    console.log(
      'sap xep ',
      this.resultChiTietSanPhamTiepNhans.sort((a, b) => b.slSuaChua - a.slSuaChua)
    );
    // lấy dữ liệu từ sessision
    this.getDuLieuInTest(id);
  }

  closePopupInBBTNTest(): void {
    this.popupInBBTNtest = false;
  }
  openPopupInBBTN1(): void {
    this.maBienBan = '';
    this.loaiBienBan = 'Tiếp nhận';
    for (let i = 0; i < this.danhSachBienBan.length; i++) {
      if (this.loaiBienBan === this.danhSachBienBan[i].loaiBienBan && this.idDonBaoHanh === this.danhSachBienBan[i].donBaoHanh.id) {
        this.maBienBan = this.danhSachBienBan[i].maBienBan;
        //lưu thông tin thêm mới biên bản
        this.themMoiBienBan = this.danhSachBienBan[i];
        // console.log('Cap nhat thong tin bien ban:', this.themMoiBienBan);
      }
    }
    if (this.maBienBan === '') {
      const date = new Date();
      this.year = date.getFullYear().toString().slice(-2);
      const getMonth = date.getMonth() + 1;
      if (getMonth < 10) {
        this.month = `0${getMonth}`;
      } else {
        this.month = getMonth.toString();
      }
      if (date.getDate() < 10) {
        this.date = `0${date.getDate()}`;
      } else {
        this.date = date.getDate().toString();
      }
      if (date.getHours() < 10) {
        this.hours = `0${date.getHours()}`;
      } else {
        this.hours = date.getHours().toString();
      }
      if (date.getMinutes() < 10) {
        this.minutes = `0${date.getMinutes()}`;
      } else {
        this.minutes = date.getMinutes().toString();
      }
      if (date.getSeconds() < 10) {
        this.seconds = `0${date.getSeconds()}`;
      } else {
        this.seconds = date.getSeconds().toString();
      }
      this.maBienBan = `TN${this.date}${this.month}${this.year}${this.hours}${this.minutes}${this.seconds}`;
      this.themMoiBienBan = { id: null, maBienBan: this.maBienBan, loaiBienBan: this.loaiBienBan, soLanIn: 0, donBaoHanh: this.donBaoHanh };
      // console.log('them moi bien ban:', this.themMoiBienBan);
    }
    this.popupInBBTN1 = true;
  }

  openPopupInBBTN2(): void {
    this.maBienBan = '';
    this.loaiBienBan = 'Tiếp nhận';
    for (let i = 0; i < this.danhSachBienBan.length; i++) {
      if (this.loaiBienBan === this.danhSachBienBan[i].loaiBienBan && this.idDonBaoHanh === this.danhSachBienBan[i].donBaoHanh.id) {
        this.maBienBan = this.danhSachBienBan[i].maBienBan;
        //lưu thông tin thêm mới biên bản
        this.themMoiBienBan = this.danhSachBienBan[i];
        // console.log('Cap nhat thong tin bien ban:', this.themMoiBienBan);
      }
    }
    if (this.maBienBan === '') {
      const date = new Date();
      this.year = date.getFullYear().toString().slice(-2);
      const getMonth = date.getMonth() + 1;
      if (getMonth < 10) {
        this.month = `0${getMonth}`;
      } else {
        this.month = getMonth.toString();
      }
      if (date.getDate() < 10) {
        this.date = `0${date.getDate()}`;
      } else {
        this.date = date.getDate().toString();
      }
      if (date.getHours() < 10) {
        this.hours = `0${date.getHours()}`;
      } else {
        this.hours = date.getHours().toString();
      }
      if (date.getMinutes() < 10) {
        this.minutes = `0${date.getMinutes()}`;
      } else {
        this.minutes = date.getMinutes().toString();
      }
      if (date.getSeconds() < 10) {
        this.seconds = `0${date.getSeconds()}`;
      } else {
        this.seconds = date.getSeconds().toString();
      }
      this.maBienBan = `TN${this.date}${this.month}${this.year}${this.hours}${this.minutes}${this.seconds}`;
      this.themMoiBienBan = { id: null, maBienBan: this.maBienBan, loaiBienBan: this.loaiBienBan, soLanIn: 0, donBaoHanh: this.donBaoHanh };
      // console.log('them moi bien ban:', this.themMoiBienBan);
    }
    this.popupInBBTN2 = true;
  }

  openPopupInBBTN3(): void {
    this.maBienBan = '';
    this.loaiBienBan = 'Tiếp nhận';
    for (let i = 0; i < this.danhSachBienBan.length; i++) {
      if (this.loaiBienBan === this.danhSachBienBan[i].loaiBienBan && this.idDonBaoHanh === this.danhSachBienBan[i].donBaoHanh.id) {
        this.maBienBan = this.danhSachBienBan[i].maBienBan;
        //lưu thông tin thêm mới biên bản
        this.themMoiBienBan = this.danhSachBienBan[i];
        // console.log('Cap nhat thong tin bien ban:', this.themMoiBienBan);
      }
    }
    if (this.maBienBan === '') {
      const date = new Date();
      this.year = date.getFullYear().toString().slice(-2);
      const getMonth = date.getMonth() + 1;
      if (getMonth < 10) {
        this.month = `0${getMonth}`;
      } else {
        this.month = getMonth.toString();
      }
      if (date.getDate() < 10) {
        this.date = `0${date.getDate()}`;
      } else {
        this.date = date.getDate().toString();
      }
      if (date.getHours() < 10) {
        this.hours = `0${date.getHours()}`;
      } else {
        this.hours = date.getHours().toString();
      }
      if (date.getMinutes() < 10) {
        this.minutes = `0${date.getMinutes()}`;
      } else {
        this.minutes = date.getMinutes().toString();
      }
      if (date.getSeconds() < 10) {
        this.seconds = `0${date.getSeconds()}`;
      } else {
        this.seconds = date.getSeconds().toString();
      }
      this.maBienBan = `TN${this.date}${this.month}${this.year}${this.hours}${this.minutes}${this.seconds}`;
      this.themMoiBienBan = { id: null, maBienBan: this.maBienBan, loaiBienBan: this.loaiBienBan, soLanIn: 0, donBaoHanh: this.donBaoHanh };
      // console.log('them moi bien ban:', this.themMoiBienBan);
    }
    this.popupInBBTN3 = true;
  }

  openPopupInBBTN4(): void {
    console.log('[DEBUG] openPopupInBBTN4, idDonBaoHanh=', this.idDonBaoHanh);
    this.maBienBan = '';
    this.loaiBienBan = 'Tiếp nhận';
    for (let i = 0; i < this.danhSachBienBan.length; i++) {
      if (this.loaiBienBan === this.danhSachBienBan[i].loaiBienBan && this.idDonBaoHanh === this.danhSachBienBan[i].donBaoHanh.id) {
        this.maBienBan = this.danhSachBienBan[i].maBienBan;
        //lưu thông tin thêm mới biên bản
        this.themMoiBienBan = this.danhSachBienBan[i];
        // console.log('Cap nhat thong tin bien ban:', this.themMoiBienBan);
      }
    }
    if (this.maBienBan === '') {
      const date = new Date();
      this.year = date.getFullYear().toString().slice(-2);
      const getMonth = date.getMonth() + 1;
      if (getMonth < 10) {
        this.month = `0${getMonth}`;
      } else {
        this.month = getMonth.toString();
      }
      if (date.getDate() < 10) {
        this.date = `0${date.getDate()}`;
      } else {
        this.date = date.getDate().toString();
      }
      if (date.getHours() < 10) {
        this.hours = `0${date.getHours()}`;
      } else {
        this.hours = date.getHours().toString();
      }
      if (date.getMinutes() < 10) {
        this.minutes = `0${date.getMinutes()}`;
      } else {
        this.minutes = date.getMinutes().toString();
      }
      if (date.getSeconds() < 10) {
        this.seconds = `0${date.getSeconds()}`;
      } else {
        this.seconds = date.getSeconds().toString();
      }
      this.maBienBan = `TN${this.date}${this.month}${this.year}${this.hours}${this.minutes}${this.seconds}`;
      this.themMoiBienBan = { id: null, maBienBan: this.maBienBan, loaiBienBan: this.loaiBienBan, soLanIn: 0, donBaoHanh: this.donBaoHanh };
      // console.log('them moi bien ban:', this.themMoiBienBan);
    }
    this.popupInBBTN4 = true;
  }

  closePopupBBTN(): void {
    this.popupInBBTN = false;
  }

  closePopupBBTN1(): void {
    this.popupInBBTN1 = false;
  }

  closePopupBBTN2(): void {
    this.popupInBBTN2 = false;
  }

  closePopupBBTN3(): void {
    this.popupInBBTN3 = false;
  }

  closePopupBBTN4(): void {
    this.popupInBBTN4 = false;
  }

  xacNhanInBienBan(): void {
    this.themMoiBienBan.soLanIn++;
    this.donBaoHanh.trangThaiIn = 'Đã in';
    if (this.donBaoHanh.ngaykhkb) {
      const date = new Date(this.donBaoHanh.ngaykhkb);
      this.donBaoHanh.ngaykhkb = date.toISOString();
    }
    forkJoin([
      this.http.put<any>(this.updateDonBaoHanhUrl, this.donBaoHanh),
      this.http.post<any>(this.postMaBienBanUrl, this.themMoiBienBan),
    ]).subscribe({
      next: ([putRes, postRes]) => {
        console.log('Cập nhật trạng thái in và tạo biên bản thành công');
        this.getDanhSachBienBan();
        this.popupInBBTN1 = false;
        this.popupInBBTN2 = false;
        this.popupInBBTN3 = false;
        this.popupInBBTN4 = false;
      },
      error: err => {
        console.error(err);
      },
    });

    console.log('test', this.donBaoHanh.trangThaiIn);
  }
  // xacNhanInBienBan(): void {
  //   const element = document.getElementById('BBTN');
  //   if (element) {
  //     element.classList.remove('font-size-12px', 'font-size-14px', 'font-size-16px', 'font-size-18px', 'font-size-20px');
  //     element.classList.add(`font-size-${this.selectedFontSize}`);
  //   }

  //   this.customPrintSafe();
  // }

  // // Phiên bản an toàn với CSP
  // async customPrintSafe(): Promise<void> {
  //   const printElement = document.getElementById('BBTN');
  //   if (!printElement) {
  //     return;
  //   }

  //   try {
  //     const printHTML = await this.generatePrintHTML(printElement); // Thêm await
  //     const blob = new Blob([printHTML], { type: 'text/html' });
  //     const blobUrl = URL.createObjectURL(blob);

  //     // Phần còn lại giữ nguyên...
  //     const printWindow = window.open(blobUrl, '_blank');
  //     if (!printWindow) {
  //       console.error('Không thể mở cửa sổ in');
  //       return;
  //     }

  //     printWindow.onload = () => {
  //       setTimeout(() => {
  //         printWindow.focus();
  //         printWindow.print();

  //         setTimeout(() => {
  //           if (confirm('Bạn đã in thành công? Cập nhật trạng thái in?')) {
  //             this.updateAfterPrint();
  //           }
  //           printWindow.close();
  //           URL.revokeObjectURL(blobUrl);
  //         }, 1000);
  //       }, 100);
  //     };

  //     setTimeout(() => {
  //       if (printWindow.document.readyState === 'complete') {
  //         printWindow.focus();
  //         printWindow.print();
  //       }
  //     }, 500);
  //   } catch (error) {
  //     console.error('Lỗi khi in:', error);
  //     await this.customPrintFallback(); // Thêm await
  //   }
  // }

  // // Fallback method sử dụng iframe
  // async customPrintFallback(): Promise<void> {
  //   const printElement = document.getElementById('BBTN');
  //   if (!printElement) {
  //     return;
  //   }

  //   try {
  //     // Tạo iframe ẩn
  //     const iframe = document.createElement('iframe');
  //     iframe.style.position = 'absolute';
  //     iframe.style.left = '-9999px';
  //     iframe.style.width = '0';
  //     iframe.style.height = '0';
  //     iframe.style.border = '0';
  //     document.body.appendChild(iframe);

  //     // Tạo nội dung HTML để in
  //     const printHTML = await this.generatePrintHTML(printElement);

  //     // Dùng srcdoc thay cho document.write (không cần TrustedTypes)
  //     iframe.srcdoc = printHTML;

  //     iframe.onload = () => {
  //       if (iframe.contentWindow) {
  //         iframe.contentWindow.focus();
  //         iframe.contentWindow.print();

  //         setTimeout(() => {
  //           if (confirm('Bạn đã in thành công? Cập nhật trạng thái in?')) {
  //             this.updateAfterPrint();
  //           }
  //           document.body.removeChild(iframe);
  //         }, 1000);
  //       }
  //     };
  //   } catch (error) {
  //     console.error('Lỗi fallback print:', error);
  //   }
  // }

  // async processImagesForPrint(element: HTMLElement): Promise<void> {
  //   const images = element.querySelectorAll('img');

  //   for (const img of Array.from(images)) {
  //     try {
  //       const originalSrc = img.getAttribute('src') ?? '';
  //       console.log('Original src:', originalSrc);

  //       if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
  //         continue; // Đã là absolute URL hoặc data URL
  //       }

  //       // Tạo absolute URL
  //       let absoluteUrl: string;
  //       if (originalSrc.startsWith('/')) {
  //         absoluteUrl = window.location.origin + originalSrc;
  //       } else {
  //         // Với relative path như ../../../../content/images/logoRD.png
  //         absoluteUrl = this.getAbsoluteImagePath(originalSrc);
  //       }

  //       console.log('Trying absolute URL:', absoluteUrl);

  //       // Thử load ảnh trực tiếp trước
  //       const testImg = new Image();
  //       testImg.crossOrigin = 'anonymous';

  //       await new Promise((resolve, reject) => {
  //         testImg.onload = () => resolve(testImg);
  //         testImg.onerror = () => reject(new Error('Cannot load'));
  //         testImg.src = absoluteUrl;
  //       });

  //       // Nếu load được thì convert sang base64
  //       const base64 = await this.imageToBase64(absoluteUrl);
  //       img.src = base64;
  //       console.log('Successfully converted to base64');
  //     } catch (error) {
  //       console.warn('Error processing image:', error);
  //       // Fallback: set absolute URL trực tiếp
  //       const originalSrc = img.getAttribute('src') ?? '';
  //       if (!originalSrc.startsWith('http') && !originalSrc.startsWith('data:')) {
  //         img.src = this.getAbsoluteImagePath(originalSrc);
  //       }
  //     }
  //   }
  // }
  // getAbsoluteImagePath(relativePath: string): string {
  //   // Tạo absolute path từ window location
  //   const baseUrl = window.location.origin;
  //   // Loại bỏ các ../ và tạo path đúng
  //   const cleanPath = relativePath.replace(/\.\.\//g, '').replace(/\.\//g, '');
  //   return `${baseUrl}/${cleanPath}`;
  // }
  // async processImage(img: HTMLImageElement): Promise<void> {
  //   try {
  //     const originalSrc = img.src;
  //     console.log('Processing image with src:', originalSrc);

  //     // Nếu đã là data URL thì không cần xử lý
  //     if (originalSrc.startsWith('data:')) {
  //       return;
  //     }

  //     // Xử lý tất cả các loại path
  //     let absoluteUrl: string;

  //     if (originalSrc.startsWith('http://') || originalSrc.startsWith('https://')) {
  //       absoluteUrl = originalSrc;
  //     } else {
  //       // Tạo absolute URL từ relative path
  //       absoluteUrl = new URL(originalSrc, window.location.href).href;
  //     }

  //     console.log('Absolute URL:', absoluteUrl);

  //     try {
  //       const base64 = await this.imageToBase64(absoluteUrl);
  //       img.src = base64;
  //       console.log('Successfully converted to base64');
  //     } catch (e) {
  //       console.warn('Không thể chuyển ảnh thành base64:', e);
  //       // Fallback: sử dụng absolute URL
  //       img.src = absoluteUrl;
  //       console.log('Using absolute URL as fallback');
  //     }
  //   } catch (error) {
  //     console.error('Lỗi xử lý ảnh:', error, 'Original src:', img.src);
  //   }
  // }
  // imageToBase64(src: string): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();

  //     // Bỏ crossOrigin cho local images
  //     if (!src.startsWith('http')) {
  //       // img.crossOrigin = 'anonymous'; // Bỏ dòng này
  //     } else {
  //       img.crossOrigin = 'anonymous';
  //     }

  //     img.onload = () => {
  //       try {
  //         const canvas = document.createElement('canvas');
  //         const ctx = canvas.getContext('2d');

  //         if (!ctx) {
  //           reject(new Error('Cannot get canvas context'));
  //           return;
  //         }

  //         canvas.width = img.naturalWidth;
  //         canvas.height = img.naturalHeight;

  //         ctx.drawImage(img, 0, 0);

  //         const dataURL = canvas.toDataURL('image/png');
  //         resolve(dataURL);
  //       } catch (e) {
  //         console.error('Canvas error:', e);
  //         reject(e);
  //       }
  //     };

  //     img.onerror = error => {
  //       console.error('Image load error:', error, 'src:', src);
  //       reject(new Error(`Cannot load image: ${src}`));
  //     };

  //     img.src = src;
  //   });
  // }
  // async generatePrintHTML(printElement: HTMLElement): Promise<string> {
  //   const clonedElement = printElement.cloneNode(true) as HTMLElement;

  //   // Lấy nguyên nội dung head (có link styles.[hash].css do Angular build)
  //   const headContent = document.head.innerHTML;

  //   // Xử lý ảnh cho chắc ăn
  //   await this.processImagesForPrint(clonedElement);

  //   return `
  // <!DOCTYPE html>
  // <html>
  // <head>
  //   <meta charset="UTF-8">
  //   ${headContent}
  //   <style>
  //     @page { size: A4; margin: 1cm; }
  //     body { margin: 20px; font-family: Arial, sans-serif; line-height: 1.4; }
  //   </style>
  // </head>
  // <body>
  //   ${clonedElement.outerHTML}
  // </body>
  // </html>
  // `;
  // }

  // // Phiên bản an toàn hơn để lấy styles
  // getAllStylesSafe(): string {
  //   let styles = '';

  //   try {
  //     // Lấy tất cả stylesheets
  //     for (let i = 0; i < document.styleSheets.length; i++) {
  //       const styleSheet = document.styleSheets[i];
  //       try {
  //         if (styleSheet.href === null) {
  //           // Inline styles
  //           const rules = styleSheet.cssRules || styleSheet.rules;
  //           if (rules) {
  //             for (let j = 0; j < rules.length; j++) {
  //               if (rules[j].cssText) {
  //                 styles += rules[j].cssText + '\n';
  //               }
  //             }
  //           }
  //         } else {
  //           // External stylesheets - chỉ link đến same-origin
  //           if (
  //             styleSheet.href.startsWith(window.location.origin) ||
  //             styleSheet.href.startsWith('/') ||
  //             styleSheet.href.includes('googleapis.com')
  //           ) {
  //             styles += `<link rel="stylesheet" href="${styleSheet.href}">\n`;
  //           }
  //         }
  //       } catch (e) {
  //         // Bỏ qua CORS errors
  //         if (styleSheet.href) {
  //           styles += `<link rel="stylesheet" href="${styleSheet.href}">\n`;
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.warn('Error getting styles:', error);
  //   }

  //   return styles ? `<style>${styles}</style>` : '';
  // }

  // updateAfterPrint(): void {
  //   this.themMoiBienBan.soLanIn++;
  //   this.donBaoHanh.trangThaiIn = 'Đã in';

  //   // Gửi biên bản
  //   this.http.post<any>(this.postMaBienBanUrl, this.themMoiBienBan).subscribe(res => {
  //     this.getDanhSachBienBan();

  //     if (this.onPrintedCallback) {
  //       this.onPrintedCallback();
  //       this.onPrintedCallback = undefined;
  //     }

  //     this.closeAllPopups();
  //   });

  //   // Cập nhật đơn bảo hành
  //   this.http.put<any>(this.updateDonBaoHanhUrl, this.donBaoHanh).subscribe(() => {
  //     this.http.get<any[]>('api/tiep-nhan').subscribe((res: any[]) => {
  //       const idx = this.donBaoHanhs.findIndex(d => d.id === this.selectedRowData.id);
  //       if (idx > -1) {
  //         this.donBaoHanhs[idx].nguoiNhan = this.selectedRowData.nguoiNhan;
  //         this.angularGrid?.dataView.updateItem(this.selectedRowData.id, this.donBaoHanhs[idx]);
  //         this.angularGrid?.slickGrid.invalidate();
  //         this.angularGrid?.slickGrid.render();
  //       }
  //     });
  //   });
  // }

  // closeAllPopups(): void {
  //   this.popupInBBTN1 = false;
  //   this.popupInBBTN2 = false;
  //   this.popupInBBTN3 = false;
  //   this.popupInBBTN4 = false;
  // }
  //--------------------------------------------------- import file --------------------------------------------------------
  ReadExcel(event: any): void {
    this.ExcelData = [];
    this.donBaoHanh.slTiepNhan = 0;
    this.donBaoHanh.nhanVienGiaoHang = '';

    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = () => {
      const workBook = XLSX.read(fileReader.result, { type: 'binary' });
      const sheet = workBook.Sheets[workBook.SheetNames[0]];

      // Bước 1: Đọc dòng tiêu đề thật
      const sheetRaw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const excelHeaders = sheetRaw[0] as string[];

      const headerMapping: { [key: string]: string } = {
        'Mã Sản phẩm': 'maSanPham',
        'Tên sản phẩm': 'tenSanPham',
        'SL KH giao': 'slKhachGiao',
        'SL nhận': 'slNhan',
        'Đổi mới': 'slDoiMoi',
        'Sửa chữa': 'slSuaChua',
        'Không BH': 'slKhongBaoHanh',
      };

      const requiredExcelHeaders = Object.keys(headerMapping);
      const normalizedHeaders = excelHeaders.map(h => h.trim().toLowerCase());
      const missingHeaders = requiredExcelHeaders.filter(h => !normalizedHeaders.includes(h.trim().toLowerCase()));

      if (missingHeaders.length > 0) {
        this.openPopupNoti(`File Excel thiếu các cột: ${missingHeaders.join(', ')}. Vui lòng kiểm tra lại.`);
        return;
      }

      // Bước 2: Đọc dữ liệu và ánh xạ tên cột
      const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const mappedData = rawData.map((row: any) => {
        const normalizedRow: Record<string, any> = {};
        Object.keys(row).forEach(k => {
          normalizedRow[k.trim().toLowerCase()] = row[k];
        });

        const mappedRow: Record<string, string | number> = {};
        Object.entries(headerMapping).forEach(([excelKey, internalKey]) => {
          const key = excelKey.trim().toLowerCase();
          mappedRow[internalKey] = normalizedRow[key] ?? '';
        });

        return mappedRow;
      });

      if (mappedData.length === 0) {
        this.openPopupNoti('File Excel không có dữ liệu. Vui lòng kiểm tra lại.');
        return;
      }

      // Bước 3: Lọc và xử lý dữ liệu
      this.ExcelData = mappedData.filter((data: any) => data.slKhachGiao !== '' && data.tenSanPham !== 'Tên sản phẩm');

      for (const item of this.ExcelData) {
        item.sanPham = null;
        for (const sp of this.danhSachSanPham) {
          if (item.tenSanPham === sp.name) {
            item.sanPham = sp;
            break;
          }
        }

        item.slSuaChua = item.slSuaChua === '' ? 0 : Number(item.slSuaChua);
        item.slKhongBaoHanh = item.slKhongBaoHanh === '' ? 0 : Number(item.slKhongBaoHanh);
        item.slDoiMoi = item.slDoiMoi === '' ? 0 : Number(item.slDoiMoi);

        this.themMoiDonBaoHanh.push(item);
        // this.ExcelData = [...this.ExcelData, item];
        const tong = Number(item.slDoiMoi) + Number(item.slSuaChua) + Number(item.slKhongBaoHanh);
        this.donBaoHanh.slTiepNhan += tong;
      }
    };
  }

  openPopupNoti(message: string, reloadAfter?: boolean): void {
    this.popupMessage = message;
    this.isPopupVisible = true;
    this.shouldReloadAfterPopup = reloadAfter ?? false;
    document.getElementById('popupNoti')!.style.display = 'block';
  }
  closePopupNoti(): void {
    this.isPopupVisible = false;
    document.getElementById('popupNoti')!.style.display = 'none';
    if (this.shouldReloadAfterPopup) {
      window.location.reload();
    }
  }

  confirmDeleteDeletePhanLoai(): void {
    // tính lại số liệu
    this.isChanged = true;
    const deleted = this.resultChiTietSanPhamTiepNhans.splice(this.indexToDelete, 1)[0];
    if (deleted?.id) {
      this.idsToDelete.push(deleted.id);
    }

    // đồng bộ chiTietDonBaoHanh và tổng tiếp nhận
    this.chiTietDonBaoHanh = [...this.resultChiTietSanPhamTiepNhans];
    const data = this.chiTietDonBaoHanh as Array<{
      slDoiMoi?: number;
      slSuaChua?: number;
      slKhongBaoHanh?: number;
    }>;

    // gọi reduce với generic <number> và sum có kiểu number
    this.donBaoHanh.slTiepNhan = data.reduce<number>(
      (sum, it) =>
        sum +
        (it.slDoiMoi ?? 0) + // dùng ?? tránh lỗi khi slDoiMoi = 0
        (it.slSuaChua ?? 0) +
        (it.slKhongBaoHanh ?? 0),
      0
    );

    // cập nhật lại grid Slickgrid
    const idx = this.donBaoHanhs.findIndex(d => d.id === this.donBaoHanh.id);
    if (idx > -1) {
      this.donBaoHanhs[idx].slTiepNhan = this.donBaoHanh.slTiepNhan;
      // DataView API
      this.angularGrid?.dataView.updateItem(this.donBaoHanh.id, this.donBaoHanhs[idx]);
      this.angularGrid?.slickGrid.invalidate();
      this.angularGrid?.slickGrid.render();

      // Reassign array reference
      // this.donBaoHanhs = [...this.donBaoHanhs];
    }

    this.cdr.detectChanges();

    // đóng popup xóa
    this.isModalOpenConfirmDeletePhanLoai = false;
    this.closeModalConfirmDeletePhanLoai();
  }

  deleteRowPopupPhanLoai(index: number): void {
    this.indexToDelete = index;
    this.isModalOpenConfirmDeletePhanLoai = true;
    document.getElementById('modal-confirm-delete-phan-loai')!.style.display = 'block';
  }
  closeModalConfirmDeletePhanLoai(): void {
    this.isModalOpenConfirmDeletePhanLoai = false;
    document.getElementById('modal-confirm-delete-phan-loai')!.style.display = 'none';
  }

  confirmDelete(): void {
    if (!this.deleteId) {
      return;
    }

    this.http.delete(`${this.deleteDonBaoHanhUrl}/${this.deleteId as number}`).subscribe({
      next: () => {
        try {
          // Cập nhật lại danh sách hiển thị
          this.resultChiTietSanPhamTiepNhans = this.resultChiTietSanPhamTiepNhans.filter((d: any) => d.id !== this.deleteId);
          this.danhSachGocPopupPhanLoai = this.danhSachGocPopupPhanLoai.filter((d: any) => d.id !== this.deleteId);

          // Tính lại số lượng tiếp nhận
          if (this.donBaoHanh) {
            this.donBaoHanh.slTiepNhan = 0;
            for (const item of this.resultChiTietSanPhamTiepNhans) {
              this.donBaoHanh.slTiepNhan += Number(item.slDoiMoi) + Number(item.slSuaChua) + Number(item.slKhongBaoHanh);
            }
          }

          // Đóng modal xác nhận
          this.closeModalConfirm();

          // Hiển thị thông báo và reload
          this.openPopupNoti('Xóa thành công đơn bảo hành', true);
        } catch (e) {
          console.error('Lỗi xử lý sau khi xóa:', e);
          this.openPopupNoti('Xóa thất bại. Vui lòng thử lại.', true);
        }
      },
    });
  }

  closeModalConfirm(): void {
    this.isModalOpenConfirm = false;
    document.getElementById('modal-confirm')!.style.display = 'none';
    this.deleteId = null;
  }

  deleteRow(index: number): void {
    this.indexToDelete = index;
    this.isModalOpenConfirmAdd = true;
    document.getElementById('modal-confirm-add')!.style.display = 'block';
    // console.log('open modal confirm add', this.isModalOpenConfirmAdd);
  }

  confirmDeleteRowAdd(): void {
    this.isChanged = true;
    this.donBaoHanh.slTiepNhan = 0;

    this.themMoiDonBaoHanh.splice(this.indexToDelete, 1);

    for (const item of this.themMoiDonBaoHanh) {
      this.donBaoHanh.slTiepNhan += Number(item.slDoiMoi) + Number(item.slSuaChua) + Number(item.slKhongBaoHanh);
    }

    this.isModalOpenConfirmAdd = false;
    document.getElementById('modal-confirm-add')!.style.display = 'none';
  }

  closeModalConfirmAdd(): void {
    this.isModalOpenConfirmAdd = false;
    document.getElementById('modal-confirm-add')!.style.display = 'none';
  }

  xacNhanPhanLoai(): void {
    const today = dayjs().startOf('second');
    this.themMoiPhanLoaiChiTietTiepNhan = [];
    this.chiTietDonBaoHanh = [];
    this.donBaoHanh.ngaykhkb = today;
    // xử lý dữ liệu để lưu vào DB
    // loại bỏ các phẩn tử không có tên sản phẩm
    this.resultChiTietSanPhamTiepNhans = this.resultChiTietSanPhamTiepNhans.filter(item => item.tenSanPham !== '');
    this.donBaoHanh.slTiepNhan = this.resultChiTietSanPhamTiepNhans.reduce(
      (tong: number, item: { slDoiMoi?: number; slSuaChua?: number; slKhongBaoHanh?: number }) =>
        tong + (item.slDoiMoi ?? 0) + (item.slSuaChua ?? 0) + (item.slKhongBaoHanh ?? 0),
      0
    );

    //cập nhật thông tin sản phẩm trong chi tiết sản phẩm tiếp nhận
    for (let i = 0; i < this.resultChiTietSanPhamTiepNhans.length; i++) {
      for (let j = 0; j < this.danhSachSanPham.length; j++) {
        if (this.resultChiTietSanPhamTiepNhans[i].tenSanPham === this.danhSachSanPham[j].name) {
          const item: IChiTietSanPhamTiepNhan = {
            id: this.resultChiTietSanPhamTiepNhans[i].id,
            soLuongKhachHang: this.resultChiTietSanPhamTiepNhans[i].slKhachGiao,
            idKho: '0',
            idBienBan: '0',
            tongLoiKiThuat: 0,
            tongLoiLinhDong: 0,
            ngayPhanLoai: today,
            slTiepNhan: this.resultChiTietSanPhamTiepNhans[i].slTiepNhan,
            slTon: 0,
            tinhTrangBaoHanh: this.resultChiTietSanPhamTiepNhans[i].tinhTrangBaoHanh,
            trangThaiIn: null,
            sanPham: this.danhSachSanPham[j],
            donBaoHanh: this.donBaoHanh,
          };
          if (this.resultChiTietSanPhamTiepNhans[i].tinhTrangBaoHanh) {
            item.tinhTrangBaoHanh = 'true';
          } else {
            item.tinhTrangBaoHanh = 'false';
          }
          this.chiTietDonBaoHanh.push(item);
          break;
        }
      }
    }
    // console.log(this.chiTietDonBaoHanh);
    if (this.isChanged === true) {
      document.getElementById('modal-confirm-save')!.style.display = 'block';
    } else {
      this.http.put<any>(`${this.updateDonBaoHanhUrl}`, this.donBaoHanh).subscribe(() => {
        setTimeout(() => {
          this.openPopupNoti('Hoàn thành phân loại', true);
        }, 1000);
      });
    }
  }
  saveAfterDelete(): void {
    this.http
      .put<any>(this.putChiTietSanPhamTiepNhanUrl, this.chiTietDonBaoHanh)
      .pipe(
        switchMap(res => {
          const arr = [];
          for (let i = 0; i < res.length; i++) {
            const chiTiet = this.resultChiTietSanPhamTiepNhans[i];
            const chiTietRes = res[i];
            const mapping: Record<number, number> = {
              1: chiTiet.slDoiMoi,
              2: chiTiet.slSuaChua,
              3: chiTiet.slKhongBaoHanh,
            };
            for (const tinhTrang of this.danhSachTinhTrangs) {
              if (typeof tinhTrang.id === 'number') {
                const soLuong = mapping[tinhTrang.id];
                if (soLuong > 0) {
                  arr.push({
                    id: null,
                    soLuong,
                    chiTietSanPhamTiepNhan: chiTietRes,
                    danhSachTinhTrang: tinhTrang,
                  });
                }
              }
            }
          }
          this.themMoiPhanLoaiChiTietTiepNhan = arr;
          return this.http.put<any>(this.putPhanLoaiChiTietTiepNhanUrl, this.themMoiPhanLoaiChiTietTiepNhan);
        }),
        switchMap(() => this.http.put<any>(`${this.updateDonBaoHanhUrl}`, this.donBaoHanh))
      )
      .subscribe(() => {
        this.isChanged = false;

        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          this.http.get<any[]>(`${this.phanLoaiChiTietTiepNhanUrl}/by-don-bao-hanh/${this.donBaoHanh.id}`).subscribe(data => {
            this.resultChiTietSanPhamTiepNhans = data;
          });
        }, 500);

        this.openPopupNoti('Hoàn thành phân loại', true);
      });
  }

  confirmSave(): void {
    document.getElementById('modal-confirm-save')!.style.display = 'none';
    console.log('update don bao hanh', this.donBaoHanh);
    this.donBaoHanh.trangThaiIn = 'Chưa in';
    if (this.idsToDelete.length > 0) {
      const deleteRequests = this.idsToDelete.map(id => {
        const deleteUrl = this.putPhanLoaiChiTietTiepNhanUrl.replace('update-phan-loai-chi-tiet-tiep-nhan', 'delete-item-phan-loai');
        return this.http.put<any>(`${deleteUrl}/${id}`, {});
      });

      forkJoin(deleteRequests).subscribe(() => {
        this.idsToDelete = [];
        this.saveAfterDelete();
      });
    } else {
      this.saveAfterDelete();
    }
  }

  closeModalConfirmSave(): void {
    document.getElementById('modal-confirm-save')!.style.display = 'none';
  }
  getColor(value: number, index: any): void {
    // console.log('value', value);
    if (value >= 0 && value < 40) {
      document.getElementById(index as string)!.style.accentColor = 'red';
    } else if (value >= 40 && value < 70) {
      document.getElementById(index as string)!.style.accentColor = 'yellow';
    } else if (value > 70) {
      document.getElementById(index as string)!.style.accentColor = 'green';
    }
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
    // console.log('onGridMenuColumnsChanged11111', this.angularGrid);
    // },1000)
  }
  onMenuShow(e: any): void {
    console.log('onGridMenuColumnsChanged', e);
  }
  onColumnsChanged(e: any): void {
    console.log('onGridMenuColumnsChanged', e);
  }
  handleOnBeforePaginationChange(e: any): boolean {
    // e.preventDefault();
    // return false;
    return true;
  }

  onSelectChanged(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedValue = selectElement.value;
    // console.log('select', this.selectedValue);
  }
}
