import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss']
})
export class MultiSelectComponent implements OnInit {
  @Input() multiSelect: any[];
  @Input() multiSelectOptions: any = {
    text: ''
  };
  @Output() multiSelectChanged = new EventEmitter<any>();
  popoverToggle;
  listToggle = [];
  multiSelectPopoverListPosition: object = {
    bottom: 0,
    left: 0
  };
  multiSelectPopoverListChildrenPosition: object = {
    top: 0,
    left: 0
  };
  targetObj;
  selectedFlag: boolean;

  constructor() {
  }

  ngOnInit() {
    this.checkSelectedLists();
  }

  onResize(event){
    this.popOverPositionSet();
  }

  openMultiSelect(event:any){
    if(!this.multiSelect || !this.multiSelect.length) return false;
    this.targetObj = event.target;
    this.popOverPositionSet();
    this.popoverToggle = !this.popoverToggle;
  }

  closeMultiSelect(){
    this.popoverToggle = false;
  }

  toggleMultiSelectPopoverListParent(event:any,index:number){
    let targetWidth = event.target.offsetWidth;
    let targetPositionTop = event.target.getBoundingClientRect().top - event.target.parentElement.getBoundingClientRect().top;
    this.multiSelectPopoverListChildrenPosition = {
      top: targetPositionTop - 9,
      left : targetWidth
    };
    this.listToggle.forEach(function(item,i,array){
      if(i != index){
        this.listToggle[i] = false;
      }
    }.bind(this));
    this.listToggle[index] = !this.listToggle[index];
  }

  changeChildrenCheckbox(event:any,item:any){
    this.multiSelectChanged.emit(this.multiSelect);
    this.popOverPositionSet();
    this.checkSelectedLists();
  }

  checkSelectedLists(){
    let self = this;
    self.selectedFlag = false;
    this.multiSelect.forEach(function(list,i,array){
      list.children.forEach(function(item,j,array){
        if(item.isChecked){
          self.selectedFlag = true;
        }
      });
    }.bind(this));
  }

  popOverPositionSet(){
    let targetWidth = this.targetObj.offsetWidth;
    let multiSelectPopoverListParentWidth = this.targetObj.nextElementSibling.clientWidth;
    let multiSelectPopoverListParentPositionBottom = this.targetObj.offsetHeight;
    this.multiSelectPopoverListPosition = {
      bottom: multiSelectPopoverListParentPositionBottom + 10,
      left: (targetWidth - multiSelectPopoverListParentWidth) / 2
    };
  }

}
