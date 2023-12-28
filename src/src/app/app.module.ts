import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BaseRequestOptions, Http, HttpModule, RequestOptions, XHRBackend} from '@angular/http';
import {CanActivate, Router, RouterModule, RouterStateSnapshot, Routes} from '@angular/router';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {AppComponent} from './app.component';
import {NgbDateParserFormatter, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LSelect2Module} from 'ngx-select2';
import {NgxOAuthModule} from 'ngx-oauth-client';
import {ColorPickerModule} from 'ngx-color-picker';
import {CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule} from '@angular/core';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ConvertTimeToJaPipe} from './common/converter/convert-time-to-ja.pipe';
import {ClickOutsideModule} from 'ng-click-outside';
import {TextareaAutosizeModule} from 'ngx-textarea-autosize';
import {FileUploadModule} from 'ng2-file-upload';
import {ThumbnailDirective} from './components/groupboard-contribution/thumbnail.directive';
import {StompRService} from '@stomp/ng2-stompjs';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

// Components
import {HeaderComponent} from './components/header/header.component';
import {HeaderDrjoyComponent} from './components/header-drjoy/header-drjoy.component';
import {HeaderPrjoyComponent} from './components/header-prjoy/header-prjoy.component';
import {HeaderDrjoyVisitorComponent} from './components/header-drjoy-visitor/header-drjoy-visitor.component';
import {HeaderPrjoyVisitorComponent} from './components/header-prjoy-visitor/header-prjoy-visitor.component';
import {SideMenuComponent} from './components/side-menu/side-menu.component';
import {SideMenuDrjoyComponent} from './components/side-menu-drjoy/side-menu-drjoy.component';
import {SideMenuPrjoyComponent} from './components/side-menu-prjoy/side-menu-prjoy.component';
import {SettingsPanelComponent} from './components/settings-panel/settings-panel.component';
import {InfoPanelComponent} from './components/info-panel/info-panel.component';
import {ColSubComponent} from './components/col-sub/col-sub.component';
import {ImageCropperComponent} from './components/image-cropper/image-cropper.component';
import {PageHeadComponent} from './components/page-head/page-head.component';
import {ModalSimpleComponent} from './components/modal-simple/modal-simple.component';
import {ModalComponent} from './components/modal/modal.component';
import {ModalInputComponent} from './components/modal-input/modal-input-component';
import {ModalInputValidateComponent} from './components/modal-input-validate/modal-input-validate.component';
import {ModalCheckboxComponent} from './components/modal-checkbox/modal-checkbox.component';
import {Helper} from './common/helper';
import {Validator} from './common/validation/validator';
import {CalendarCommon} from './common/calendar-common';
import {DateInputComponent} from './components/date-input/date-input.component';
import {TelInputComponent} from './components/tel-input/tel-input.component';
import {PasswordInputComponent} from './components/password-input/password-input.component';
import {MemberSelectComponent} from './components/member-select/member-select.component';
import {MemberSelectCopyComponent} from './components/member-select-copy/member-select-copy.component';
import {PopupHoverComponent} from './components/popup-hover/popup-hover.component';
import {StringTrimComponent} from './components/string-trim/string-trim.component';
import {InfiniteScrollComponent} from './components/infinite-scroll/infinite-scroll.component';
import {PrOfficeSelectComponent} from './components/pr-office-select/pr-office-select.component';
import {CountUpInputComponent} from './components/count-up-input/count-up-input.component';
import {ModalTextAreaComponent} from './components/modal-input/modal-text-area-component';
import {CountUpTextareaComponent} from './components/count-up-textarea/count-up-textarea.component';
import {InsideStaffDetailsPopupComponent} from './components/inside-staff-details-popup/inside-staff-details-popup.component';
import {OutsideStaffDetailsPopupComponent} from './components/outside-staff-details-popup/outside-staff-details-popup.component';
import {DestinationPopoverComponent} from './components/destination-popover/destination-popover.component';
import {GroupboardContributionComponent} from './components/groupboard-contribution/groupboard-contribution.component';
import {GroupIconComponent} from './components/group-icon/group-icon.component';
import {StaffPopoverComponent} from './components/staff-popover/staff-popover.component';
import {DateConverter} from './common/converter/date.converter';
import {FormatSizeConverter} from './common/converter/format.size.converter';
import {MultiSelectComponent} from './components/multi-select/multi-select.component';
import { FaceIconSetComponent } from './components/face-icon-set/face-icon-set.component';

