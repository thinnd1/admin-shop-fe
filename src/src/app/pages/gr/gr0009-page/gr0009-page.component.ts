import {AfterViewInit, Component, OnInit, HostListener} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {CreatePollSurveyValidator} from './gr0009-page.validator';
import {GroupService} from '../../../services/group.service';
import {CreatePollSurveySettings} from '../../../models/gr/create-poll-survey-settings';
import {Helper} from '../../../common/helper';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';
declare const moment: any;

@Component({
  selector: 'app-gr0009-page',
  templateUrl: './gr0009-page.component.html',
  styleUrls: ['./gr0009-page.component.scss'],
  providers: [CreatePollSurveyValidator]
})
export class Gr0009PageComponent implements OnInit, AfterViewInit {
  groupId;
  createSurveyForm: FormGroup;
  arrayChoices;
  closeTime = [];
  formErrors: any;
  defaultDate = moment(new Date()).format('YYYY/MM/DD');
  closeDate;
  submitDebounce: any;
  debounce = 400;

  constructor(private translate: TranslateService,
              private fb: FormBuilder,
              private dialogService: DialogService,
              private activatedRoute: ActivatedRoute,
              private createPollSurveyValidator: CreatePollSurveyValidator,
              private groupService: GroupService,
              private route: Router,
              private helper: Helper) {
    this.formErrors = this.createPollSurveyValidator.formErrors;
    this.createSurveyForm = this.createPollSurveyValidator.createForm();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.groupId = params['groupId'];
      (<any>$('#theModal')).modal('hide');
    });
    this.createSurveyForm = this.createPollSurveyValidator.createForm();
    this.createSurveyForm.controls.closeDate.setValue(this.defaultDate);
    this.addItemChoice();
    this.closeTime = this.genTimePicker();
    this.submitDebounce = this.helper.debounce(this.postCreateSurvey, this.debounce, true);
  }

  ngAfterViewInit() {
    $('#close-time').prop('selectedIndex', -1);
  }

  get choicesData() {
    return <FormArray>this.createSurveyForm.get('choices');
  }

  genTimePicker() {
    const arrTime = [];
    for (let i = 0; i <= 23; i++) {
      for (let j = 0; j < 60; j += 30) {
        let a = '';
        if (i < 10) {
          if (j < 10) {
            a = '0' + i.toString() + ':0' + j.toString();
          } else {
            a = '0' + i.toString() + ':' + j.toString();
          }
        } else {
          if (j < 10) {
            a = i.toString() + ':0' + j.toString();
          } else {
            a = i.toString() + ':' + j.toString();
          }
        }
        arrTime.push(a);
      }
    }
    return arrTime;
  }

  /**
   * add new choice
   */
  addItemChoice() {
    this.arrayChoices = <FormArray>this.createSurveyForm.get('choices');
    const newControl = this.fb.control('', Validators.compose([Validators.required, Validators.maxLength(140)]));
    this.arrayChoices.push(newControl);
    this.createPollSurveyValidator.formErrors['choices'].push('');
  }

  addChoices(event) {
    event.preventDefault();
    this.addItemChoice();
  }

  /**
   * delete a choice from choice list
   * @param event
   * @param i
   */
  removeChoice(event, i) {
    event.preventDefault();
    const arrChoices = <FormArray>this.createSurveyForm.get('choices');
    arrChoices.removeAt(i);
    this.createPollSurveyValidator.formErrors['choices'].splice(i, 1);
  }

  /**
   * update closeDate
   * @param date
   */
  changeCloseDate(date) {
    date =  moment(date).format('YYYY/MM/DD');
    this.defaultDate = date;
    this.createSurveyForm.controls.closeDate.setValue(date);
  }

  submitSurveyForm() {
    this.submitDebounce();
  }

  postCreateSurvey() {
    const result = this.createPollSurveyValidator.checkValidate(this.createSurveyForm, this.formErrors, );
    this.formErrors = result.formErrors;
    if (result.checkValidArray && result.checkValidForm) {
      if (this.createSurveyForm.get('contents').value ) {
        this.callPostApi();
      }
    }
  }

  callPostApi() {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(true);
    });
    const modelSendApi = new CreatePollSurveySettings();
    modelSendApi.groupId = this.groupId;
    modelSendApi.contents = this.createSurveyForm.get('contents').value;
    const choices = [];
    for (let i = 0; i < this.createSurveyForm.get('choices').value.length; i++) {
      const itemChoice = {};
      itemChoice['contents'] = this.createSurveyForm.get('choices').value[i];
      choices.push(itemChoice);
    }
    modelSendApi.choices = choices;
    modelSendApi.singleChoiceFlag = this.createSurveyForm.get('singleChoiceFlag').value;
    const dateTime = this.createSurveyForm.get('closeDate').value + ' ' +
      this.createSurveyForm.get('closeTime').value + ':00';
    modelSendApi.closeDate = moment(dateTime).format('YYYY-MM-DDTHH:mm:ssZZ');
    this.groupService.postCreatePollSurvey(modelSendApi).subscribe(
      (response) => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        // redirect to timeline's group...
        this.route.navigate(['gr/gr0011', this.groupId]);
      }, error => {
        setTimeout(() => {
          this.dialogService.setLoaderVisible(false);
        });
        this.dialogService.showError('MSG.ERROR');
      });
  }

  // @HostListener('document:keypress', ['$event'])
  // handleKeyboardEvent(event) {
  //   if (event.keyCode === 13 && event.target.type !== 'textarea') {
  //     this.postCreateSurvey();
  //   }
  // }
}
