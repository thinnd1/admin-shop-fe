import {OnInit, Input, Component, Output, EventEmitter, SimpleChanges, OnChanges} from '@angular/core';
import {saveAs} from 'file-saver/FileSaver';
import {ChatService} from '../../services/chat.service';
import {FirStampCategory} from '../../models/ch/firebase/fir.stamp.category';
import {DialogService} from '../../services/dialog.service';
import {FirebaseStorage} from '../../services/firebase/firebase.storage';

@Component({
  selector: 'app-stamp',
  templateUrl: './stamp.component.html',
  styleUrls: ['./stamp.component.scss'],
  preserveWhitespaces: false
})
export class StampComponent implements OnInit, OnChanges {

  public listStampsCategories: FirStampCategory[];
  public listStamps = [];
  public currentImageUrl;
  public enableClose;
  public selectedStampId: string;
  @Output() clickSelectStamp = new EventEmitter<string>();
  @Output() close = new EventEmitter<string>();
  @Input('open') open = false;

  constructor(private dialogService: DialogService,
              private chatService: ChatService,
              private firebaseStorage: FirebaseStorage) {
  }

  ngOnInit() {
    this.getListStampCategories();
  }

  getListStampCategories() {
    this.chatService.getListStampCategories().subscribe((data: FirStampCategory[]) => {
      this.listStampsCategories = data;
      this.listStamps = data[0].stamps;
      for (let i = 0; i < data.length; i++) {
        this.buildListStamps(data[i].stamps);
      }
    }, (error) => {
      this.dialogService.setLoaderVisible(false);
      this.dialogService.showError('MSG.ERROR');
    });
  }

  showStamps(id) {
    this.currentImageUrl = '';
    this.selectedStampId = id;
    this.listStampsCategories.map(e => {
      if (e.id === id) {
        this.listStamps = e.stamps;
      }
    });
  }

  /**
   * buildListStamps
   */
  buildListStamps(listStamps) {
    listStamps.sort(function (a, b) {
      return (a.stamp.order > b.stamp.order) ? 1 : ((b.stamp.order > a.stamp.order) ? -1 : 0);
    });
    listStamps = listStamps.map(e => {
      e.stampUrl = '/assets/img/user-no-image.png';
      if (e.stamp.available) {
        this.firebaseStorage.downloadURL(e.stamp.small_path).subscribe(
          (resultUrl) => {
            e.stampUrl = resultUrl;
          }, (error) => {
            e.stampUrl = '/assets/img/user-no-image.png';
          });
      }
      return e;
    });
  }

  selectStamp(event: any, id: string) {
    event.stopPropagation();
    this.clickSelectStamp.emit(id);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && changes['open'].currentValue === true) {
      this.showStamps(this.listStampsCategories[0].id);
      this.currentImageUrl = '';
    }
    setTimeout(() => {
      this.enableClose = this.open;
    }, 300);
  }

  onHoverImage(event) {
    this.currentImageUrl = event.target.src;
  }

  closePopup() {
    if (this.open && this.enableClose) {
      this.close.emit();
    }
  }

  triggerScrollToOffsetOnly(offset) {
    $('#list-sticker-chat').animate({
      scrollLeft: offset + 'px'
    }, 'fast');
  }
}