// Services
import {AuthenticationService} from './services/authentication.service';
import {SharedValueService} from './services/shared-value.service';
import {RegistrationService} from './services/registration.service';
import {CalendarService} from './services/calendar.service';
import {GroupService} from './services/group.service';
import {MeetingService} from './services/meeting.service';
import {DialogService} from './services/dialog.service';
import {ChatService} from './services/chat.service';
import {CmsService} from './services/cms.service';
import {BaseService} from './services/base.service';
import {MasterService} from './services/master.service';
import {WsService} from './services/stomp/ws.service';
import {AttendanceService} from './services/attendance.service';
// Pages Dr.JOY
import {TopPageComponent} from './pages/top-page/top-page.component';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {LogoutPageComponent} from './pages/logout-page/logout-page.component';
import {SideMenuEditPageComponent} from './pages/re/side-menu-edit-page/side-menu-edit-page.component';
import {StaffAdminPageComponent} from './pages/re/staff-admin-page/staff-admin-page.component';
import {StaffInvitePageComponent} from './pages/re/staff-invite-page/staff-invite-page.component';
import {StaffEditPageComponent} from './pages/re/staff-edit-page/staff-edit-page.component';
import {NodeEditPageComponent} from './pages/re/node-edit-page/node-edit-page.component';
import {StaffListPageComponent} from './pages/re/staff-list-page/staff-list-page.component';
import {PasswordPageComponent} from './pages/re/password-page/password-page.component';
import {UserEditPageComponent} from './pages/re/user-edit-page/user-edit-page.component';
import {NotificationPageComponent} from './pages/re/notification-page/notification-page.component';
import {FirstEntryPageComponent} from './pages/re/first-entry-page/first-entry-page.component';
import {FirstEntryConfirmPageComponent} from './pages/re/first-entry-confirm-page/first-entry-confirm-page.component';
import {NotFoundPageComponent} from './pages/not-found-page/not-found-page.component';
import {ErrorPageComponent} from './pages/error-page/error-page.component';
import {Ca0002PageComponent} from './pages/ca/ca0002-page/ca0002-page.component';
import {Ca0006PageComponent} from './pages/ca/ca0006-page/ca0006-page.component';
import {Ca0007PageComponent} from './pages/ca/ca0007-page/ca0007-page.component';
import {Ca0008PageComponent} from './pages/ca/ca0008-page/ca0008-page.component';
import {Ca0009PageComponent} from './pages/ca/ca0009-page/ca0009-page.component';
import {Ca0010PageComponent, CalendarConsentComponent, ColorPickerPanelComponent } from './pages/ca/ca0010-page/ca0010-page.component';
import {Ca0017PageComponent} from './pages/ca/ca0017-page/ca0017-page.component';
import {FrameMeetingPageComponent} from './pages/ca/frame-meeting-page/frame-meeting-page.component';
import {Me0001PageComponent} from './pages/me/me0001-page/me0001-page.component';
import {Me0003PageComponent} from './pages/me/me0003-page/me0003-page.component';
import {Me0004PageComponent} from './pages/me/me0004-page/me0004-page.component';
import {Me0005PageComponent} from './pages/me/me0005-page/me0005-page.component';
import {Me0006PageComponent} from './pages/me/me0006-page/me0006-page.component';
import {Me0007PageComponent} from './pages/me/me0007-page/me0007-page.component';
import {Me0008PageComponent} from './pages/me/me0008-page/me0008-page.component';
import {Me0009PageComponent} from './pages/me/me0009-page/me0009-page.component';
import {Me0010PageComponent} from './pages/me/me0010-page/me0010-page.component';
import {Me0012PageComponent} from './pages/me/me0012-page/me0012-page.component';
import {Me0013PageComponent} from './pages/me/me0013-page/me0013-page.component';
import {Me0014PageComponent} from './pages/me/me0014-page/me0014-page.component';
import {Me0015PageComponent} from './pages/me/me0015-page/me0015-page.component';
import {Me0016PageComponent} from './pages/me/me0016-page/me0016-page.component';
import {Me0017PageComponent} from './pages/me/me0017-page/me0017-page.component';
import {Me0018PageComponent} from './pages/me/me0018-page/me0018-page.component';
import {Me0019PageComponent} from './pages/me/me0019-page/me0019-page.component';
import {Me0020PageComponent} from './pages/me/me0020-page/me0020-page.component';
import {Me0021PageComponent} from './pages/me/me0021-page/me0021-page.component';
import {Me0023PageComponent} from './pages/me/me0023-page/me0023-page.component';
import {Me0024PageComponent} from './pages/me/me0024-page/me0024-page.component';
import {Me0025PageComponent} from './pages/me/me0025-page/me0025-page.component';
import {Me0028PageComponent} from './pages/me/me0028-page/me0028-page.component';
import {Me0029PageComponent} from './pages/me/me0029-page/me0029-page.component';
import {Me0030PageComponent} from './pages/me/me0030-page/me0030-page.component';
import {Me0031PageComponent} from './pages/me/me0031-page/me0031-page.component';
import {Me0032PageComponent} from './pages/me/me0032-page/me0032-page.component';
import {Me0033PageComponent} from './pages/me/me0033-page/me0033-page.component';
import {Me0035PageComponent} from './pages/me/me0035-page/me0035-page.component';
import {Me0036PageComponent} from './pages/me/me0036-page/me0036-page.component';
import { Me5008PageComponent } from './pages/me/me5008-page/me5008-page.component';
import {Me5001PageComponent} from './pages/me/me5001-page/me5001-page.component';
import {Me5002PageComponent} from './pages/me/me5002-page/me5002-page.component';
import {Re0022PageComponent} from './pages/re/re0022-page/re0022-page.component';
import {Cm0001PageComponent} from './pages/cm/cm0001-page/cm0001-page.component';
import {Cm0002PageComponent} from './pages/cm/cm0002-page/cm0002-page.component';
import {Cm0005PageComponent} from './pages/cm/cm0005-page/cm0005-page.component';
import {Cm0006PageComponent} from './pages/cm/cm0006-page/cm0006-page.component';
import {Cm0012PageComponent} from './pages/cm/cm0012-page/cm0012-page.component';
import {Cm0014PageComponent} from './pages/cm/cm0014-page/cm0014-page.component';
import {Cm0016PageComponent} from './pages/cm/cm0016-page/cm0016-page.component';
import {Cm0017DrPageComponent} from './pages/cm/cm0017-dr-page/cm0017-dr-page.component';
import {Cm0017PrPageComponent} from './pages/cm/cm0017-pr-page/cm0017-pr-page.component';
import {Re0004PageComponent} from './pages/re/re0004-page/re0004-page.component';
import {Re0006PageComponent} from './pages/re/re0006-page/re0006-page.component';
import {Re0009PageComponent} from './pages/re/re0009-page/re0009-page.component';
import {Re0010PageComponent} from './pages/re/re0010-page/re0010-page.component';
import {Re0011PageComponent} from './pages/re/re0011-page/re0011-page.component';
import {Re0012PageComponent} from './pages/re/re0012-page/re0012-page.component';
import {Re0013PageComponent} from './pages/re/re0013-page/re0013-page.component';
import {Re0026PageComponent} from './pages/re/re0026-page/re0026-page.component';
import {Re0027PageComponent} from './pages/re/re0027-page/re0027-page.component';
import {Re0030PageComponent} from './pages/re/re0030-page/re0030-page.component';
import {Re0031PageComponent} from './pages/re/re0031-page/re0031-page.component';
import {Cm0007PageComponent} from './pages/cm/cm0007-page/cm0007-page.component';
import {Cm0008PageComponent} from './pages/cm/cm0008-page/cm0008-page.component';

import {DepartmentSelectComponent} from './components/department-select/department-select.component';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {OptionColorComponent} from './components/option-color/option-color.component';
import {MiniProfileComponent} from './components/mini-profile/mini-profile.component';
import {FaceIconComponent} from './components/face-icon/face-icon.component';
import {environment} from '../environments/environment';
import {MockBackend} from '@angular/http/testing';
import {BackendMock} from './common/interceptor/http/backend.mock';
import {BackendDevelop} from './common/interceptor/http/backend.develop';
import {BackendStaging} from './common/interceptor/http/backend.staging';
import {BackendService} from './common/interceptor/http/backend.service';
import {BackendDemo} from './common/interceptor/http/backend.demo';
import {BackendLocal} from './common/interceptor/http/backend.local';
import {Product, Profile} from './common/profile';
import {FirebaseService} from './services/firebase/firebase.service';
import {LocalStorage} from './services/local-storage.service';
import {LoggerModule, NGXLogger, NgxLoggerLevel} from 'ngx-logger';
import {FirebaseStorage} from './services/firebase/firebase.storage';
import {FirebaseDatabase} from './services/firebase/firebase.database';
import {
  AuthenticationMessage, DrjoyInfoAlertMessage, FirebaseReadyMessage, LoginUserInfoMessage, SideMenuMessage,
  SideMenuOrderMessage
} from './services/message.service';
// Pages Group
import {Gr0002PageComponent} from './pages/gr/gr0002-page/gr0002-page.component';
import {Gr0003PageComponent} from './pages/gr/gr0003-page/gr0003-page.component';
import {Gr0004PageComponent} from './pages/gr/gr0004-page/gr0004-page.component';
import {Gr0005PageComponent} from './pages/gr/gr0005-page/gr0005-page.component';
import {Gr0006PageComponent} from './pages/gr/gr0006-page/gr0006-page.component';
import {Gr0007PageComponent} from './pages/gr/gr0007-page/gr0007-page.component';
import {Gr0008PageComponent} from './pages/gr/gr0008-page/gr0008-page.component';
import {Gr0009PageComponent} from './pages/gr/gr0009-page/gr0009-page.component';
import {NgbDateMomentParserFormatter} from './pages/gr/shared/ngb-date-moment-parser-formatter';
import {NguiAutoCompleteModule} from '@ngui/auto-complete';
// Pipe
import {GroupIconSetComponent} from './components/group-icon-set/group-icon-set.component';
import {ModalCropperComponent} from './components/modal-cropper/modal-cropper.component';
import {StaffDetailsPopupComponent} from './components/staff-details-popup/staff-details-popup.component';
// Pipe
import {HoursMinutesStartEnd, TimePipe} from './common/pipe/date/date.pipe';
import {DisplayDepartmentPipe} from './common/pipe/department/display-department.pipe';
import {FormatNumber, WrapTextPipe} from './common/pipe/date/format.pipe';
import {AutoTextLengthPipe} from './common/pipe/auto-text-length.pipe';
// Init medical office and pharmacy office
import {CreateMedicalPageComponent} from './pages/create-medical-page/create-medical-page.component';
import {OrderByPipe} from './common/pipe/date/sort.pipe';
import {Ch0003PageComponent} from './pages/ch/ch0003-page/ch0003-page.component';
import {Ch0004PageComponent} from './pages/ch/ch0004-page/ch0004-page.component';
import {Ch0005PageComponent} from './pages/ch/ch0005-page/ch0005-page.component';
import {Ch0006PageComponent} from './pages/ch/ch0006-page/ch0006-page.component';
import {Ch0007PageComponent} from './pages/ch/ch0007-page/ch0007-page.component';
import {ChatComponent} from './pages/ch/chat/chat.component';
import {Gr0011PageComponent} from './pages/gr/gr0011-page/gr0011-page.component';
import {Gr0013PageComponent} from './pages/gr/gr0013-page/gr0013-page.component';
import {FormatSizeUnitsPipe} from './common/pipe/group/format-size-units.pipe';
import {FilterUserInfoPipe} from './common/pipe/group/filter-user-info.pipe';
import {SearchFilter} from './common/pipe/group/search-filter.pipe';
import {AttachedFilesComponent} from './components/attached-files/attached-files.component';
import {StampComponent} from './components/stamp/stamp.component';
import {ModalAttachedComponent} from './components/modal-attached/modal-attached.component';
import {ModalInputCustomComponent} from './components/modal-input-custom/modal-input-custom.component';
import {MemberListComponent} from './components/member-list/member-list.component';
import {MemberListAllComponent} from './components/member-list-all/member-list-all.component';
import {ModalMemberListComponent} from './components/modal-member-list/modal-member-list.component';
import {MeetingCommon} from './common/meeting-common';
import {GroupArticleInformationComponent} from './components/group-article-information/group-article-information.component';
import {GroupCommentInfoComponent} from './components/group-comment-info/group-comment-info.component';
import {Ca0014PageComponent} from './pages/ca/ca0014-page/ca0014-page.component';
import {Ca0018PageComponent} from './pages/ca/ca0018-page/ca0018-page.component';
import {FilePreviewComponent} from './components/file-preview/file-preview.component';
import {ModalFilePreviewComponent} from './components/modal-file-preview/modal-file-preview.component';
// Pages Help
import {He0003PageComponent} from './pages/he/he0003-page/he0003-page.component';
import {He0008PageComponent} from './pages/he/he0008-page/he0008-page.component';
import {He0009PageComponent} from './pages/he/he0009-page/he0009-page.component';
import {He0010PageComponent} from './pages/he/he0010-page/he0010-page.component';
import {He0001PageComponent} from './pages/he/he0001-page/he0001-page.component';
import {He0002PageComponent} from './pages/he/he0002-page/he0002-page.component';
import {He0004PageComponent} from './pages/he/he0004-page/he0004-page.component';
import {He0006PageComponent} from './pages/he/he0006-page/he0006-page.component';
import {He0007PageComponent} from './pages/he/he0007-page/he0007-page.component';
import {He0011PageComponent} from './pages/he/he0011-page/he0011-page.component';
import {He0012PageComponent} from './pages/he/he0012-page/he0012-page.component';
import {He0013PageComponent} from './pages/he/he0013-page/he0013-page.component';
import {He0014PageComponent} from './pages/he/he0014-page/he0014-page.component';
import {He0015PageComponent} from './pages/he/he0015-page/he0015-page.component';
import {He0016PageComponent} from './pages/he/he0016-page/he0016-page.component';
import {FileDisplayComponent} from './components/file-display/file-display.component';

