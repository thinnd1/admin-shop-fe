import { Component, OnInit } from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import {InvitePersonalRegistration} from '../../../models/re/invite-personal-registration';
import {RegistrationService} from '../../../services/registration.service';
import {HttpError} from '../../../common/error/http.error';
import {MedicalOffice} from '../../../models/ma/medical-office';
import {MasterService} from '../../../services/master.service';

@Component({
  selector: 'app-of0001-page',
  templateUrl: './of0001-page.component.html',
  styleUrls: ['./of0001-page.component.scss']
})
export class Of0001PageComponent implements OnInit {
  public model = new InvitePersonalRegistration();
  public checkAccept = false;
  public checkPharmacist = false;
  checkCode = false;
  infiniteScrollOptions: any = {
    page: 0,
    size: 20
  };
  keyword = '';
  isLoading = true;
  isOpen = false;
  currentPage = 0;
  listMedical = [];
  isCalledApi = false;
  medicalSelected: any;
  isResetInput = false;
  errorResponseOther: string;
  listIndustry: any;
  medicalId: any;
  disabledButton = false;

  constructor(private dialog: DialogService,
              private service: RegistrationService,
              private masterService: MasterService) { }

  ngOnInit() {
  }

  ischeckAccept(checkAccept) {
    if (event) {
      this.checkAccept = !checkAccept;
    }
  }

  ischeckPharmacist(checkPharmacist) {
    if (event) {
      this.checkPharmacist = !checkPharmacist;
    }
  }

  ischeckCode(checkCode) {
    if (event) {
      this.checkCode = !checkCode;
    }
     if (!this.checkCode) {
       this.model.invitationCode = '';
     }
  }

  addData() {
    if (this.checkAccept === true && this.checkPharmacist === true) {
      setTimeout(() => {
        this.dialog.setLoaderVisible(true);
      });
      this.service.postRegisterPersonalAccount(this.model).subscribe(res => {
        setTimeout(() => {
          this.dialog.setLoaderVisible(false);
        });
        this.dialog.showSuccess('Password:   ' + res.result.password);
      }, (error: HttpError) => {
        setTimeout(() => {
          this.dialog.setLoaderVisible(false);
        });
        this.dialog.showError('MSG.ERROR');
      });
    }
  }

  searchMedicalOffices(keyword: any) {
    if (keyword !== '') {
      this.masterService.getMedicals(keyword, this.infiniteScrollOptions.page, this.infiniteScrollOptions.size)
        .subscribe((settings: MedicalOffice) => {
            this.keyword = keyword;
            this.isLoading = false;
            this.isOpen = true;
            this.currentPage = this.infiniteScrollOptions.page;
            this.listMedical = this.infiniteScrollOptions.page === 0 ? settings.medicalOffices :
              this.listMedical.concat(settings.medicalOffices);
            this.isCalledApi = this.infiniteScrollOptions.size === settings.medicalOffices.length;
          },
          error => {
            this.isOpen = false;
            this.isLoading = false;
            setTimeout(() => {
              this.dialog.setLoaderVisible(false);
            });
            this.dialog.showError('MSG.ERROR');
          });
    } else {
      this.listMedical = [];
      this.infiniteScrollOptions.page = 0;
      this.isLoading = false;
      this.isOpen = false;
    }
  }

  onScrollDown () {
    if (this.currentPage === this.infiniteScrollOptions.page && this.isCalledApi) {
      this.infiniteScrollOptions.page += 1;
      this.searchMedicalOffices(this.keyword);
    }
  }

  selectedMedical(office: any) {
    if (office) {
      this.medicalSelected = office;
      this.isOpen = false;
      this.isResetInput = true;
      this.listMedical = [];
      this.errorResponseOther = '';
      this.medicalId = this.medicalSelected.id;
      this.model.medicalOfficeId = this.medicalSelected.id;
      this.getListOfficeMedical()
      if (this.medicalSelected.personalFlag === false) {
        this.disabledButton = true;
        this.dialog.showMessage( '', true, 'OF0001.OF0001_MSG', null, null, 'MSG.OK', null);
      } else {
        this.disabledButton = false;
      }
    }
  }

  getListOfficeMedical() {
    this.masterService.getListIndustry(this.medicalId).subscribe(
      (res) => {
        this.listIndustry = res.industries;
      }
    );
  }

  hideDropdown(event) {
    this.isOpen = false;
    this.listMedical = [];
    this.infiniteScrollOptions.page = 0;
  }

}
