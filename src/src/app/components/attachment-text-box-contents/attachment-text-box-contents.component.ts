import {
  Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FormatSizeConverter} from '../../common/converter/format.size.converter';
import {Helper} from '../../common/helper';


@Component({
  selector: 'app-attachment-text-box-contents',
  templateUrl: './attachment-text-box-contents.component.html',
  styleUrls: ['./attachment-text-box-contents.component.scss']
})
export class AttachmentTextBoxContentsComponent implements OnInit, OnChanges {
  @Input() isEdit: boolean;
  @Input() progress: number;
  @Input() contents: any = {
    attachments: [], contents: ''
  };
  @Input() options: any = {
    row: 4,
    placeholder: '',
    maxHeight: null
  };
  @Output() onConfirm = new EventEmitter<any>();
  @Output() inputChange = new EventEmitter<any>();
  @Output() fileRemove = new EventEmitter<any>();
  listAttachments: any[] = [];
  textContents = '';
  submitText;

  constructor(private translate: TranslateService,
              private helper: Helper,
              private formatSize: FormatSizeConverter) {
  }

  ngOnInit() {
    this.submitText = '確認する';
    this.setContent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contents']) {
      this.setContent();
    }
  }

  setContent() {
    this.listAttachments = this.contents.attachments;
    this.textContents = this.contents.contents;
  }

  formatSizeUnits(file) {
    return this.formatSize.formatSizeUnits(file.size);
  }

  checkImageFile(file) {
    return this.helper.getFileClass(file) === 'image';
  }

  removeFile(index: number) {
    this.fileRemove.emit(index);
  }

  changeFields(event: KeyboardEvent) {
    if (event.keyCode === 13 && event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      this.clickConfirm(1);
    }
  }

  textChange(value) {
    this.inputChange.emit(value);
  }

  clickConfirm(event: any) {
    this.onConfirm.emit();
  }

}