import {EditSurveyComponent} from './components/edit-survey/edit-survey.component';


import {BeforeunloadGuard} from './guards/beforeunload.guard';
import {NotificationService} from './services/notification.service';
import {SoundService} from './services/sound.service';
import {SideMenuService} from './services/sidemenu.service';
import {PreLoginService} from './services/pre.login.service';
import {TimelineService} from './services/timeline.service';
import {InformationService} from './services/information.service';
import {PharmacyService} from './services/pharmacy.service';
import { Gr0014PageComponent } from './pages/gr/gr0014-page/gr0014-page.component';
import {Ph0001PageComponent } from './pages/ph/ph0001-page/ph0001-page.component';
import {Ph0004PageComponent } from './pages/ph/ph0004-page/ph0004-page.component';
import {Ph0006PageComponent } from './pages/ph/ph0006-page/ph0006-page.component';
import {Ph0007PageComponent } from './pages/ph/ph0007-page/ph0007-page.component';
import {Ph0008PageComponent } from './pages/ph/ph0008-page/ph0008-page.component';
import {Ph0010PageComponent } from './pages/ph/ph0010-page/ph0010-page.component';
import {Ph0011PageComponent } from './pages/ph/ph0011-page/ph0011-page.component';
import {Ph0012PageComponent } from './pages/ph/ph0012-page/ph0012-page.component';
import {Ph0014PageComponent } from './pages/ph/ph0014-page/ph0014-page.component';
import { Ph0015PageComponent } from './pages/ph/ph0015-page/ph0015-page.component';
import { Ph0017PageComponent } from './pages/ph/ph0017-page/ph0017-page.component';
import { Ph0018PageComponent } from './pages/ph/ph0018-page/ph0018-page.component';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { DetailPageComponent } from './pages/gr/detail-page/detail-page.component';
import { Of0001PageComponent } from './pages/re/of0001-page/of0001-page.component';
import { RegiterPageComponent } from './pages/re/regiter-page/regiter-page.component';
import { SettingsPanelDrComponent } from './components/settings-panel-dr/settings-panel-dr.component';
import { SettingsPanelPrComponent } from './components/settings-panel-pr/settings-panel-pr.component';

import { Re0034PageComponent } from './pages/re/re0034-page/re0034-page.component';
import {AutoSizeTextareaDirective} from './components/groupboard-contribution/auto-size-textarea.directive';
import { RequestMeetingDrComponent } from './components/request-meeting-dr/request-meeting-dr.component';
import { RequestMeetingPrComponent } from './components/request-meeting-pr/request-meeting-pr.component';
import {ColSubDrComponent} from './components/col-sub-dr/col-sub-dr.component';
import {ColSubPrComponent} from './components/col-sub-pr/col-sub-pr.component';
import { TimeAgoComponent } from './components/time-ago/time-ago.component';
import { Me0048PageComponent } from './pages/me/me0048-page/me0048-page.component';
import { Me0049PageComponent } from './pages/me/me0049-page/me0049-page.component';
import { Ph0021PageComponent } from './pages/ph/ph0021-page/ph0021-page.component';
import {InfinitiveSelectComponent} from 'app/components/infinitive-select/infinitive-select.component';
import {AttachmentTextBoxComponent} from './components/attachment-text-box/attachment-text-box.component';
import {AttachmentTextBoxContentsComponent} from './components/attachment-text-box-contents/attachment-text-box-contents.component';
import {AttachmentTextBoxFileUploadComponent} from './components/attachment-text-box-file-upload/attachment-text-box-file-upload.component';
import {ReportCommentListComponent} from './components/report-comment-list/report-comment-list.component';
import {ReportFileDisplayComponent} from './components/report-file-display/report-file-display.component';
import { Cm0013PageComponent } from './pages/cm/cm0013-page/cm0013-page.component';
import {SearchService} from './services/search.service';
import {Re0032PageComponent} from './pages/re/re0032-page/re0032-page.component';
import {DrjoyInformationService} from './services/drjoy.information.service';
import {Re0036PageComponent} from './pages/re/re0036-page/re0036-page.component';
import { FormCreateRequestDrComponent } from './components/form-create-request-dr/form-create-request-dr.component';
import {Me0050PageComponent} from './pages/me/me0050-page/me0050-page.component';
import {Me0054PageComponent} from './pages/me/me0054-page/me0054-page.component';
import {ModalInvitePharmacyStaffComponent} from './components/modal-invite-pharmacy-staff/modal-invite-pharmacy-staff.component';
import {ActivatedRouteSnapshot} from '@angular/router/src/router_state';
import { RE0035PageComponent } from './pages/re/re0035-page/re0035-page.component';
import { FormCreateRequestPrComponent } from './components/form-create-request-pr/form-create-request-pr.component';
import { DrugRegistAlertComponent } from './components/drug-regist-alert/drug-regist-alert.component';
import {ConvertUserInfoPipe} from './common/pipe/convert-user-info.pipe';
import {MeetingNologinService} from './services/meeting.nologin.service';
import { Sh0001PageComponent } from './pages/sh/sh0001-page/sh0001-page.component';
import { Sh0002PageComponent } from './pages/sh/sh0002-page/sh0002-page.component';
import {UserService} from './services/user.service';
import { HeaderDrjoyProvisionalComponent } from './components/header-drjoy-provisional/header-drjoy-provisional.component';
import { Sh0004PageComponent } from './pages/sh/sh0004-page/sh0004-page.component';

import { ModalTemplateComponent } from './components/modal-template/modal-template.component';

