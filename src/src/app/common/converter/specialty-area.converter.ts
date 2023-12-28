import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class SpecialtyAreaConverter {
  fieldDefault: string;
  typeDefault: string;
  idDefault = '00000';
  constructor(private translate: TranslateService){
    this.translate.get(['COMMON_LABEL']).subscribe(
      res => {
        this.fieldDefault = res.COMMON_LABEL.SELECT_DEPARTMENT_FIELD;
        this.typeDefault = res.COMMON_LABEL.SELECT_DEPARTMENT_TYPE;
      });
  }
  convertSpecialtyArea(listSpecialtyArea): any[]{
      let firstFieldId = {id: this.idDefault, text: this.fieldDefault};
      let fieldIds = new Array();
      fieldIds.push(firstFieldId);
      if (listSpecialtyArea && listSpecialtyArea.specialtyAreas && listSpecialtyArea.specialtyAreas.length > 0) {
        for ( let i = 0; i < listSpecialtyArea.specialtyAreas.length; i++) {
          const fieldElement = {};
          fieldElement['id'] = listSpecialtyArea.specialtyAreas[i].id;
          fieldElement['text'] = listSpecialtyArea.specialtyAreas[i].specialtyAreaName;
          fieldIds.push(fieldElement);
        }
      }
   return fieldIds;
  }
  convertSpecialtyType(listSpecialtyType): any[]{
    let typeIds = new Array();
      for (let j = 0; j < listSpecialtyType.specialtyTypes.length; j++) {
        const typeElement = {};
        typeElement['id'] = listSpecialtyType.specialtyTypes[j].id;
        typeElement['text'] = listSpecialtyType.specialtyTypes[j].specialtyTypeName;
        typeElement['field_id'] = listSpecialtyType.specialtyTypes[j].specialtyAreaId;
        typeIds.push(typeElement);
      }
    return typeIds;
  }
}
