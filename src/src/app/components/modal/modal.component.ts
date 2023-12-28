import {Component, ComponentFactoryResolver, ComponentRef, Injector, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {SharedValueService} from '../../services/shared-value.service';
import {ModalSimpleComponent} from '../modal-simple/modal-simple.component';
import {DialogAdapter, DialogParams, DialogResult} from '../../models/dialog-param';
import {Subject} from 'rxjs/Subject';
import {ModalInputComponent} from '../modal-input/modal-input-component';
import {ModalCropperComponent} from '../modal-cropper/modal-cropper.component';
import {StaffDetailsPopupComponent} from '../staff-details-popup/staff-details-popup.component';
import {ModalAttachedComponent} from '../modal-attached/modal-attached.component';
import {ModalInputCustomComponent} from '../modal-input-custom/modal-input-custom.component';
import {ModalMemberListComponent} from '../modal-member-list/modal-member-list.component';
import {ModalFilePreviewComponent} from '../modal-file-preview/modal-file-preview.component';
import {ModalCheckboxComponent} from '../modal-checkbox/modal-checkbox.component';
import {PasswordInputComponent} from '../password-input/password-input.component';
import {ModalInputValidateComponent} from '../modal-input-validate/modal-input-validate.component';
import { ModalInvitePharmacyStaffComponent } from "../modal-invite-pharmacy-staff/modal-invite-pharmacy-staff.component";

import {DomSanitizer} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-modal',
  template: `
    <div class="modal" id="theModal" [ngClass]="dialog.type" tabindex="-1" role="modal" aria-labelledby="modalTitle" aria-hidden="true"
         aria-hidden="true" data-backdrop="static" data-keyboard="false">
      <div class="modal-dialog" [ngClass]="dialog.size" role="document">
        <div class="modal-content">
          <!--head-->
          <div class="modal-header">
            <!--title-->
            <ng-container *ngIf="dialog.type">
              <h5 class="modal-title" *ngIf="dialog.title">{{dialog.title}}</h5>
            </ng-container>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close" *ngIf="dialog.closeButton">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <!--icon success-->
          <div class="modal-icon modal-success modal-animate-success-icon" *ngIf="dialog.icon == 'success'">
            <div class="modal-success-circular-line-left"></div>
            <span class="modal-success-line-tip modal-animate-success-line-tip"></span>
            <span class="modal-success-line-long modal-animate-success-line-long"></span>
            <div class="modal-success-ring"></div>
            <div class="modal-success-fix"></div>
            <div class="modal-success-circular-line-right"></div>
          </div>
          <!--icon error-->
          <div class="modal-icon modal-error modal-animate-error-icon" *ngIf="dialog.icon == 'error'">
            <span class="modal-x-mark modal-animate-x-mark">
              <span class="modal-x-mark-line-left"></span>
              <span class="modal-x-mark-line-right"></span>
            </span>
          </div>
          <!--icon warning-->
          <div class="modal-icon modal-warning" *ngIf="dialog.icon == 'warning'">!</div>
          <!--icon info-->
          <div class="modal-icon modal-info" *ngIf="dialog.icon == 'info'">i</div>
          <!--icon question-->
          <div class="modal-icon modal-question" *ngIf="dialog.icon == 'question'">?</div>
          <!--title-->
          <ng-container *ngIf="!dialog.type">
            <h5 class="modal-title" *ngIf="dialog.title">{{dialog.title}}</h5>
          </ng-container>
          <!--body-->
          <div class="modal-body">
            <div *ngIf="dialog.html" [innerHtml]="html"></div>
            <div #theBody></div>
          </div>
          <!--footer-->
          <div class="modal-footer">
            <button *ngIf="dialog.positiveButton" id="positiveButton"
                    type="button" class="btn btn-warning"
                    (click)="onClickPositive()" [disabled]="disablePositive">{{dialog.positiveButton}}
            </button>
            <button *ngIf="dialog.negativeButton"
                    type="button" class="btn active btn-secondary" data-dismiss="modal"
                    (click)="onClickNegative()">{{dialog.negativeButton}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  entryComponents: [
    ModalSimpleComponent,
    ModalInputComponent,
    ModalCropperComponent,
    StaffDetailsPopupComponent,
    ModalAttachedComponent,
    ModalInputCustomComponent,
    ModalMemberListComponent,
    ModalFilePreviewComponent,
    ModalCheckboxComponent,
    PasswordInputComponent,
    ModalCropperComponent,
    ModalInputValidateComponent,
    ModalInvitePharmacyStaffComponent
  ],
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnDestroy{
  public dialog = new DialogParams(ModalSimpleComponent, null, null, null, null, null, null, null, new Subject(), {}, null, null);

  @ViewChild('theBody', {read: ViewContainerRef}) theBody: ViewContainerRef;

  cmpRef: ComponentRef<DialogAdapter>;
  html: any;
  visible = false;
  disablePositive = false;
  private subscription: Subscription;

  constructor(sharedService: SharedValueService,
              private componentFactoryResolver: ComponentFactoryResolver,
              injector: Injector, private sanitizer: DomSanitizer) {

    sharedService.showModal.subscribe(dialog => {
      this.dialog = dialog;
      if (this.cmpRef) {
        this.cmpRef.destroy();
      }
      console.log('**** ' + JSON.stringify(dialog));
      const factory = this.componentFactoryResolver.resolveComponentFactory(dialog.componentType);
      this.cmpRef = this.theBody.createComponent(factory);
      this.cmpRef.instance.params = dialog;
      this.cmpRef.instance.onModalInit();

      this.html = this.sanitizer.bypassSecurityTrustHtml(this.dialog.html);
      if (this.cmpRef.instance.getPayload().disablePositive) {
        this.disablePositive = !this.cmpRef.instance.getPayload().isChecked;
      } else {
        this.disablePositive = false;
      }

      (<any>$('#theModal')).modal('show');
      setTimeout(() => {
        (<any>$('#positiveButton')).focus();
      });
    });
    this.subscription = sharedService.getCheckedPopup().subscribe(
      (checkedPopup) => {
        const object = this.cmpRef.instance.getPayload();
        if (object.isConfirm) {
          this.disablePositive = !checkedPopup;
        }
      }
    );
  }

  close() {
    if (this.cmpRef) {
      this.cmpRef.destroy();
    }
    this.cmpRef = null;
    this.dialog = new DialogParams(ModalSimpleComponent, null, null, null, null, null, null, null, new Subject(), {}, null, null);
    (<any>$('#theModal')).modal('hide');
  }

  onClickPositive() {
    const object = this.cmpRef.instance.getPayload();
    if (object instanceof Observable) {
      object.subscribe(result => {
        this.handleEventClickPositiveBtn(result);
      });
    } else {
      this.handleEventClickPositiveBtn(object);
    }
  }

  handleEventClickPositiveBtn(object: any) {
    if (object.isConfirm) {
      if (object.isChecked === false || object.checkCallApi || object.checkCallValidate) {
        if (object.checkCallApi) {
          this.dialog.extraParams.initialValue.isCallApi = true;
          this.cmpRef.instance.params = this.dialog;
          this.cmpRef.instance.onModalInit();
        }
        if (object.checkCallValidate) {
          this.dialog.extraParams.initialValue.isCheckValidate = true;
          this.cmpRef.instance.params = this.dialog;
          this.cmpRef.instance.onModalInit();
        }
      } else {
        this.dialog.subject.next(new DialogResult('ok', this.cmpRef.instance.getPayload()));
        this.dialog.subject.complete();
        this.close();
      }
    } else {
      this.dialog.subject.next(new DialogResult('ok', this.cmpRef.instance.getPayload()));
      this.dialog.subject.complete();
      this.close();
    }
  }

  onClickNegative() {
    this.dialog.subject.next(new DialogResult('cancel', this.cmpRef.instance.getPayload()));
    this.dialog.subject.complete();
    this.close();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
