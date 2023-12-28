import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';
import {DialogService} from '../../services/dialog.service';
import {SharedValueService} from '../../services/shared-value.service';
import {PharmacyService} from '../../services/pharmacy.service';
import {CreateTemplate} from '../../models/ph/create-template';
import {Helper} from '../../common/helper';
import {DialogResult} from '../../models/dialog-param';
declare const $: any;
const Z_INDEX_UP = 1050;
const Z_INDEX_DOWN = 1040;

@Component({
  selector: 'app-modal-template',
  templateUrl: './modal-template.component.html',
  styleUrls: ['./modal-template.component.scss']
})
export class ModalTemplateComponent implements OnInit {
  @Output() updateTemplate = new EventEmitter<any>();
  template = [];
  options: any;
  textTranslate: string;
  templateId: any;
  public editTemplate = false;
  validationForm: any = {};
  public formCreateTemplate: CreateTemplate;
  public id;
  zIndex;
  formErrors = {
    templateName: '',
    templateContent: ''
  };
  constructor(private dialogService: DialogService,
              private helper: Helper,
              private translate: TranslateService,
              private pharmacyService: PharmacyService,
              private shareValue: SharedValueService,
              private location: Location) {
  }
  ngOnInit() {
    this.zIndex = Z_INDEX_UP;
    this.options = {
      dropdownParent: $('#modal-getTemplate'),
      language: {
        noResults: () => {
          return this.translate.instant('PHARMACY.TRACING_REPORT.SELECT2_NO_RESULT');
        }
      },
    };
    this.formCreateTemplate = new CreateTemplate();
    this.callApiListTemplate();
    this.resetFormPopup();
    this.translate.get('PHARMACY.PH0026').subscribe((res: any) => {
      this.validationForm = res;
      this.textTranslate = this.validationForm.TEMPLATE;
    });
  }

  // Modal
  callApiListTemplate(id?: string) {
    this.dialogService.setLoaderVisible(true);
    this.pharmacyService.getTemplate().subscribe(
      (res) => {
        this.dialogService.setLoaderVisible(false);
        const listTemplate = new Array();
        listTemplate[0] = {'id': 'new', 'text': this.textTranslate};
        for (let i = 0; i < res.length; i++) {
          const temp = {'id': res[i].id, 'text': res[i].templateName, 'templateContent': res[i].templateContent};
          listTemplate.push(temp);
        }
        this.updateTemplate.emit({});
        this.template = listTemplate;
        this.templateId = id;
      },
      (error) => {
        this.dialogService.setLoaderVisible(false);
        this.dialogService.showError('MSG.ERROR');
      });
  }

