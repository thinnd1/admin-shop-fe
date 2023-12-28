import {Component, OnInit} from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import {PharmacyService} from '../../../services/pharmacy.service';
import {TranslateService} from '@ngx-translate/core';
import {ReportUpdateSetting} from '../../../models/ph/report-update-setting';
import {ActivatedRoute, Router} from '@angular/router';
import {AccountStatus} from '../../../models/ba/user-session';
import {GroupService} from '../../../services/group.service';


declare const $: any;


@Component({
  selector: 'app-ph0014-page',
  templateUrl: './ph0014-page.component.html',
  styleUrls: ['./ph0014-page.component.scss']
})
export class Ph0014PageComponent implements OnInit {
  public model = new ReportUpdateSetting();
  topicId: any;
  const: any = {};
  progress = 0;
  path: any;
  checkPage: boolean;
  showView: any;
  accountStatuses: any;
  protocolsText: string;
  prescriptionUpdateReasonText: string;
  prescriptionUpdateReason = [
    {id: 0, key: 'BRAND_CHANGE', text: this.translate.instant('PHARMACY.COMMON.BRAND_CHANGE')},
    {id: 1, key: 'APPLICATION_DAYS_CHANGE', text: this.translate.instant('PHARMACY.COMMON.APPLICATION_DAYS_CHANGE')},
    {id: 2, key: 'GENERIC_DRUG_CHANGE', text: this.translate.instant('PHARMACY.COMMON.GENERIC_DRUG_CHANGE')},
    {id: 3, key: 'PACKAGING', text: this.translate.instant('PHARMACY.COMMON.PACKAGING')},
    {id: 4, key: 'DOSAGE_FORM_CHANGE', text: this.translate.instant('PHARMACY.COMMON.DOSAGE_FORM_CHANGE')},
    {id: 5, key: 'STANDARD_CHANGE', text: this.translate.instant('PHARMACY.COMMON.STANDARD_CHANGE')},
    {id: 6, key: 'REMAINING_ADJUSTMENT', text: this.translate.instant('PHARMACY.COMMON.REMAINING_ADJUSTMENT')},
    {id: 7, key: 'OTHER', text: this.translate.instant('PHARMACY.COMMON.OTHER')},
  ];
  userInfo: any;
  fullNameKana: string;
  fullName: string;
  listAttachments: any = [];
  constructor(private dialogService: DialogService,
              private translate: TranslateService,
              private pharmacyService: PharmacyService,
              private router: Router,
              private groupService: GroupService,
              private activatedRoute: ActivatedRoute) {
      this.showView = this.router.url.indexOf('ph0014') >= 0;
  }
  ngOnInit() {
    this.activatedRoute
      .queryParams
      .subscribe(params => {
        this.topicId = params['topicId'];
      });
    this.getUpdateReport();

    (<any>window).prescriptionUpdateReport = true;
  }
  selectTextPrescriptionUpdateReason(id: number): string {
    const res = this.prescriptionUpdateReason.filter(
      pre => pre.id === id
    );
    return res[0].text;
  }

  printPage() {
    const css = '@page {size:A4;margin: 50px 0;}';
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'print';
    this.destroyTooltip();
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    window.print();
    $('[data-toggle="tooltip"]').tooltip();
    return false;
  }

  destroyTooltip() {
    $('[data-toggle="tooltip"]').tooltip('dispose');
  }

  getUpdateReport() {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getUpdateReport(this.topicId).subscribe(
      (settings) => {
        this.dialogService.setLoaderVisible(false);
        this.model = settings;
        this.path = '/pharmacy/updateReport/' + this.model.firebaseStorageTopicPath;
        this.progress = 0;
        if (this.model.protocolUsage !== -1) {
          if (this.model.protocolUsage === 1) {
            this.protocolsText = this.translate.instant('PH0015.PROTOCOL_YES');
          } else {
            this.protocolsText = this.translate.instant('PH0015.PROTOCOL_NO');
          }
        } else {
          this.protocolsText = '';
        }
        if (parseInt(this.model.prescriptionUpdateReason, 10) === -1) {
          this.prescriptionUpdateReasonText = '';
        }else {
          this.prescriptionUpdateReasonText = this.selectTextPrescriptionUpdateReason(this.model.prescriptionUpdateReason);
        }
        this.accountStatuses = new AccountStatus(this.model.accountStatuses).isInvalid;
        this.userInfo = {
          fullNameKana: this.model.lastNameKana + ' ' + this.model.firstNameKana,
          fullName: this.model.lastName + ' ' + this.model.firstName,
          imageUrl: this.model.imageURL,
          officeName: this.model.drugStoreOfficeName,
          lastName: this.model.lastName,
          firstName: this.model.firstName,
          accountStatus: this.model.accountStatuses,
          deptId: '',
          deptName: this.model.departmentName,
          id: this.model.officeUserId,
          invalid: this.accountStatuses
        };

      },
      (error) => {
        this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      });
  }
  showUserInfo($event, user: any) {
    $event.preventDefault();
    $('.tooltip').remove();
    this.detailUserDialog(user);
  }
  detailUserDialog(user: any) {
    if (new AccountStatus(user.accountStatus).isValid && !new AccountStatus(user.accountStatus).isLocking) {
      setTimeout(() => {
        this.dialogService.setLoaderVisible(true);
      });
      this.groupService.getDetailUser(user.id).subscribe(res => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showStaffDetailsDialog(null, {data: res, officeUserId: 'dr'});
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
    } else if (new AccountStatus(user.accountStatus).isLocking && new AccountStatus(user.accountStatus).isValid) {
      let html = '';
      this.translate.get('MSG.GR.LOCKED_ACCOUNT_PROFILE_POPUP').subscribe(msg => {
        html = '<div><h1 class="font-weight-bold">' + msg.MSG_1 + '<br>' + msg.MSG_2 + '</h1></div><br><div>' + msg.MSG_3 + '</div><div>' + msg.MSG_4 + '</div>';
      });
      this.dialogService.showMessage('error', false, null, null, html, 'MSG.OK', null).subscribe();
    }
  }
}