import { HeaderPrjoyProvisionalComponent } from './components/header-prjoy-provisional/header-prjoy-provisional.component';
import {Observable} from 'rxjs/Observable';
import { Cm0000DrPageComponent } from './pages/cm/cm0000-dr-page/cm0000-dr-page.component';
import { Cm0000PrPageComponent } from './pages/cm/cm0000-pr-page/cm0000-pr-page.component';
import { Sh0007PageComponent } from './pages/sh/sh0007-page/sh0007-page.component';
import { Sh0008PageComponent } from './pages/sh/sh0008-page/sh0008-page.component';
import { Sh0009PageComponent } from './pages/sh/sh0009-page/sh0009-page.component';
import { Sh0011PageComponent } from './pages/sh/sh0011-page/sh0011-page.component';
import { Sh0012PageComponent } from './pages/sh/sh0012-page/sh0012-page.component';
import { Sh0006PageComponent } from './pages/sh/sh0006-page/sh0006-page.component';

import {LinkyDirective} from './common/directive/linky.directive';
import { Sh0013PageComponent } from './pages/sh/sh0013-page/sh0013-page.component';
import {UnseenService} from "./services/unseen.service";
import {Unseens} from "./models/firebase/fir.unseens";
import { FileTransferDownloadPageComponent } from './pages/file-transfer-download-page/file-transfer-download-page.component';
import {ImgPreloaderDirective} from './common/directive/img-preloader.directive';
import {AutoFocusTextboxDirective} from './common/directive/auto-focus-textbox.directive';
import { ImportDataComponent } from './pages/gr/import-data/import-data.component';
import {LazyLoadImageModule} from 'ng-lazyload-image';
import {VirtualScrollModule} from 'angular2-virtual-scroll';
import { FormStaffInviteDrComponent } from './components/form-staff-invite-dr/form-staff-invite-dr.component';
import { At0001Component } from './pages/at/at0001/at0001.component';
import { At0004Component } from './pages/at/at0004/at0004.component';
import { At0005Component } from './pages/at/at0005/at0005.component';
import { At0006Component } from './pages/at/at0006/at0006.component';
// import {fakeBackendProvider} from './services/fake.backend';


/**
 * ログインチェック
 */
@Injectable()
export class CanActivateViaAuthGuard implements CanActivate {
  constructor(private sharedValue: SharedValueService,
              private preLogin: PreLoginService,
              ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      return this.preLogin.canActiveAuthority('auth', state.url);
  }
}

@Injectable()
export class CanActivateAdmin implements CanActivate {
  constructor(private sharedValue: SharedValueService,
              private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.preLogin.canActiveAuthority('admin', state.url); // MP_2
  }
}

@Injectable()
export class CanActivateSuperAdmin implements CanActivate {
  constructor(private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.preLogin.canActiveAuthority('superAdmin', state.url); // MP_1
  }
}

@Injectable()
export class CanActivateValid implements CanActivate {
  constructor(private sharedValue: SharedValueService, private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.preLogin.canActiveAuthority('isValid', state.url);
  }
}

@Injectable()
export class CanActivateProvisional implements CanActivate {
  constructor(private sharedValue: SharedValueService,
              private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.preLogin.canActiveAuthority('isProvisional', state.url);
  }
}

// not provisional
@Injectable()
export class CanActivatePermanent implements CanActivate {
  constructor(
    private sharedValue: SharedValueService,
    private router: Router
  ) {
  }

  canActivate() {
    if (environment.app === Product.Drjoy) {
      const userSession = this.sharedValue.getUserSession();
      if (!userSession || !userSession.accountStatus) {
        return false;
      }
      if (userSession.accountStatus.isProvisional) {
        console.log(`%cfirstEntry`, "background-color: yellow;");
        this.router.navigate(['/re/first-entry'], {replaceUrl: true});
        return false;
      }
    }
    return true;
  }

}

// term true
@Injectable()
export class CanActivateTermOK implements CanActivate {
  constructor(
    private router: Router,
    private cmsService: CmsService
  ) {
  }

  canActivate() {
    return Observable.create((observer) => {
      this.cmsService.getTermOfUseCheck().subscribe((res) => {
        if (res && res.approved) {
          observer.next(true);
        } else {
          if (environment.app === Product.Drjoy) {
            console.log(`%creplace`, "background-color: yellow;");
            this.router.navigate(['/cm/cm0000dr'], {replaceUrl: true});
            observer.next(false);
          } else if (environment.app === Product.Prjoy) {
            console.log(`%creplace`, "background-color: yellow;");
            this.router.navigate(['/cm/cm0000pr'], {replaceUrl: true});
            observer.next(false);
          }
        }
      });
    });
  }

}

// term false
@Injectable()
export class CanActivateTermNG implements CanActivate {
  constructor(
    private router: Router,
    private cmsService: CmsService
  ) {
  }

  canActivate() {
    return Observable.create((observer) => {
      this.cmsService.getTermOfUseCheck().subscribe((res) => {
        if (res && res.approved === false) {
          observer.next(true);
        } else {
          observer.next(false);
        }
      });
    });
  }

}

@Injectable()
export class CanActivateDrOnly implements CanActivate {
  constructor(private router: Router) {}
  canActivate() {
    if (environment.app === Product.Drjoy) {
      return true;
    }
    console.log(`%cNot Found`, "background-color: yellow;");
    this.router.navigate(['NotFound']);
    return false;
  }
}

@Injectable()
export class CanActivatePrOnly implements CanActivate {
  constructor(private router: Router) {}
  canActivate() {
    if (environment.app === Product.Prjoy) {
      return true;
    }
    console.log(`%cNot Found`, "background-color: yellow;");
    this.router.navigate(['NotFound']);
    return false;
  }
}
@Injectable()
export class CanActivateDrPersonalVerify implements CanActivate {
  constructor(private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log(`%cPersonalVerify, ${route}, ${state}`, "background-color: yellow;");
    return this.preLogin.canActiveAuthority('personalVerify', state.url);
  }
}
@Injectable()
export class CanActivatePrIdentify implements CanActivate {
  constructor(private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.preLogin.canActiveAuthority('identify', state.url);
  }
}
@Injectable()
export class CanActivateDrPersonal implements CanActivate {
  constructor(private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.preLogin.canActiveAuthority('personal', state.url);
  }
}
@Injectable()
export class CanActivatePharmacy implements CanActivate {
  constructor(private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.preLogin.canActiveAuthority('pharmacy', state.url);
  }
}
@Injectable()
export class CanActivateAdminPharmacy implements CanActivate {
  constructor(private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.preLogin.canActiveAuthority('adminpharmacy', state.url);
  }
}
@Injectable()
export class CanActivateDrugStorePharmacy implements CanActivate {
  constructor(private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.preLogin.canActiveAuthority('pharmacy_drugstore', state.url);
  }
}
@Injectable()
export class CanActivateDrugStoreAdminPharmacy implements CanActivate {
  constructor(private preLogin: PreLoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.preLogin.canActiveAuthority('adminpharmacy_drugstore', state.url);
  }
}

/**
 * ログインページへの遷移チェック用
 */
@Injectable()
export class CanActivateLoginPageService implements CanActivate {
  constructor(private shared: SharedValueService) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // メモリ上のセッション情報がある場合は遷移させない
    return this.shared.getUserSession() ? false : true;
  }
}

// 遷移時のログ用
@Injectable()
export class RouterLogService implements CanActivate {
  constructor() {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    console.log(`%c${state.url}`, "background-color: pink;");
    return true;
  }
}