  createTemplate() {
    if ((this.formCreateTemplate.templateName).trim() === '' || !this.formCreateTemplate.templateName) {
      this.formErrors.templateName = this.validationForm.VALIDATE.TEMPLACE_NAME_REQUIRED;
    } else {
      this.formErrors.templateName = '';
    }
    if (this.formCreateTemplate.templateName.length > 64) {
      this.formErrors.templateName = this.validationForm.VALIDATE.TEMPLACE_NAME_LENGTH;
    }
    if ((this.formCreateTemplate.templateContent).trim() === '' || !this.formCreateTemplate.templateContent) {
      this.formErrors.templateContent = this.validationForm.VALIDATE.TEMPLACE_CONTENT_REQUIRED;
    } else {
      this.formErrors.templateContent = '';
    }
    if (this.formCreateTemplate.templateContent.length > 3000) {
      this.formErrors.templateContent = this.validationForm.VALIDATE.TEMPLACE_CONTENT_LENGTH;
    }
    if (this.formErrors.templateName === '' && this.formErrors.templateContent === '') {
      this.pharmacyService.postCreateTemplate(this.formCreateTemplate).subscribe(
        (response) => {
          this.dialogService.setLoaderVisible(false);
          this.zIndex = Z_INDEX_DOWN;
          this.dialogService.showMessage('success', false, null, 'PHARMACY.PH0026.SAVED_SUCCESS', null,
            'MSG.OK', null).subscribe(() => {
            this.changeScrollHidden();
            this.zIndex = Z_INDEX_UP;
          });
          this.formCreateTemplate.id =  response['templateId'];
          this.callApiListTemplate(this.formCreateTemplate.id);
          this.editTemplate = false;
        },
        (error) => {
          this.dialogService.setLoaderVisible(false);
          this.dialogService.showError('MSG.ERROR');
        }
      );
    }
  }
  resetFormPopup() {
    this.editTemplate = false;
    this.formCreateTemplate = new CreateTemplate();
    this.templateId = 'new';
    this.formCreateTemplate.templateContent = '';
    this.formCreateTemplate.templateName = '';
    this.formErrors.templateName = '';
    this.formErrors.templateContent = '';
  }
  onTemplateChange(event) {
    if (this.editTemplate) {
      this.zIndex = Z_INDEX_DOWN;
      const html = '<p>' + this.validationForm.BACK_PAGE3 + '</p>' + '<p>' + this.validationForm.BACK_PAGE2 + '</p>';
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.OK', 'BTN.CANCEL').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            this.editTemplate = false;
            if (event.id === 'new') {
              this.id = 'new';
              this.formCreateTemplate = new CreateTemplate();
              this.zIndex = Z_INDEX_UP;
              this.changeScrollHidden();
            } else {
              this.getDetailTemplate(event.id);
              this.changeScrollHidden();
              this.zIndex = Z_INDEX_UP;
            }
          } else {
            this.templateId = this.id;
            this.changeScrollHidden();
            this.zIndex = Z_INDEX_UP;
          }
        }
      );
    } else {
      if (event.id === 'new') {
        this.id = 'new';
        this.formCreateTemplate = new CreateTemplate();
        this.changeScrollHidden();
        this.zIndex = Z_INDEX_UP;
      } else {
        this.zIndex = Z_INDEX_UP;
        this.getDetailTemplate(event.id);
      }
    }
  }
  closeTemplate(event) {
    if (this.editTemplate) {
      console.log(this.editTemplate);
      this.zIndex = Z_INDEX_DOWN;
      const html = '<p>' + this.validationForm.BACK_PAGE1 + '</p>' + '<p>' + this.validationForm.BACK_PAGE2 + '</p>';
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.OK', 'BTN.CANCEL').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            this.resetFormPopup();
            this.changeScrollHidden();
            $('#modal-getTemplate').modal('hide');
            this.changeScroll();
            this.zIndex = Z_INDEX_UP;
          } else {
            this.changeScrollHidden();
            this.zIndex = Z_INDEX_UP;
            this.getDetailTemplate(event.id);
          }
        }
      );
    } else {
      this.zIndex = Z_INDEX_UP;
      this.changeScrollHidden();
      this.resetFormPopup();
      $('#modal-getTemplate').modal('hide');
      this.callApiListTemplate();
      this.id = 'new';
      this.changeScroll();

    }
  }
  getDetailTemplate(templateId) {
    this.pharmacyService.getDetailTemplate(templateId).subscribe((res) => {
      this.formCreateTemplate = res;
      this.id = templateId;
    });
  }
  deleteTemplate(templateId) {
    this.zIndex = Z_INDEX_DOWN;
    this.dialogService.showMessage('warning', false, null, 'PHARMACY.PH0026.MSG_DELETE', null, 'MSG.YES', 'MSG.NO').subscribe(
      (res) => {
        if (res.isOk()) {
          this.pharmacyService.deleteTemplate(templateId).subscribe((response) => {
            this.dialogService.showMessage('success', false, null, 'PHARMACY.PH0026.DELETE_SUCCESS', null,
              'MSG.OK', null).subscribe(() => {
              this.changeScrollHidden();
              this.zIndex = Z_INDEX_UP;
            });
            this.zIndex = Z_INDEX_DOWN;
            this.callApiListTemplate('');
            this.formCreateTemplate = new CreateTemplate();
            this.editTemplate = false;
            this.templateId = 'new';
            this.changeScrollHidden();
          });
        } else {
          this.zIndex = Z_INDEX_UP;
          this.changeScrollHidden();
        }
      });
  }
  changeScrollHidden() {
    setTimeout(() => (
      $('body').css({overflow: 'hidden'})
    ), 0);
  }
  changeScroll() {
    setTimeout(() => (
      $('body').css({overflow: 'scroll'})
    ), 0);
  }
  changeTemplate() {
    this.editTemplate = true;
  }
  backPageTemplate() {
    if (this.editTemplate) {
      this.zIndex = Z_INDEX_DOWN;
      const html = '<p>' + this.validationForm.BACK_PAGE1 + '</p>' + '<p>' + this.validationForm.BACK_PAGE2 + '</p>';
      this.dialogService.showMessage('warning', false, null, null, html, 'MSG.OK', 'BTN.CANCEL').subscribe(
        (res: DialogResult) => {
          if (res.isOk()) {
            this.location.back();
            this.zIndex = Z_INDEX_UP;
          }
        }
      );
    } else {
      this.location.back();
      this.zIndex = Z_INDEX_UP;
    }
  }
}
