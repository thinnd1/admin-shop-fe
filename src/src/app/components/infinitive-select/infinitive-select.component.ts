import {Component, ElementRef, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Helper} from '../../common/helper';

declare let $: any;

@Component({
  selector: 'app-infinitive-select',
  templateUrl: './infinitive-select.component.html',
  styleUrls: ['./infinitive-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InfinitiveSelectComponent),
    multi: true
  }]
})
export class InfinitiveSelectComponent implements OnInit, OnChanges, ControlValueAccessor {
  infinitiveList = [];
  selectedOption: any;
  keyword = '';
  options: any;
  isOpen = false;
  isLoading = true;
  nextPage = 0;
  currentPage = 0;
  isCalledApi = false;
  isResetInput = false;
  optionHeight = 33;
  optionStyle: any = {
    'min-height': this.optionHeight + 'px'
  };
  adjustableHeight: any;
  adjustableWidthInput: any;
  @Input('source') source: any;
  @Input('forceInputWithoutReload') forceInputWithoutReload: any;
  @Input('infiniteScrollOptions')
  infiniteScrollOptions: any = {
    size: 20,
    placeHolder: '検索',
    allowFreeText: false,
    multiple: false,
    maximumSelect: 5,
    showSearchButton: false
  };
  @Output() keywordChanged = new EventEmitter<any>();
  @Output() scrollDown = new EventEmitter<any>();
  @Output() clickSearch = new EventEmitter<any>();
  showNotify:any = false;
  emitKeyWordDebounce: any;
  _onChange = (_: any) => {
  };

  constructor(private helper: Helper) {
    this.adjustableHeight = this.optionHeight;
    this.emitKeyWordDebounce = this.helper.debounce(this.emitKeyword, 300);
  }

  ngOnInit() {
    this.infinitiveList = this.source;
    if (this.infiniteScrollOptions.multiple) {
      this.selectedOption = [];
      this.adjustInputWidth();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['source']) {
      this.infinitiveList = changes['source'].currentValue;
      if (this.infiniteScrollOptions.multiple) {
        for (let i = 0; i < this.infinitiveList.length; i++) {
          this.infinitiveList[i].disable = this.checkIfSelected(this.infinitiveList[i].id);
        }
      }
      this.loadDropDown();
    }
    if (changes['forceInputWithoutReload']) {
      this.keyword = this.forceInputWithoutReload;
    }
  }

  adjustHeight(newHeight) {
    if (!this.showNotify) {
      let height = newHeight > this.optionHeight ? newHeight : this.optionHeight;
      height = height < 200 ? height : 200;
      this.adjustableHeight = height;
    } else {
      this.adjustableHeight = this.optionHeight;
    }
  }

  showLoading() {
    // this.adjustHeight(this.adjustableHeight + 30);
    this.isLoading = true;
  }

  hideLoading() {
    this.isLoading = false;
  }

  clearTextBox(event) {
    if (event) {
      this.isResetInput = false;
      this.currentPage = 0;
      const value = this.infiniteScrollOptions.multiple ? [] : null;
      this.updateModel(value);
      this.keyword = '';
    }
  }

  hideDropdown(event) {
    this.isOpen = false;
    if (this.infiniteScrollOptions.multiple) {
      this.keyword = '';
    };
    this.currentPage = 0;
    this.adjustInputWidth();
  }

  loadDropDown() {
    this.nextPage = Math.floor(this.infinitiveList.length / this.infiniteScrollOptions.size);
    this.isCalledApi = this.infinitiveList.length > 0 && (this.infinitiveList.length % this.infiniteScrollOptions.size) === 0;
    const totalHeight = this.infinitiveList.length * this.optionHeight;
    this.adjustHeight(totalHeight);
    this.hideLoading();
  }

  inputFocus(e) {
    if (this.infiniteScrollOptions.multiple && this.selectedOption.length === this.infiniteScrollOptions.maximumSelect) {
      this.showNotify = true;
      this.isOpen = true;
      this.infinitiveList = [];
      this.adjustableHeight = 30;
      this.adjustInputWidth();
    }
  }