// ルーティング設定
const appRoutes: Routes = [

  // Dr.JOY

  {path: '', component: TopPageComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'login', component: LoginPageComponent},
  {path: 'logout', component: LogoutPageComponent},
  {path: 'logout/:type', component: LogoutPageComponent},
  { path: 'create-medical', component: CreateMedicalPageComponent },

  // Redirect(現行のURLをリダイレクト)
  {path: 'top', redirectTo: '', pathMatch: 'full', canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'calendar', redirectTo: environment.app === Product.Drjoy ? 'ca/ca0002' : 'ca/ca0014', pathMatch: 'full', canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'visitation', redirectTo: environment.app === Product.Drjoy ? 'me/me0001' : 'me/me0030', pathMatch: 'full', canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'groupboard', redirectTo: environment.app === Product.Drjoy ? 'gr/gr0011/:groupId' : '', canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'sharetalk', redirectTo: 'ch/ch0007/:groupId', canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'setting', redirectTo: '/#setting', pathMatch: 'full', canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'checklist', redirectTo: environment.app === Product.Drjoy ? 'cm/cm0006' : '', pathMatch: 'full', canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},

  // RE0001 Front 3col
  {path: 're/side-menu-edit', component: SideMenuEditPageComponent,
    canActivate: [CanActivateTermOK, CanActivateDrOnly, CanActivateValid]},

  // RE0014 Front 3col
  { path: 're/staff-admin', component: StaffAdminPageComponent,
    canActivate: [CanActivateTermOK, CanActivateDrOnly, CanActivateAdmin] },

  // RE0015 Front 1col
  { path: 're/staff-invite', component: StaffInvitePageComponent,
    canActivate: [CanActivateTermOK, CanActivateDrOnly, CanActivateAdmin] },

  // RE0016 Front 3col
  { path: 're/staff-edit/:userId', component: StaffEditPageComponent,
    canActivate: [CanActivateTermOK, CanActivateDrOnly, CanActivateAdmin] },

  // RE0017 Front 3col
  { path: 're/node-edit', component: NodeEditPageComponent,
    canActivate: [ CanActivateTermOK, CanActivateDrOnly, CanActivateSuperAdmin] },

  // RE0018 Front 2col
  {path: 're/staff-list', component: StaffListPageComponent,
    canActivate: [CanActivateTermOK, CanActivateDrOnly, CanActivateValid]},

  // RE0019 Front 3col
  {path: 're/password', component: PasswordPageComponent,
    canActivate: [CanActivateTermOK, CanActivateDrOnly, CanActivateValid]},

  // RE0020 Front 3col
  {path: 're/user-edit', component: UserEditPageComponent,
    canActivate: [CanActivateTermOK, CanActivateDrOnly, CanActivateValid]},

  // RE0020 Front check mail confirm 1col
  { path: 're/user-edit/:token/:type',
    component: UserEditPageComponent, canActivate: [ CanActivateDrOnly] },

  // RE0021 Front 3col
  {path: 're/notification', component: NotificationPageComponent,
    canActivate: [CanActivateTermOK, CanActivateDrOnly, CanActivateValid]},

  // RE0022 Front
  { path: 're/re0022', component: Re0022PageComponent, canActivate: [ CanActivateLoginPageService ] },
  { path: 're/re0022/:tokenResetPassword', component: Re0022PageComponent },
  { path: 're/re0022/email/:tokenEmail', component: Re0022PageComponent },

  // RE0023 Front
  {path: 're/first-entry', component: FirstEntryPageComponent,
    canActivate: [CanActivateTermNG, CanActivateDrOnly, CanActivateProvisional]},

  // RE0025 Front
  {path: 're/first-entry-confirm', component: FirstEntryConfirmPageComponent,
    canActivate: [CanActivateTermNG, CanActivateDrOnly, CanActivateProvisional]},

  // RE0030 Front 1col
  { path: 're/re0030', component: Re0030PageComponent,
    canActivate: [CanActivateTermOK, CanActivateDrOnly, CanActivateAdmin] },

  // RE0031 Front 3col
  { path: 're/re0031/:userId', component: Re0031PageComponent,
    canActivate: [CanActivateTermOK, CanActivateDrOnly, CanActivateAdmin] },

  /* --------- RE PR JOY ------------- */

  // RE0004 Front 1col
  { path: 're/re0004', component: Re0004PageComponent },

  // RE0006 Front
  { path: 're/re0006/:registerToken', component: Re0006PageComponent },

  // RE0009 Front 3col
  {path: 're/re0009', component: Re0009PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify, CanActivateTermOK]},

  // RE0010 Front 3col
  {path: 're/re0010', component: Re0010PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify, CanActivateTermOK]},

  // RE0010 Front check mail confirm
  {path: 'pr/re/user_edit/:type/:token', component: Re0010PageComponent, canActivate: [CanActivatePrOnly]},

  // RE0011 Front 3col
  {path: 're/re0011', component: Re0011PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify, CanActivateTermOK]},

  // RE0012 Front 3col
  {path: 're/re0012', component: Re0012PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify, CanActivateTermOK]},

  // RE0012 Front 3col
  {path: 're/re0012/:access_token', component: Re0012PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify, CanActivateTermOK]},

  // RE0013 Front 1col
  { path: 're/re0013', component: Re0013PageComponent, canActivate: [ CanActivateLoginPageService ]},
  { path: 're/re0013/email/:tokenEmail', component: Re0013PageComponent},
  { path: 're/re0013/:tokenResetPassword', component: Re0013PageComponent},

  // RE0026 Front 3col
  {path: 're/re0026', component: Re0026PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify, CanActivateTermOK]},

  // RE0027 Front 3col
  {path: 're/re0027', component: Re0027PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify, CanActivateTermOK]},

  // RE0032 Front 1col
  {path: 're/re0032', component: Re0032PageComponent, canActivate: [CanActivatePrOnly,  CanActivateViaAuthGuard, CanActivateTermOK]},


  // RE0036 Front
  // {path: 're/re0036', component: Re0036PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify, CanActivateTermOK]},

  // RE-REGITER Front
  {path: 're/regiter', component: RegiterPageComponent, canActivate: [CanActivateDrOnly, CanActivateViaAuthGuard, CanActivateTermOK]},

  // RE0035 Front
  {path: 're/re0035/:officeUserId/:token', component: RE0035PageComponent, canActivate: [CanActivateDrOnly]},

  // RE0034 Front
  // { path: 're/re0034', component: Re0034PageComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK, CanActivateDrOnly, CanActivateValid] },

  // RE0036 Front
  // { path: 're/re0036', component: Re0036PageComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK, CanActivatePrOnly, CanActivateValid] },

  // OF0001 Front
  // { path: 're/of0001', component: Of0001PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify] },

  // CA0002 Front 2col
  {path: 'ca/ca0002', component: Ca0002PageComponent,
    canActivate: [CanActivateViaAuthGuard, CanActivateTermOK, CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateValid]},

  // CA0006 Front 3col
  { path: 'ca/ca0006', component: Ca0006PageComponent,
    canActivate: [CanActivateViaAuthGuard, CanActivateTermOK, CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateValid] },

  // CA0007 Front 3col
  { path: 'ca/ca0007', component: Ca0007PageComponent,
    canActivate: [CanActivateViaAuthGuard, CanActivateTermOK, CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateValid] },
  { path: 'ca/ca0007/:event_id', component: Ca0007PageComponent,
    canActivate: [CanActivateViaAuthGuard, CanActivateTermOK, CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateValid] },

  // CA0008 Front 3col
  { path: 'ca/ca0008', component: Ca0006PageComponent,
    canActivate: [CanActivateViaAuthGuard, CanActivateTermOK, CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateValid] },

  // CA0009 Front 3col
  { path: 'ca/ca0009', component: Ca0006PageComponent,
    canActivate: [CanActivateViaAuthGuard, CanActivateTermOK, CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateValid] },

  // CA0010 Front 3col
  {path: 'ca/ca0010', component: Ca0006PageComponent,
    canActivate: [CanActivateViaAuthGuard, CanActivateTermOK, CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateValid]},

  // CA0017 Front 3col
  {path: 'ca/ca0017', component: Ca0017PageComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK, CanActivatePrOnly, CanActivatePrIdentify]},

  // Frame meeting Front 3col
  { path: 'ca/frame-meeting', component: FrameMeetingPageComponent,
    canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },
  { path: 'ca/frame-meeting/:event_id', component: FrameMeetingPageComponent,
    canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0001 Front 3col
  {path: 'me/me0001', component: Me0001PageComponent,
    canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0003 Front 3col
  {path: 'me/me0003', component: Me0003PageComponent,
    canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'me/me0003/:visit_id', component: Me0003PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0004 Front 3col
  {path: 'me/me0004/:userId/:officeId', component: Me0004PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0005 Front 3col
  {path: 'me/me0005', component: Me0005PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0006 Front 3col
  {path: 'me/me0006/:userId/:officeId/:requestId', component: Me0006PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  {path: 'me/me0006/:userId/:officeId', component: Me0006PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0008 Front 1col
  {path: 'me/me0008/:session_token', component: Me0008PageComponent},

  // ME0009 Front 1col
  {path: 'me/me0009/:requestId/:nonceId/:nonceToken/:redirectUrl', component: Me0009PageComponent, canActivate: [CanActivateDrOnly]},

  // ME0007 Front 3col
  { path: 'me/me0007/:typeId/:requestId', component: Me0007PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0010 Front 3col
  {path: 'me/me0010', component: Me0010PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0012 Front 3col
  {path: 'me/me0012', component: Me0012PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0013 Front 3col
  {path: 'me/me0013', component: Me0013PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0014 Front 3col
  { path: 'me/me0014', component: Me0014PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0016 Front 3col
  { path: 'me/me0016', component: Me0016PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },
  { path: 'me/me0016/:flag/:userId/:officeId', component: Me0016PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0017 Front 3col
  { path: 'me/me0017', component: Me0017PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0015 Front 3col
  { path: 'me/me0015', component: Me0015PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0018 Front 3col
  {path: 'me/me0018', component: Me0016PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0021 Front 3col
  {path: 'me/me0021', component: Me0016PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'me/me0021/:flag/:userId/:officeId', component: Me0016PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0023 Front 3col
  {path: 'me/me0023', component: Me0023PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0024 Front 2col
  { path: 'me/me0024', component: Me0024PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0031 Front 3col
  {path: 'me/me0031/:requestId', component: Me0031PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME0030 Front 3col
  { path: 'me/me0030', component: Me0030PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0032 Front 3col
  { path: 'me/me0032', component: Me0032PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0036 Front 3col
  { path: 'me/me0036/:userId/:officeId', component: Me0036PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0033 Front 3col
  { path: 'me/me0033/:frameId', component: Me0033PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0035 Front 3col
  { path: 'me/me0035', component: Me0035PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME5008 Front 3col
  {path: 'me/me5008', component: Me5008PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK]},

  // ME5001 Front 3col
  { path: 'me/me5001', component: Me5001PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME5002 Front 3col
  { path: 'me/me5002', component: Me5002PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },
  { path: 'me/me5002/:type', component: InvoiceComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // SH0001 Front
  { path: 'sh/sh0001', component: Sh0001PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // SH0002 Front
  { path: 'sh/sh0002', component: Sh0002PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // SH0004 Front
  { path: 'sh/sh0004', component: Sh0004PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // SH0006 Front
  { path: 'sh/sh0006', component: Sh0006PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // SH0007 Front
  { path: 'sh/sh0007', component: Sh0007PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // SH0008 Front
  { path: 'sh/sh0008', component: Sh0008PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // SH0009 Front
  { path: 'sh/sh0009', component: Sh0009PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // SH0011 Front
  { path: 'sh/sh0011', component: Sh0011PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // SH0012 Front
  { path: 'sh/sh0012', component: Sh0012PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // SH0013 Front
  { path: 'sh/sh0013', component: Sh0013PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // Pr.JOY

  // ca0014 Front 2col
  { path: 'ca/ca0014', component: Ca0014PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ca0018 Front 3col
  { path: 'ca/ca0018', component: Ca0018PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },
  { path: 'ca/ca0018/:event_id', component: Ca0018PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // Meeting

  // ME0028 Front 3col
  { path: 'me/me0028/:userId/:officeId', component: Me0028PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0029 Front 3col
  { path: 'me/me0029/:userId/:officeId/:modelInput/:requestId', component: Me0029PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },
  { path: 'me/me0029/:userId/:officeId/:modelInput', component: Me0029PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0032 Front 3col
  { path: 'me/me0032', component: Me0032PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0036 Front 3col
  { path: 'me/me0036', component: Me0036PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0048 Front 3col
  { path: 'me/me0048', component: Me0048PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0049 Front 3col TODO: もしかしたらいらいないかも by sasaki
  { path: 'me/me0049', component: Me0049PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0050 Front 3col
  { path: 'me/me0050', component: Me0050PageComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK] },

  // ME0054 Front 3col
  { path: 'me/me0054', component: Me0054PageComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK] },

  // Group
  // GR0002 Front 3col
  { path: 'gr/gr0002', component: Gr0002PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // GR0003 Front 3col
  { path: 'gr/gr0003', component: Gr0003PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // GR0004 Front 3col
  { path: 'gr/gr0004/:groupId', component: Gr0004PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // GR0005 Front 3col
  { path: 'gr/gr0005/:groupId', component: Gr0005PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // GR0006 Front 3col
  { path: 'gr/gr0006', component: Gr0006PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK] },

  // GR0007 Front 3col
  {path: 'gr/gr0007/:groupId', component: Gr0007PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // GR0008 Front 3col
  {path: 'gr/gr0008/:groupId', component: Gr0008PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // GR0009 Front 3col
  {path: 'gr/gr0009/:groupId', component: Gr0009PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // GR0011 Front 3col
  {path: 'gr/gr0011/:groupId', component: Gr0011PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // GR0013 Front 3col
  {path: 'gr/gr0013/:type', component: Gr0013PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // GR-detail 3col
  {path: 'gr/detail/:groupId/:articleId', component: DetailPageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  {path: 'gr/detail/:groupId/:articleId/:commentId', component: DetailPageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // GR: import-data
  {path: 'gr/import/:groupId', component: ImportDataComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // GR0014 Front 3col
  {path: 'gr/gr0014', component: Gr0014PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CH0003 Front
  {path: 'ch/ch0003', component: Ch0003PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CH0004 Front
  {path: 'ch/ch0004/:roomId', component: Ch0004PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CH0005 Front
  {path: 'ch/ch0005', component: Ch0005PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CH0006 Front
  {path: 'ch/ch0006/:roomId', component: Ch0006PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CH0007 Front
  {path: 'ch/ch0007/:roomId', component: Ch0007PageComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'ch/ch0007/:roomId/:messageId', component: Ch0007PageComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'ch/chat', component: ChatComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  // {path: 'ch/chat-end', component: ChatEndComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},
  // {path: 'ch/chat-user', component: ChatUserComponent, canActivate: [CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0001 Front 3col
  {path: 'he/he0001', component: He0001PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0002 Front 3col
  {path: 'he/he0002', component: He0002PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0003 Front 3col
  {path: 'he/he0003', component: He0003PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0004 Front 3col
  {path: 'he/he0004', component: He0004PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0006 Front 3col
  {path: 'he/he0006', component: He0006PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0007 Front 3col
  {path: 'he/he0007', component: He0007PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0008 Front 3col
  {path: 'he/he0008', component: He0008PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0009 Front 3col
  {path: 'he/he0009', component: He0009PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0010 Front 3col
  {path: 'he/he0010', component: He0010PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0011 Front 3col
  {path: 'he/he0011', component: He0011PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0012 Front 3col
  {path: 'he/he0012', component: He0012PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0013 Front 3col
  {path: 'he/he0013', component: He0013PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0014 Front 3col
  {path: 'he/he0014', component: He0014PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0015 Front 3col
  {path: 'he/he0015', component: He0015PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // HE0016 Front 3col
  {path: 'he/he0016', component: He0016PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0000 Front
  {path: 'cm/cm0000dr', component: Cm0000DrPageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermNG]},
  {path: 'cm/cm0000pr', component: Cm0000PrPageComponent, canActivate: [CanActivatePrOnly, CanActivateViaAuthGuard, CanActivateTermNG]},

  // CM0001 Front 3col
  {path: 'cm/cm0001', component: Cm0001PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0002 Front 3col
  {path: 'cm/cm0002', component: Cm0002PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0005 Front 3col
  // CM0005-1_取引先へのお知らせ一覧
  {path: 'cm/cm0005', component: Cm0005PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},
  // CM0005-2_取引先へのお知らせ作成
  {path: 'cm/cm0005/new', component: Cm0005PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK], canDeactivate: [BeforeunloadGuard]},
  // CM0005-3_取引先へのお知らせ詳細
  {path: 'cm/cm0005/:infoId', component: Cm0005PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0006 Front 3col
  {path: 'cm/cm0006', component: Cm0006PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0007 Front 3col
  {path: 'cm/cm0007', component: Cm0007PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0008 Front 3col
  {path: 'cm/cm0008', component: Cm0008PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK]},
  // CM0008 お知らせ詳細
  {path: 'cm/cm0008/:infoId', component: Cm0008PageComponent, canActivate: [CanActivatePrOnly, CanActivatePrIdentify,  CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0012 Front 3col
  {path: 'cm/cm0012', component: Cm0012PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0013 Front 3col
  {path: 'cm/cm0013', component: Cm0013PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0014 Front 3col
  {path: 'cm/cm0014', component: Cm0014PageComponent, canActivate: [CanActivateSuperAdmin, CanActivateAdmin, CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0016 Front 3col
  {path: 'cm/cm0016', component: Cm0016PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},

  // CM0017 Front 3col
  {path: 'cm/cm0017dr/:target', component: Cm0017DrPageComponent, canActivate: [CanActivateDrOnly, CanActivateDrPersonalVerify, CanActivateViaAuthGuard, CanActivateTermOK]},
  {path: 'cm/cm0017pr/:target', component: Cm0017PrPageComponent, canActivate: [CanActivatePrOnly, CanActivateViaAuthGuard, CanActivateTermOK]},

  // PH0001 Front
  {path: 'ph/ph0001', component: Ph0001PageComponent, canActivate: [CanActivateDrOnly, CanActivateAdminPharmacy]},

  // PH0003 Front
  {path: 'ph/ph0003', component: Ph0011PageComponent, canActivate: [CanActivateDrOnly, CanActivatePharmacy]},

  // PH0004 Front
  {path: 'ph/ph0004', component: Ph0004PageComponent, canActivate: [CanActivateDrOnly, CanActivatePharmacy]},

  // PH0005 Front
  {path: 'ph/ph0005', component: Ph0014PageComponent, canActivate: [CanActivateDrOnly, CanActivatePharmacy]},

  // PH0006
  {path: 'ph/ph0006', component: Ph0006PageComponent, canActivate: [CanActivateDrOnly, CanActivatePharmacy]},

  // PH0007 Front
  {path: 'ph/ph0007', component: Ph0007PageComponent, canActivate: [CanActivateDrOnly, CanActivatePharmacy]},

  // PH0008 Front
  {path: 'ph/ph0008', component: Ph0008PageComponent, canActivate: [CanActivateDrOnly, CanActivateAdminPharmacy]},

  // PH0010 Front
  {path: 'ph/ph0010', component: Ph0010PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrugStorePharmacy]},

  // PH0011 Front
  {path: 'ph/ph0011', component: Ph0011PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrugStorePharmacy]},

  // PH0012 Front
  {path: 'ph/ph0012', component: Ph0012PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrugStorePharmacy]},

  // PH0014 Front
  {path: 'ph/ph0014', component: Ph0014PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrugStorePharmacy]},

  // PH0015 Front
  {path: 'ph/ph0015', component: Ph0015PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrugStorePharmacy]},

  // PH0016
  {path: 'ph/ph0016', component: Ph0006PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrugStorePharmacy]},

  // PH0017 Front
  {path: 'ph/ph0017', component: Ph0017PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrugStorePharmacy]},

  // PH0018 Front
  {path: 'ph/ph0018', component: Ph0018PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrugStoreAdminPharmacy]},

  // PH0021 Front
  {path: 'ph/ph0021', component: Ph0021PageComponent, canActivate: [CanActivateDrOnly, CanActivateAdminPharmacy]},

  // PH0023 Front
  {path: 'ph/ph0023', component: Ph0021PageComponent, canActivate: [CanActivateDrOnly, CanActivateDrugStoreAdminPharmacy]},

  {path: 'file/download/:fileApi/:fileName', component: FileTransferDownloadPageComponent},

  // AT Roue
  {path: 'at/at0001', component: At0001Component, canActivate: [CanActivateDrOnly, CanActivateViaAuthGuard]},
  {path: 'at/at0004', component: At0004Component, canActivate: [CanActivateDrOnly, CanActivateViaAuthGuard]},
  {path: 'at/at0005', component: At0005Component, canActivate: [CanActivateDrOnly, CanActivateViaAuthGuard]},
  {path: 'at/at0006', component: At0006Component, canActivate: [CanActivateDrOnly, CanActivateViaAuthGuard]},

  {path: 'error', component: ErrorPageComponent},
  {path: 'NotFound', component: NotFoundPageComponent},
  {path: '**', component: NotFoundPageComponent}

];

// 遷移時のログ用サービスの追加、後で外す
for (let route of appRoutes) {
  if (route.canActivate) {
    route.canActivate.push(RouterLogService);
  }
  else {
    route.canActivate = [ RouterLogService ];
  }
}

/**
 * 言語設定ファイルの読み込み
 * @param http
 * @returns {TranslateHttpLoader}
 */
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/**
 * Backend factory.
 */
export function createBackend(real: XHRBackend, options: RequestOptions, mock: MockBackend,
                              auth: AuthenticationService) {
  let backend;
  switch (environment.profile) {
    case Profile.mock:
      backend = new BackendMock(real, mock, options);
      break;
    case Profile.demo:
      backend = new BackendDemo(real, options);
      break;
    case Profile.develop:
    case Profile.ominext_gcp:
      backend = new BackendDevelop(real, options, auth);
      break;
    case Profile.staging:
      backend = new BackendStaging(real, options, auth);
      break;
    case Profile.release:
      backend = new BackendService(real, options, auth);
      break;
    default:
      backend = new BackendLocal(real, options, auth);
      break;
  }
  return backend;
}

@NgModule({
  declarations: [
    AppComponent,
    TopPageComponent,
    LoginPageComponent,
    LogoutPageComponent,
    NotFoundPageComponent,
    HeaderComponent,
    SideMenuComponent,
    SettingsPanelComponent,
    InfoPanelComponent,
    ColSubComponent,
    ImageCropperComponent,
    NotificationPageComponent,
    PasswordPageComponent,
    StaffAdminPageComponent,
    PageHeadComponent,
    UserEditPageComponent,
    StaffEditPageComponent,
    NodeEditPageComponent,
    SideMenuEditPageComponent,
    StaffListPageComponent,
    FirstEntryPageComponent,
    FirstEntryConfirmPageComponent,
    ModalComponent,
    ModalSimpleComponent,
    ModalInputComponent,
    ModalCheckboxComponent,
    ModalTextAreaComponent,
    PopupHoverComponent,
    StaffInvitePageComponent,
    Re0006PageComponent,
    Re0009PageComponent,
    Re0010PageComponent,
    Re0011PageComponent,
    Re0012PageComponent,
    Re0026PageComponent,
    Re0027PageComponent,
    Re0030PageComponent,
    Re0031PageComponent,
    DepartmentSelectComponent,
    HeaderDrjoyComponent,
    HeaderPrjoyComponent,
    HeaderDrjoyVisitorComponent,
    HeaderPrjoyVisitorComponent,
    Re0004PageComponent,
    Re0009PageComponent,
    Ca0002PageComponent,
    Ca0006PageComponent,
    Ca0007PageComponent,
    Ca0008PageComponent,
    Ca0009PageComponent,
    Ca0010PageComponent,
    CalendarConsentComponent,
    ColorPickerPanelComponent,
    FrameMeetingPageComponent,
    SideMenuDrjoyComponent,
    OptionColorComponent,
    SideMenuPrjoyComponent,
    DateInputComponent,
    TelInputComponent,
    PasswordInputComponent,
    MemberSelectComponent,
    MemberSelectCopyComponent,
    MiniProfileComponent,
    FaceIconComponent,
    Gr0002PageComponent,
    Gr0003PageComponent,
    Gr0004PageComponent,
    Gr0005PageComponent,
    Gr0006PageComponent,
    Gr0007PageComponent,
    Gr0008PageComponent,
    Gr0009PageComponent,
    Gr0011PageComponent,
    Gr0013PageComponent,
    SearchFilter,
    FilterUserInfoPipe,
    FormatSizeUnitsPipe,
    DisplayDepartmentPipe,
    TimePipe,
    WrapTextPipe,
    FormatNumber,
    Me0001PageComponent,
    Me0003PageComponent,
    Me0004PageComponent,
    Me0005PageComponent,
    Me0006PageComponent,
    Me0007PageComponent,
    Me0008PageComponent,
    Me0009PageComponent,
    Me0010PageComponent,
    Me0012PageComponent,
    Me0013PageComponent,
    Me0014PageComponent,
    Me0015PageComponent,
    Me0016PageComponent,
    Me0017PageComponent,
    Me0018PageComponent,
    Me0019PageComponent,
    Me0020PageComponent,
    Me0021PageComponent,
    Me0023PageComponent,
    Me0024PageComponent,
    Me0025PageComponent,
    Me0028PageComponent,
    Me0029PageComponent,
    Me0030PageComponent,
    Me0031PageComponent,
    Me0032PageComponent,
    Me0033PageComponent,
    Me0035PageComponent,
    Me0036PageComponent,
    Me5008PageComponent,
    StringTrimComponent,
    InfinitiveSelectComponent,
    AttachmentTextBoxComponent,
    AttachmentTextBoxContentsComponent,
    AttachmentTextBoxFileUploadComponent,
    ReportCommentListComponent,
    ReportFileDisplayComponent,
    ConvertTimeToJaPipe,
    InfiniteScrollComponent,
    PrOfficeSelectComponent,
    PrOfficeSelectComponent,
    HoursMinutesStartEnd,
    CountUpInputComponent,
    CountUpTextareaComponent,
    InsideStaffDetailsPopupComponent,
    OutsideStaffDetailsPopupComponent,
    DestinationPopoverComponent,
    GroupboardContributionComponent,
    ThumbnailDirective,
    CreateMedicalPageComponent,
    GroupIconComponent,
    GroupIconSetComponent,
    ModalCropperComponent,
    Ch0003PageComponent,
    Ch0004PageComponent,
    Ch0005PageComponent,
    Ch0006PageComponent,
    Ch0007PageComponent,
    ChatComponent,
    // ChatEndComponent,
    // ChatUserComponent,
    StaffPopoverComponent,
    StaffDetailsPopupComponent,
    Re0022PageComponent,
    Re0013PageComponent,
    OrderByPipe,
    AttachedFilesComponent,
    StampComponent,
    ModalAttachedComponent,
    ModalInputCustomComponent,
    MemberListComponent,
    MemberListAllComponent,
    ModalMemberListComponent,
    GroupArticleInformationComponent,
    GroupCommentInfoComponent,
    Ca0014PageComponent,
    Ca0018PageComponent,
    FilePreviewComponent,
    ModalFilePreviewComponent,
    MultiSelectComponent,
    He0003PageComponent,
    He0008PageComponent,
    He0009PageComponent,
    He0010PageComponent,
    He0001PageComponent,
    He0002PageComponent,
    He0004PageComponent,
    He0006PageComponent,
    He0007PageComponent,
    He0011PageComponent,
    He0012PageComponent,
    He0013PageComponent,
    He0014PageComponent,
    He0015PageComponent,
    He0016PageComponent,
    Cm0001PageComponent,
    Cm0002PageComponent,
    Cm0005PageComponent,
    Cm0006PageComponent,
    Cm0007PageComponent,
    Cm0008PageComponent,
    Cm0014PageComponent,
    Ca0017PageComponent,
    Cm0012PageComponent,
    Cm0014PageComponent,
    Cm0016PageComponent,
    Cm0017DrPageComponent,
    Cm0017PrPageComponent,
    FileDisplayComponent,
    EditSurveyComponent,
    AutoTextLengthPipe,
    Gr0014PageComponent,
    Ph0001PageComponent,
    Ph0004PageComponent,
    Ph0006PageComponent,
    Ph0007PageComponent,
    Ph0008PageComponent,
    Ph0010PageComponent,
    Ph0011PageComponent,
    Ph0012PageComponent,
    Ph0014PageComponent,
    Ph0015PageComponent,
    Ph0017PageComponent,
    Ph0018PageComponent,
    ErrorPageComponent,
    Me5001PageComponent,
    Me5002PageComponent,
    ModalInputValidateComponent,
    InvoiceComponent,
    DetailPageComponent,
    ColSubDrComponent,
    ColSubPrComponent,
    Of0001PageComponent,
    RegiterPageComponent,
    Re0034PageComponent,
    SettingsPanelDrComponent,
    SettingsPanelPrComponent,
    AutoSizeTextareaDirective,
    TimeAgoComponent,
    RequestMeetingDrComponent,
    RequestMeetingPrComponent,
    Me0048PageComponent,
    Me0049PageComponent,
    FaceIconSetComponent,
    Ph0021PageComponent,
    ModalInvitePharmacyStaffComponent,
    FaceIconSetComponent,
    Me0050PageComponent,
    Me0054PageComponent,
    ModalInvitePharmacyStaffComponent,
    Cm0013PageComponent,
    Re0032PageComponent,
    Re0036PageComponent,
    FormCreateRequestDrComponent,
    RE0035PageComponent,
    FormCreateRequestPrComponent,
    DrugRegistAlertComponent,
    ConvertUserInfoPipe,
    Sh0001PageComponent,
    Sh0002PageComponent,
    HeaderDrjoyProvisionalComponent,
    HeaderPrjoyProvisionalComponent,
    Sh0004PageComponent,
    ModalTemplateComponent,
    Cm0000DrPageComponent,
    Cm0000PrPageComponent,
    Sh0007PageComponent,
    Sh0008PageComponent,
    Sh0009PageComponent,
    Sh0011PageComponent,
    Sh0012PageComponent,
    Sh0006PageComponent,
    LinkyDirective,
    Sh0013PageComponent,
    FileTransferDownloadPageComponent,
    ImgPreloaderDirective,
    ImportDataComponent,
    AutoFocusTextboxDirective,
    FormStaffInviteDrComponent,
    At0001Component,
    At0004Component,
    At0005Component,
    At0006Component
  ],
  imports: [
    FileUploadModule,
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    InfiniteScrollModule,
    FormsModule,
    LSelect2Module,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    ColorPickerModule,
    NguiAutoCompleteModule,
    TextareaAutosizeModule,
    NgbModule.forRoot(),
    ClickOutsideModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    NgxOAuthModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.DEBUG,
      serverLoggingUrl: '',
    }),
    ScrollToModule.forRoot(),
    LazyLoadImageModule,
    VirtualScrollModule
  ],
  exports: [
    TranslateModule
  ],
  providers: [
    SearchService,
    NotificationService,
    SideMenuService,
    SoundService,
    AuthenticationMessage,
    SideMenuMessage,
    SideMenuOrderMessage,
    FirebaseReadyMessage,
    AuthenticationService,
    CanActivateViaAuthGuard,
    CanActivateAdmin,
    CanActivateSuperAdmin,
    CanActivateValid,
    CanActivateProvisional,
    CanActivatePermanent,
    CanActivateDrOnly,
    CanActivateDrPersonalVerify,
    CanActivatePrOnly,
    CanActivatePrIdentify,
    CanActivateAdminPharmacy,
    CanActivatePharmacy,
    CanActivateDrugStoreAdminPharmacy,
    CanActivateDrugStorePharmacy,
    CanActivateTermOK,
    CanActivateTermNG,
    CanActivateLoginPageService,
    RouterLogService,
    SharedValueService,
    RegistrationService,
    CalendarService,
    MeetingService,
    MeetingNologinService,
    DialogService,
    GroupService,
    Validator,
    CalendarCommon,
    MeetingCommon,
    Helper,
    DateConverter,
    FormatSizeConverter,
    {
      provide: Http,
      useFactory: (createBackend),
      deps: [XHRBackend, RequestOptions, MockBackend, AuthenticationService]
    },
    XHRBackend,
    MockBackend,
    BaseRequestOptions,
    FirebaseService,
    FirebaseStorage,
    FirebaseDatabase,
    LocalStorage,
    ChatService,
    CmsService,
    MasterService,
    [{
      provide: NgbDateParserFormatter,
      useClass: NgbDateMomentParserFormatter
    }],
    BaseService,
    BeforeunloadGuard,
    PreLoginService,
    TimelineService,
    InformationService,
    PharmacyService,
    StompRService,
    WsService,
    DrjoyInformationService,
    DrjoyInfoAlertMessage,
    UserService,
    LoginUserInfoMessage,
    UnseenService,
    Unseens,
    AttendanceService
  ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  entryComponents: [ ColorPickerPanelComponent ]
})

export class AppModule {
}
