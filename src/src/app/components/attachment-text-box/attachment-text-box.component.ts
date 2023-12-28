import {
  Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FormatSizeConverter} from '../../common/converter/format.size.converter';
import {Helper} from '../../common/helper';
import {DialogService} from '../../services/dialog.service';
import {PharmacyService} from '../../services/pharmacy.service';
import {Router} from '@angular/router';
import {CreateTemplate} from '../../models/ph/create-template';
import {DialogResult} from '../../models/dialog-param';
import {Location} from '@angular/common';
import {combineAll} from 'rxjs/operator/combineAll';
declare const $: any;

const MAX_SIZE = 128 * 1024 * 1024;



@Component({
  selector: 'app-attachment-text-box',
  templateUrl: './attachment-text-box.component.html',
  styleUrls: ['./attachment-text-box.component.scss']
})
export class AttachmentTextBoxComponent implements OnInit, OnChanges {
  @Input() require: any;
  @Input() isEdit: boolean;
  @Input() progress: number;
  @Input() data: any = {attachments: [], content: ''};
  @Output() onConfirm = new EventEmitter<any>();
  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();
  listAttachments: any[] = [];
  textContents = '';
  submitText;
  listTemplate: any[] = [];
  options = {
      row: 4,
      placeholder: '',
      maxHeight: 300
    };
  template: any;
  textTranslate: string;
  templateId: any;
  public editTemplate = false;
  validationForm: any = {};
  public formCreateTemplate: CreateTemplate;
  public id = 'new';
  templateContent: string;
  formErrors = {
    templateName: '',
    templateContent: ''
  };
  constructor(private translate: TranslateService,
              private formatSize: FormatSizeConverter,
              private helper: Helper,
              private router: Router,
              private pharmacyService: PharmacyService,
              private location: Location,
              private dialogService: DialogService) {
    this.getTemplate();
  }
  ngOnInit() {
    this.submitText = '確認する';
    this.formCreateTemplate = new CreateTemplate();

    this.translate.get('PHARMACY.PH0026').subscribe((res: any) => {
      this.validationForm = res;
      this.textTranslate = this.validationForm.TEMPLATE;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.listAttachments = this.data.attachments;
      this.textContents = this.data.content;
    }
    if (changes['progress']) {
      if (changes['progress'].currentValue === 100 || !changes['progress'].currentValue) {
        this.clearInput();
      }
    }

  }
 getTemplate() {
   this.pharmacyService.getTemplate().subscribe((res) => {
     this.listTemplate = res;
   });
 }
  inputChange(value) {
    this.textContents = value;
  }

  removeFile(index: number) {
    this.listAttachments.splice(index, 1);
  }

  changeFields(event: KeyboardEvent) {
    if (event.keyCode === 13 && event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      this.clickConfirm(1);
    }
  }

  clickCancel(event: any) {
    this.onCancel.emit();
  }

  clickConfirm(event: any) {
    const valid = this.checkValidateFiles();
    this.onConfirm.emit({attachments: this.listAttachments, content: this.textContents, valid: valid});
  }

  clickSubmit(event: any) {
    this.onSubmit.emit({attachments: this.listAttachments, content: this.textContents});
  }

  onSelectTemplate(obj) {
    this.textContents += obj.templateContent;
  }
  clearInput() {
    this.listAttachments = [];
    this.textContents = '';
  }
  checkValidateFiles() {
    let isValid = true;
    if (this.listAttachments.length > 10) {
      isValid = false;
      this.dialogService.showMessage('error', false, null, 'MSG.GR.M016', null, 'MSG.OK', null)
        .subscribe(() => {
          isValid = this.checkMaxFileSize() && isValid;
        });
    }
    if (isValid) {
      isValid = this.checkMaxFileSize();
    }
    return isValid;
  }
  checkMaxFileSize() {
    let isValid = true;
    for (let i = 0; i < this.listAttachments.length; i++) {
      if (this.listAttachments[i].size > MAX_SIZE) {
        isValid = false;
        break;
      }
    }
    if (!isValid) {
      setTimeout(() => {
        this.dialogService.showMessage('error', false, null, 'MSG.GR.MAX_SIZE_ERROR', null, 'MSG.OK', null);
      });
    }
    return isValid;
  }

  updateTemplate($event) {
    this.getTemplate();
  }
}
