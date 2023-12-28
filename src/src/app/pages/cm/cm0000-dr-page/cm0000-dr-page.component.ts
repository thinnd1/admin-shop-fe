import {Component, OnInit} from '@angular/core';
import {CmsService} from '../../../services/cms.service';
import {DialogService} from '../../../services/dialog.service';
import {TermOfUse} from '../../../models/cm/term_of_use';
import {Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-cm0000-dr-page',
  templateUrl: './cm0000-dr-page.component.html',
  styleUrls: ['./cm0000-dr-page.component.scss']
})
export class Cm0000DrPageComponent implements OnInit {

  public termOfUse: TermOfUse;
  public termApprove: FormGroup;

  constructor(
    private dialogService: DialogService,
    private cmsService: CmsService,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.showLoading(true);

    this.termApprove = this.formBuilder.group({
      'chkResgister': [false, this.noCheck]
    });

    this.cmsService.getTermOfUseOne()
      .subscribe((res: TermOfUse) => {
        this.showLoading(false);
        this.termOfUse = res;
      }, () => {
        this.showLoading(false);
        this.dialogService.showError('MSG.ERROR');
      });
  }

  isError(formControl): boolean {
    return formControl.invalid && (formControl.dirty || formControl.touched);
  }

  noCheck(input: FormControl) {
    return (input.value === true) ? null : { noCheck: true };
  }

  approve() {
    if (this.termApprove.invalid) {
      this.termApprove.get('chkResgister').markAsDirty();
      return false;
    }
    this.showLoading(true);
    this.cmsService.putTermOfUseApprove(this.termOfUse.version)
      .subscribe((res) => {
        this.showLoading(false);
        this.router.navigate(['/'], {replaceUrl: true});
      }, () => {
        this.showLoading(false);
        this.dialogService.showError('MSG.ERROR');
      });
  }

  showLoading(flag: boolean) {
    setTimeout(() => {
      this.dialogService.setLoaderVisible(flag);
    });
  }
}
