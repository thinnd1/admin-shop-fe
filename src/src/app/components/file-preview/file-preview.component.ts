import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {Helper} from '../../common/helper';
declare const $: any;
import {FirebaseStorage} from '../../services/firebase/firebase.storage';


@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent implements OnInit, OnChanges {

  @Input() groupId: string;
  @Input() roomId: string;
  @Input() officeUserId: string;
  @Input() contentsId: string;
  @Input() articleContentsId: string;
  @Input('fileId') fileId: string;
  @Input() fileList: any[] = [];
  @Output() setSelectItem: any = new EventEmitter<any>();

  public mockData: any[] = [
    {
      fileId: '3125',
      name: 'wordフファイル名ファイル名ファイル名ファイル名.docx',
      type: 'word',
      size: '196000',
      url: '/assets/img/bnr.png'
    },
    {
      fileId: '8947',
      name: 'ファイル名ファイル名ファイル名ファイル名ファイル名.zip',
      type: 'archive',
      size: '789435',
      url: '/assets/img/bnr.png'
    },
    {
      fileId: '192',
      name: 'アセタノールカプセル200仕様上の注意_0819.pdf',
      type: 'pdf',
      size: '57894',
      url: '/assets/img/bnr.png'
    },
    {
      fileId: '2512',
      name: 'ファイル名ファイル名ファイル名ファイル名ファイル名.mp3',
      type: 'audio',
      size: '787888',
      url: '/assets/img/bnr.png'
    },
    {
      fileId: '1532',
      name: 'ファイル名ファイル名ファイル名ファイル名ファイル名.mp4',
      type: 'video',
      size: '29841',
      url: '/assets/img/bnr.png'
    },
    {
      fileId: '431',
      name: 'ファイル名ファイル名ファイル名ファイル名ファイル名.key',
      type: '',
      size: '784597',
      url: '/assets/img/bnr.png'
    },
    {
      fileId: '1431',
      name: 'ファイル名ファイル名ファイル名ファイル名ファイル名.png',
      type: 'image',
      size: '784597',
      url: '/assets/img/bnr.png'
    }
  ];
  public previewItem: any;
  public countMax: number;
  public selectItem: number;
  private _path: string;

  constructor(private helper: Helper, private firebaseStorage: FirebaseStorage) { }

  ngOnInit() {
    this._init();
    this.showPreview();
  }

  private _init() {
    if (this.fileList.length) {
      this.countMax = this.fileList.length - 1;
      this.selectItem = 0;
      this.fileList.forEach((val, idx) => {
        if (this.fileId === val.fileId) {
          this.selectItem = idx;
        }
        this.getOriginalFile(val);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      if (property === 'fileId' || property === 'fileList') {
        this._init();
      }
      if (property === 'groupId' && this.groupId) {
        this._path = `group/${this.groupId}/`;
      }
      if (property === 'roomId' && this.roomId) {
        this._path = `chat/${this.roomId}/`;
      }
    }
  }

  getOriginalFile(file: any) {
    if (file.original_file_id && !file['original_url']) {
      this.firebaseStorage.downloadURL(this._path + file.original_file_id).subscribe(originalUrl => {
        file['original_url'] = originalUrl;
      }, error => {});
    }
  }

  viewNext() {
    this.selectItem++;
    this.showPreview();
  }

  viewPrev() {
    this.selectItem--;
    this.showPreview();
  }

  showPreview() {
    if (this.selectItem > this.countMax) {
      this.selectItem = 0;
    }
    if (this.selectItem < 0) {
      this.selectItem = this.countMax;
    }
    this.previewItem = this.fileList[this.selectItem];
    this.setSelectItem.emit({value: this.previewItem});
  }

  getFileType(file) {
    return this.helper.getFileClass(file);
  }
}
