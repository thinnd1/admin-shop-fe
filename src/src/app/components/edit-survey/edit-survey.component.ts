import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CreatePollSurveyValidator} from '../../pages/gr/gr0009-page/gr0009-page.validator';
import {DialogService} from '../../services/dialog.service';
import {GroupService} from '../../services/group.service';
import {Gr0009PageComponent} from '../../pages/gr/gr0009-page/gr0009-page.component';
import {Helper} from '../../common/helper';
import {EditPollSurveySettings} from '../../models/gr/edit-poll-survey-settings';
declare const moment: any;

@Component({
  selector: 'app-edit-survey',
  templateUrl: './edit-survey.component.html',
  styleUrls: ['./edit-survey.component.scss'],
  providers: [CreatePollSurveyValidator],
  preserveWhitespaces: false
})
export class EditSurveyComponent implements OnInit {
  @Input() article: any;
  editSurveyForm: FormGroup;
  gr0009Validator;
  gr0009;
  formError = {
    contents: '',
    closeDate: '',
    closeTime: ''
  };
  closeTime;
  defaultDate = moment(new Date()).format('YYYY/MM/DD');

  constructor(private translate: TranslateService,
              private fb: FormBuilder,
              private dialogService: DialogService,
              private groupService: GroupService,
              private createPollSurveyValidator: CreatePollSurveyValidator,
              private activatedRoute: ActivatedRoute,
              private route: Router,
              private helper: Helper) {
    this.gr0009Validator = new CreatePollSurveyValidator(this.translate, this.fb);
    this.gr0009 = new Gr0009PageComponent(this.translate, this.fb, this.dialogService, this.activatedRoute, this.createPollSurveyValidator,
      this.groupService, this.route, this.helper);
    this.editSurveyForm = this.fb.group({
      'contents': ['', Validators.compose([Validators.required, Validators.maxLength(3000)])],
      'closeDate': [''],
      'closeTime': ['']
    });
  }

  ngOnInit() {
    let dateTime;
    let closeDate = '';
    let closeTime = '';
    if (this.article) {
      dateTime = new Date(this.article.surveys.closeDate);
      closeDate = moment(dateTime).format('YYYY-MM-DD');
      this.defaultDate = closeDate;
      closeTime = ('0' + dateTime.getHours()).slice(-2) + ':' + ('0' + dateTime.getMinutes()).slice(-2);
      this.editSurveyForm = this.fb.group({
        'contents': [this.article.contents, Validators.compose([Validators.required, Validators.maxLength(3000)])],
        'closeDate': closeDate,
        'closeTime': closeTime
      });
      this.closeTime = this.gr0009.genTimePicker();
    }
  }


  /**
   * update close date
   * @param date
   */
  changeCloseDate(date) {
    date =  moment(date).format('YYYY/MM/DD');
    this.defaultDate = date;
    this.editSurveyForm.get('closeDate').setValue(date);
  }

  clickCancel(event: any) {
    if (this.article.isEdit) {
      this.article.isEdit = false;
    }
  }

  putEditPollSurvey() {
    const result = this.createPollSurveyValidator.checkValidate(this.editSurveyForm, this.formError);
    this.formError = result.formErrors;
    if (result.checkValidForm) {
      if (this.editSurveyForm.get('contents').value) {
        this.callPutApi();
      }
    }
  }

  callPutApi() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    const modelSendApi = new EditPollSurveySettings();
    modelSendApi.articleId = this.article.id;
    modelSendApi.contents = this.editSurveyForm.get('contents').value;
    const dateTime = this.editSurveyForm.get('closeDate').value + ' ' +
      this.editSurveyForm.get('closeTime').value + ':00';
    modelSendApi.closeDate = moment(dateTime).format('YYYY-MM-DDTHH:mm:ssZZ');
    this.groupService.putEditPollSurvey(modelSendApi).subscribe(
      (res) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.article.isEdit = false;
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
  }
}
