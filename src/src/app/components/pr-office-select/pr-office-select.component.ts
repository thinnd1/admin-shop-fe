import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseService } from "../../services/base.service";
import { Company } from "../../models/ba/company";

interface Select2Data {
  text: string;
  id: string;
  disabled?: boolean;
  selected?: boolean;
}

@Component({
  selector: 'app-pr-office-select',
  templateUrl: './pr-office-select.component.html',
  styleUrls: ['./pr-office-select.component.scss']
})
export class PrOfficeSelectComponent implements OnInit, OnChanges {
  @Input("officeId") _officeId: string;
  @Input() prOfficeSelectOptions: any = {
    multiple: true,
    allowClear: true,
    minimumInputLength: 0,
    maximumInputLength: 5,
    maximumSelectionLength: 5,
    disabled: false
  };

  @Output() prOfficeSelected = new EventEmitter<any>();
  selected: any;
  data: Select2Data[];
  remoteOptions = {};

  constructor(
    private translate: TranslateService,
    private _baseService: BaseService
  ) { }

  ngOnInit() {
    this._update();
    this._updateOption();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      if (propName === "officeId") {
        this._update();
      }
      if (propName === "prOfficeSelectOptions") {
        this._updateOption();
      }
    }
  }

  private _update() {
    if (! this._officeId) {
      return;
    }

    this._baseService.getCompanies(this._officeId).
    subscribe(
      (companies: Company[]) => {
        this.data = [];
        for (let company of companies) {
          this.data.push({ text: company.name, id: company.id });
        }
      }
    );
  }

  private _updateOption() {
    if (! this.prOfficeSelectOptions) {
      return;
    }

    Object.keys(this.prOfficeSelectOptions).forEach(function(key){
      if(this.prOfficeSelectOptions[key]){
        this.remoteOptions[key] = this.prOfficeSelectOptions[key];
      }
    }.bind(this));
  }

  changeFields(val:any[]){
    this.prOfficeSelected.emit(val);
  }

}