  inputChange(keyword) {
    this.infinitiveList = [];
    this.adjustableHeight = 30;
    if (!this.infiniteScrollOptions.allowFreeText && !this.infiniteScrollOptions.multiple) {
      this._onChange(null);
    }
    this.adjustInputWidth(keyword);
    this.emitKeyWordDebounce(keyword);
    if (keyword !== '') {
      this.isOpen = true;
      this.currentPage = 0;
      this.showLoading();
    } else {
      this.currentPage = 0;
      this.hideLoading();
      this.isOpen = false;
    }
  }

  emitKeyword(keyword) {
    this.keywordChanged.emit(keyword);
  }

  onScrollDown() {
    this.currentPage = this.nextPage;
    if (this.isCalledApi) {
      this.scrollDown.emit({page: this.currentPage, keyword: this.keyword});
    }
  }

  onSelect(value: any) {
    if (this.infiniteScrollOptions.multiple) {
      if (!this.selectedOption) {
        // if not existed then init
        this.selectedOption = [];
      }
      if (value.disable) {
        const index = this.findIndex(this.selectedOption, value.id, 'id');
        this.onRemoveItem(index);
      } else {
        if (this.selectedOption.length < this.infiniteScrollOptions.maximumSelect) {
          this.selectedOption.push(value);
          $('#input-field').focus();
        } else {
          this.showNotify = true;
          return;
        }
      }
      value.disable = !value.disable;
      this.updateModel(this.selectedOption);
      this.keyword = '';
      this.adjustInputWidth();
    }

    if (value && this.infiniteScrollOptions.multiple === false) {
      this.updateModel(value);
      this.keyword = value.name;
      this.infinitiveList = [];
      this.setResetInput(true);
    }
    this.isOpen = false;
  }

  onRemoveItem(index) {
    this.selectedOption.splice(index, 1);
    this.adjustInputWidth();
    this.showNotify = false;
    this._onChange(this.selectedOption);
  }

  setResetInput(value) {
    this.isResetInput = value;
    if (this.infiniteScrollOptions.allowFreeText) {
      this.isResetInput = false;
    }
  }

  backSpaceHandle($event) {
    if ($event.keyCode === 13 && !this.infiniteScrollOptions.multiple || $event.keyCode === 9) {
      this.hideDropdown(1);
    }
    // if back space
    if ($event.keyCode ===  8 && this.infiniteScrollOptions.multiple) {
      if ($event.target.value === '' && this.selectedOption && this.selectedOption.length) {
        this.keyword = this.selectedOption[this.selectedOption.length - 1].name;
        this.onRemoveItem(this.selectedOption.length - 1);
      }
    }
  }

  checkIfSelected(id) {
    if (this.selectedOption && this.selectedOption.length > 0) {
      const needle = this.selectedOption.filter((item) => (item.id === id));
      return needle.length > 0;
    }
    return false;
  }

  findIndex(haystack, needle, key) {
    return $.inArray(needle, haystack.map(function (obj) {
      return obj[key];
    }));
  }

  updateModel(value) {
    this._onChange(value);
    this.selectedOption = value;
  }

  adjustInputWidth(keyword?) {
    if (this.selectedOption && this.selectedOption.length > 0) {
      const minimumWidth = (keyword ? keyword.length : this.keyword.length) + 1;
      this.adjustableWidthInput = (minimumWidth * 0.8) + 'em';
    } else {
      this.adjustableWidthInput = $('.infinite-select').innerWidth() + 'px';
    }
  }

  // ControlValueAccessor

  writeValue(value: any | Array<any>): void {
    this.selectedOption = value;
    if (value && value.name || this.infiniteScrollOptions.allowFreeText && !this.infiniteScrollOptions.multiple) {
      this.onSelect(value);
    } else {
      this.clearTextBox(1);
    }
  }

  registerOnChange(fn: (_: any) => {}): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
  }

  clickSearchButton() {
    this.hideDropdown(1);
    this.clickSearch.emit({keyword: this.keyword, type: 'click'});
  }
}
