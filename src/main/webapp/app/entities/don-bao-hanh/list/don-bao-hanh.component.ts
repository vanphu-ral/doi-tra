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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
import { catchError, forkJoin, of, tap } from 'rxjs';
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

  savePhanLoai: any;
  selectedValue = '';

  popupInBBTNtest = false;
  loading = false;
  isAdmin = false;
  faPrint = faPrint;

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
    console.log('[DEBUG] trackByResult idx, id=', _idx, item.id);
    return item.id;
  }
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
    this.http.get<any[]>('api/tiep-nhan').subscribe((res: any[]) => {
      this.donBaoHanhs = res.sort((a, b) => b.id! - a.id!);
      // console.log('tiep-nhan:', res);
      for (let i = 0; i < this.donBaoHanhs.length; i++) {
        this.donBaoHanhs[i].tienDo = Number(this.donBaoHanhs[i].slDaPhanLoai / this.donBaoHanhs[i].slSanPham) * 100;
      }
    });
    // this.loadAll();

    this.columnDefinitions = [];
    this.columnDefinitions1 = [
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
        minWidth: 120,
        maxWidth: 120,
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
      // {
      //   id: 'ngayTraBienBan',
      //   name: 'Ngày trả biên bản',
      //   field: 'ngayTraBienBan',
      //   dataKey: 'ngayTraBienBan',
      //   width: 140,
      //   sortable: true,
      //   filterable: true,
      //   minWidth: 140,
      //   // maxWidth: 140,
      //   type: FieldType.object,
      //   formatter: Formatters.dateTimeIso,
      //   filter: {
      //     placeholder: 'Search...',
      //     model: Filters.compoundDate,
      //   },
      //   editor: {
      //     model: Editors.text,
      //     required: true,
      //     maxLength: 100,
      //     editorOptions: {
      //       col: 42,
      //       rows: 5,
      //     } as LongTextEditorOption,
      //   },
      // },
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
            if (confirm('Bạn có chắc chắn muốn xóa?')) {
              const id: number = args.dataContext.id;

              this.http.delete(`${this.deleteDonBaoHanhUrl}/${id}`).subscribe({
                next: () => {
                  this.angularGrid?.gridService.deleteItemById(id);
                  alert('Xóa thành công!');
                },
                error: () => {
                  alert('Xóa thất bại. Vui lòng thử lại.');
                },
              });
            }
          },
        });
      }
      const presetColumns: { columnId: string }[] = [{ columnId: 'bbtn' }, { columnId: 'phanLoai' }, { columnId: 'edit' }];

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
        frozenColumn: hasDeletePermission ? 3 : 2,
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
          pageSize: this.donBaoHanhs.length,
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

      const phanLoaiMap = new Map<number, IPhanLoaiChiTietTiepNhan[]>();
      for (const pl of this.phanLoaiChiTietTiepNhans) {
        const chiTietId = pl.chiTietSanPhamTiepNhan?.id;
        if (typeof chiTietId === 'number') {
          if (!phanLoaiMap.has(chiTietId)) {
            phanLoaiMap.set(chiTietId, []);
          }
          phanLoaiMap.get(chiTietId)!.push(pl);
        }
      }

      for (const chiTiet of this.chiTietSanPhamTiepNhans) {
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

        const idSanPham = item.id;
        const danhSachPhanLoai = typeof idSanPham === 'number' ? phanLoaiMap.get(idSanPham) ?? [] : [];
        for (const phanLoai of danhSachPhanLoai) {
          const tinhTrangId = phanLoai.danhSachTinhTrang?.id;
          const soLuong = phanLoai.soLuong ?? 0;

          if (tinhTrangId === 1) {
            item.slDoiMoi += soLuong;
          } else if (tinhTrangId === 2) {
            item.slSuaChua += soLuong;
          } else if (tinhTrangId === 3) {
            item.slKhongBaoHanh += soLuong;
          }

          item.slTiepNhan += soLuong;
        }

        this.resultChiTietSanPhamTiepNhans.push(item);
        this.danhSachGocPopupPhanLoai = [...this.resultChiTietSanPhamTiepNhans];
      }

      // Tính tiến độ
      this.countItem = this.resultChiTietSanPhamTiepNhans.filter(item => item.tinhTrangBaoHanh).length;
      this.tienDo = Number(((this.countItem / this.resultChiTietSanPhamTiepNhans.length) * 100).toFixed(2));
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
    if (this.thongTinDonBaoHanh.khachHang) {
      this.thongTinDonBaoHanh.khachHang = {
        ...this.thongTinDonBaoHanh.khachHang,
        tenKhachHang: this.thongTinDonBaoHanh.tenKhachHang,
      };
    }
    const rawDate = this.thongTinDonBaoHanh.ngaykhkb;
    if (typeof rawDate === 'string') {
      const isoLike = rawDate.replace(' ', 'T').slice(0, -2);
      const date = new Date(isoLike);
      this.thongTinDonBaoHanh.ngaykhkb = date.toISOString();
    }

    this.http.put<any>(this.updateDonBaoHanhUrl, this.thongTinDonBaoHanh).subscribe({
      next: updated => {
        if (updated?.id) {
          const idx = this.donBaoHanhs.findIndex(d => d.id === updated.id);
          if (idx !== -1) {
            this.donBaoHanhs[idx] = updated;
          }
        }
        alert('Cập nhật thành công!');
        this.closePopupEdit();
        window.location.reload();
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
      // ... giữ nguyên phần kiểm tra
    } else {
      this.donBaoHanh.maTiepNhan = this.taoMaTiepNhan();
      this.http.post<any>(this.postDonBaoHanhNewUrl, this.donBaoHanh).subscribe(res => {
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
            this.openPopupNoti('Thêm mới thành công');
            window.location.reload();
          });
        });
      });
    }
  }

  //cập nhật thông tin sl Tổng tiếp nhận đơn bảo hành và sl tiếp nhận của chi tiết đơn bảo hành
  updateChiTietDonBaoHanhInfo(slDoiMoi: any, slSuaChua: any, slKhongBaoHanh: any, slTiepNhan: any, index: number): void {
    this.donBaoHanh.slTiepNhan = 0;
    // sl tiếp nhận của chi tiết đơn bảo hành
    slTiepNhan = Number(slDoiMoi) + Number(slSuaChua) + Number(slKhongBaoHanh);
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
    this.donBaoHanh.slTiepNhan = 0;
    // tính toán số lượng tiếp nhận
    this.resultChiTietSanPhamTiepNhans[index].slTiepNhan =
      Number(this.resultChiTietSanPhamTiepNhans[index].slDoiMoi) +
      Number(this.resultChiTietSanPhamTiepNhans[index].slSuaChua) +
      Number(this.resultChiTietSanPhamTiepNhans[index].slKhongBaoHanh);
    // gán vào dữ liệu gốc
    for (let i = 0; i < this.danhSachGocPopupPhanLoai.length; i++) {
      if (this.danhSachGocPopupPhanLoai[i].tenSanPham === this.resultChiTietSanPhamTiepNhans[index].tenSanPham) {
        this.danhSachGocPopupPhanLoai[i].slDoiMoi = this.resultChiTietSanPhamTiepNhans[index].slDoiMoi;
        this.danhSachGocPopupPhanLoai[i].slSuaChua = this.resultChiTietSanPhamTiepNhans[index].slSuaChua;
        this.danhSachGocPopupPhanLoai[i].slKhongBaoHanh = this.resultChiTietSanPhamTiepNhans[index].slKhongBaoHanh;
        this.danhSachGocPopupPhanLoai[i].slTiepNhan = this.resultChiTietSanPhamTiepNhans[index].slTiepNhan;
      }
      //Cập nhật thông tin số lượng tổng tiếp nhận
      this.donBaoHanh.slTiepNhan = Number(this.donBaoHanh.slTiepNhan) + Number(this.danhSachGocPopupPhanLoai[i].slTiepNhan);
    }
    // console.log('check: ', index, this.resultChiTietSanPhamTiepNhans[index]);
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

  addRow(): void {
    this.isChanged = true;
    this.idAddRow++;
    // cập nhật thông tin
    //thêm mới dòng
    const newRow = {
      id: this.idAddRow,
      tenSanPham: '',
      donVi: '',
      slKhachGiao: 0,
      slTiepNhanTong: 0,
      slTiepNhan: 0,
      slDoiMoi: 0,
      slSuaChua: 0,
      slKhongBaoHanh: 0,
      chiTietSanPhamTiepNhan: null,
    };
    this.resultChiTietSanPhamTiepNhans.push(newRow);
    this.danhSachGocPopupPhanLoai.push(newRow);
    // this.resultChiTietSanPhamTiepNhans = [...this.resultChiTietSanPhamTiepNhans, newRow];
    // this.danhSachGocPopupPhanLoai = [...this.danhSachGocPopupPhanLoai, newRow];
    // console.log('them dong', this.resultChiTietSanPhamTiepNhans);
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
    this.http.post<any>(this.postMaBienBanUrl, this.themMoiBienBan).subscribe(res => {
      // console.log('thành công:', res);
      // window.location.reload();
      this.getDanhSachBienBan();
      this.popupInBBTN1 = false;
      this.popupInBBTN2 = false;
      this.popupInBBTN3 = false;
      this.popupInBBTN4 = false;
    });

    this.http.put<any>(this.updateDonBaoHanhUrl, this.donBaoHanh).subscribe();
    console.log('test', this.donBaoHanh.trangThaiIn);
  }
  //--------------------------------------------------- import file --------------------------------------------------------
  ReadExcel(event: any): void {
    this.ExcelData = [];
    this.donBaoHanh.slTiepNhan = 0;
    this.donBaoHanh.nhanVienGiaoHang = '';
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);
    fileReader.onload = e => {
      const workBook = XLSX.read(fileReader.result, { type: 'binary' });
      const sheetNames = workBook.SheetNames;
      this.ExcelData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[0]], {
        header: ['maSanPham', 'tenSanPham', 'slKhachGiao', 'slNhan', 'slDoiMoi', 'slSuaChua', 'slKhongBaoHanh'],
        defval: '',
      });
    };
    // lọc thông tin hiển thị lên giao diện
    setTimeout(() => {
      this.ExcelData = this.ExcelData.filter((data: any) => data.slKhachGiao !== '' && data.tenSanPham !== 'Tên sản phẩm');
      for (let i = 0; i < this.ExcelData.length; i++) {
        this.ExcelData[i].sanPham = null;
        for (let j = 0; j < this.danhSachSanPham.length; j++) {
          // console.log(j);
          if (this.ExcelData[i].tenSanPham === this.danhSachSanPham[j].name) {
            this.ExcelData[i].sanPham = this.danhSachSanPham[j];
            break;
          }
        }
        if (this.ExcelData[i].slSuaChua === '') {
          this.ExcelData[i].slSuaChua = 0;
          if (this.ExcelData[i].slKhongBaoHanh === '') {
            this.ExcelData[i].slKhongBaoHanh = 0;
          }
        } else {
          if (this.ExcelData[i].slKhongBaoHanh === '') {
            this.ExcelData[i].slKhongBaoHanh = 0;
          }
        }
        // lưu kết quả sau khi lọc vào biến mới
        this.themMoiDonBaoHanh.push(this.ExcelData[i]);
        // tính toán tổng số lượng tiếp nhận
        this.donBaoHanh.slTiepNhan =
          Number(this.donBaoHanh.slTiepNhan) +
          Number(this.ExcelData[i].slDoiMoi) +
          Number(this.ExcelData[i].slSuaChua) +
          Number(this.ExcelData[i].slKhongBaoHanh);
      }
      //lưu kết quả vào
      // console.log(this.ExcelData);
      // console.log('kq', this.themMoiDonBaoHanh);
      // console.log(`kq tiep nhan:`, event);
    }, 1000);
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

  deleteRowPopupPhanLoai(id: any): void {
    this.deleteId = id;
    this.isModalOpenConfirm = true;
    document.getElementById('modal-confirm')!.style.display = 'block';
  }

  confirmDelete(): void {
    this.isChanged = true;
    this.donBaoHanh.slTiepNhan = 0;
    this.resultChiTietSanPhamTiepNhans = this.resultChiTietSanPhamTiepNhans.filter((d: any) => d.id !== this.deleteId);
    this.danhSachGocPopupPhanLoai = this.danhSachGocPopupPhanLoai.filter((d: any) => d.id !== this.deleteId);
    this.http.delete(`${this.deleteDetailDonBaoHanhUrl}/${this.deleteId as number}`).subscribe(() => {
      // console.log('xóa thành công');
    });

    for (let i = 0; i < this.resultChiTietSanPhamTiepNhans.length; i++) {
      this.donBaoHanh.slTiepNhan =
        Number(this.donBaoHanh.slTiepNhan) +
        Number(this.resultChiTietSanPhamTiepNhans[i].slDoiMoi) +
        Number(this.resultChiTietSanPhamTiepNhans[i].slSuaChua) +
        Number(this.resultChiTietSanPhamTiepNhans[i].slKhongBaoHanh);
    }

    this.isModalOpenConfirm = false;
    document.getElementById('modal-confirm')!.style.display = 'none';
  }

  closeModalConfirm(): void {
    this.isModalOpenConfirm = false;
    document.getElementById('modal-confirm')!.style.display = 'none';
  }

  deleteRow(tenSanPham: any): void {
    this.deleteTenSanPham = tenSanPham;
    this.isModalOpenConfirmAdd = true;
    document.getElementById('modal-confirm-add')!.style.display = 'block';
    // console.log('open modal confirm add', this.isModalOpenConfirmAdd);
  }

  confirmDeleteRowAdd(): void {
    this.isChanged = true;
    this.donBaoHanh.slTiepNhan = 0;
    this.themMoiDonBaoHanh = this.themMoiDonBaoHanh.filter((d: any) => d.tenSanPham !== this.tenSanPham);
    for (let i = 0; i < this.themMoiDonBaoHanh.length; i++) {
      this.donBaoHanh.slTiepNhan =
        Number(this.donBaoHanh.slTiepNhan) +
        Number(this.themMoiDonBaoHanh[i].slDoiMoi) +
        Number(this.themMoiDonBaoHanh[i].slSuaChua) +
        Number(this.themMoiDonBaoHanh[i].slKhongBaoHanh);
    }
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
          this.openPopupNoti('Hoàn thành phân loại');
          window.location.reload();
        }, 1000);
      });
    }
  }

  confirmSave(): void {
    document.getElementById('modal-confirm-save')!.style.display = 'none';
    console.log('update don bao hanh', this.donBaoHanh);
    this.donBaoHanh.trangThaiIn = 'Chưa in';
    this.http.put<any>(`${this.updateDonBaoHanhUrl}`, this.donBaoHanh).subscribe(() => {
      // cập nhật thông tin chi tiết sản phẩm tiếp nhận
      this.http.put<any>(this.putChiTietSanPhamTiepNhanUrl, this.chiTietDonBaoHanh).subscribe(res => {
        // console.log('check ket qua chi tiet phan loaij: ', res);
        // tạo danh sách phân loại sau khi cập nhật thông tin chi tiết sản phẩm tiếp nhận
        setTimeout(() => {
          for (let i = 0; i < res.length; i++) {
            for (let k = 0; k < this.danhSachTinhTrangs.length; k++) {
              // trường hợp đổi mới
              if (this.danhSachTinhTrangs[k].id === 1) {
                const item1: IPhanLoaiChiTietTiepNhan = {
                  id: 0,
                  soLuong: this.resultChiTietSanPhamTiepNhans[i].slDoiMoi,
                  chiTietSanPhamTiepNhan: res[i],
                  danhSachTinhTrang: this.danhSachTinhTrangs[k],
                };
                this.themMoiPhanLoaiChiTietTiepNhan.push(item1);
              }
              // trường hợp sửa chữa
              if (this.danhSachTinhTrangs[k].id === 2) {
                const item1: IPhanLoaiChiTietTiepNhan = {
                  id: 0,
                  soLuong: this.resultChiTietSanPhamTiepNhans[i].slSuaChua,
                  chiTietSanPhamTiepNhan: res[i],
                  danhSachTinhTrang: this.danhSachTinhTrangs[k],
                };
                this.themMoiPhanLoaiChiTietTiepNhan.push(item1);
              }
              //trường hợp không bảo hành
              if (this.danhSachTinhTrangs[k].id === 3) {
                const item1: IPhanLoaiChiTietTiepNhan = {
                  id: 0,
                  soLuong: this.resultChiTietSanPhamTiepNhans[i].slKhongBaoHanh,
                  chiTietSanPhamTiepNhan: res[i],
                  danhSachTinhTrang: this.danhSachTinhTrangs[k],
                };
                this.themMoiPhanLoaiChiTietTiepNhan.push(item1);
              }
            }
          }
          this.http.put<any>(this.putPhanLoaiChiTietTiepNhanUrl, this.themMoiPhanLoaiChiTietTiepNhan).subscribe(() => {
            this.isChanged = false;
            setTimeout(() => {
              // console.log('Chi tiet don bao hanh: ', this.chiTietDonBaoHanh);
              // console.log('Phan loai chi tiet don hang tiep nhan: ', this.themMoiPhanLoaiChiTietTiepNhan);
              // window.location.reload();
            }, 500);
          });
        }, 500);
        this.openPopupNoti('Hoàn thành phân loại');
      });
    });
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
