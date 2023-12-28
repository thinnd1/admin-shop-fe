import {
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {FuncAuthoritySet, ManagementAuthority} from '../../models/ba/user-session';
import {StaffInvite} from '../../models/re/staff-invite';
declare const $: any;

@Component({
  selector: 'app-form-staff-invite-dr',
  templateUrl: './form-staff-invite-dr.component.html',
  styleUrls: ['./form-staff-invite-dr.component.scss'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormStaffInviteDrComponent implements OnInit, OnChanges {
  @Input() staffModel: any;
  @Input() staffIndex: number;
  @Input() arrayErrorForm: any[];
  @Input() countSubmit: number;
  @Input() focusOnItem: number;
  @Input() inputOptions = {
    departmentList: [],
    listJobType: [],
    listManagementAuthority: [],
    listFuncAuthoritySet: [],
    lengthStaffList: 0,
    authority: null
  };
  @Output() _deleteStaff = new EventEmitter<number>();
  // first time select funcAuthority / managementAuthority
  public isFirstSelect = false;
  public formError = new StaffInvite('', '', '', '', '', '', '', '', '');

  constructor(private ngZone: NgZone,
              private _elementRef: ElementRef) {
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
       /**
       * countSubmit = 0: not show error messages,
       * countSubmit = -1: pass validation => show duplicate message if exist,
       * countSubmit > 0: show error messages
       */
      if (propName === 'countSubmit' && this.countSubmit !== 0) {
        this.formError = new StaffInvite('', '', '', '', '', '', '', '', '');
        if (this.staffModel['errorMessages']) {
          this.setRowValign('bottom');
          this.formError = this.staffModel['errorMessages'];
        } else {
          this.setRowValign('middle');
        }
        if (this.countSubmit === -1) {
          this.setRowValign('bottom');
          this.formError['mailAddress'] = this.staffModel.duplicateMailMessage;
        }
      }

      if (propName === 'staffIndex' && this.staffIndex >= 0) {
        this.setAutoKana();
      }

      if (propName === 'focusOnItem' && this.focusOnItem === this.staffIndex) {
        this.focusElement();
      }
    }
  }

  setRowValign(position: string) {
    const requestId = window.requestAnimationFrame(() => {
      this._elementRef.nativeElement.querySelector('.row-staff-invite').setAttribute('valign', position);
      // IE11
      const el = this._elementRef.nativeElement.querySelector('.mailAddress');
      el.style['vertical-align'] = position;
      window.cancelAnimationFrame(requestId);
    });
  }

  setAutoKana() {
    const _nativeElement = this._elementRef.nativeElement;
    this.ngZone.runOutsideAngular(() => {
      const requestId = window.requestAnimationFrame(() => {
        $.fn.autoKana(_nativeElement.querySelector('#lastName-' + this.staffIndex),
          _nativeElement.querySelector('#lastNameKana-' + this.staffIndex));
        $.fn.autoKana(_nativeElement.querySelector('#firstName-' + this.staffIndex),
          _nativeElement.querySelector('#firstNameKana-' + this.staffIndex));
        window.cancelAnimationFrame(requestId);
      });
    });
  }

  changeManagementAuthority() {
    this.isFirstSelect = true;
  }

  changeFuncAuthority() {
    this.isFirstSelect = true;
  }

  changeJobType(jobType) {
    if (this.isFirstSelect) {
      return;
    }
    // select DR/ Secretary => change FuncAuthority & ManagementAuthority
    if (jobType === 'J0022') {
      this.staffModel.managementAuthority = ManagementAuthority.MP_2;
      this.staffModel.funcAuthoritySet = FuncAuthoritySet.FPS_2;
    } else {
      this.staffModel.managementAuthority = '';
      this.staffModel.funcAuthoritySet = FuncAuthoritySet.FPS_3;
    }
  }

  changeDepartment(department) {
    if (department) {
      this.staffModel.department = department.department;
    }
  }

  deleteStaff(index: number) {
    this._deleteStaff.emit(index);
  }

  focusElement() {
    const requestId = window.requestAnimationFrame(() => {
      const firstErrorElement = this._elementRef.nativeElement.querySelector('.has-danger');
      if (firstErrorElement) {
        const firstInput = firstErrorElement.querySelector('input');
        if (firstInput) {
          firstInput.focus();
        }
      }
      window.cancelAnimationFrame(requestId);
    });
  }

  modelChanged(event, field) {
    setTimeout(() => {
      this.staffModel[field] = $('#' + field + '-' + this.staffIndex).val();
    }, 100);
  }
}

