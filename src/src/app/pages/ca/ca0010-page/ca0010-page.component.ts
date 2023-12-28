import { DialogService } from 'app/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Input, Output, EventEmitter, HostBinding, OnChanges, OnDestroy, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ComponentRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import "rxjs/Rx";
import { CalendarService } from '../../../services/calendar.service';
import { ExternalCalendar } from '../../../models/ca/settings-external-settings';

import {OptionColorComponent} from '../../../components/option-color/option-color.component';

/**
 * 画面クリックイベント用
*/
const staticObserverForClick = Observable.fromEvent(document, 'click');

/**
 * 数値を #nnnnnn 形式の文字列にする
 */
const toColorString = (colorNo: number): string => {
  const doubleFig = (src: string): string => {
    return src.length === 1 ? "0" + src : src;
  }

  let r = (colorNo >> 16).toString(16);
  r = doubleFig(r);
  let g = ((colorNo & 0xffff) >> 8).toString(16);
  g = doubleFig(g);
  let b = (colorNo & 0xff).toString(16);
  b = doubleFig(b);
  return `#${r}${g}${b}`;
}


/**
 * 外部カレンダータブのページ
 */

@Component({
  selector: 'app-ca0010-page',
  templateUrl: './ca0010-page.component.html',
  styleUrls: ['../ca0006-page/ca0006-page.component.scss']
})
export class Ca0010PageComponent implements OnInit {

  /**
   * PrJOY の場合の指定
   */
  @Input("isPrjoy") public _isPrjoy$: boolean = false;

  public _aaa = true;

  /**
   * カレンダーセッティング情報取得用の非同期バインド変数
   */
  public _settingsAsyncOb: Observable<ExternalCalendar.Settings> = null;

  constructor(
    private _calendarService: CalendarService,
    private _dialogService: DialogService
  ) {
  }

  ngOnInit() {
    this._load();
  }

  /**
   * 外部カレンダー情報の取得
   */
  private _load = () => {
    this._settingsAsyncOb = this._calendarService.getSettingsExternalSettings().
    catch(
      (error: Error) => {
        console.log(error);
        this._dialogService.showError("カレンダー同期情報取得失敗");
        return  Observable.from([]);
      }
    );
  }
}

/**
 * 各プロバイダ毎の情報表示パネルのコンポーネント
 */

@Component({
  selector: 'calendar-consent-panel',
  template: `
  <h2>{{ _getProviderName() }} カレンダーとの同期</h2>
  <div class="my-4">
    <div class="d-flex justify-content-center">
      <div class="d-flex justify-content-center form-inline">
        <button type="submit" class="btn btn-primary" (click)="_onAddAccount()">アカウント追加</button>
      </div>
    </div>
  </div>
  <div class="panel-group-release mb-4">
  
    <div class="panel-group-fl" *ngFor="let account of _accounts$">

      <div class="panel-head d-flex">
        <div class="panel-head-txt">
          <h2>
            <i class="fa fa-exclamation-circle text-danger" *ngIf="! account.validToken"></i>
            {{ account.name }}
          </h2>
        </div>
        <div class="panel-btn px-2 btn btn-lg btn-secondary fs18" (click)="_onDelete(account.externalCalendarId)">解除</div>
        <div
          class="text-danger ml-auto"
          *ngIf="! account.validToken"
        >
          同期中止中です。更新してください。
          <div class="panel-btn px-2 btn btn-lg btn-danger fs18" (click)="_onAddAccount()">更新</div>
        </div>
      </div>
  
      <div id="collapseOne01" class="panel-collapse-fl">
        <div class="panel-body p-4">
          
          <div class="row row-mg py-1 align-items-center" *ngFor="let calendar of account.calendars; let i = index;">
            <div class="col-lg-7">
              <div class="panel-bg d-flex align-items-center">
                <span
                  class="box-bg"
                  [style.backgroundColor]="_toColorString(calendar.color)"
                ></span>
                <span class="setting-txt-title">{{ calendar.name }}</span>
              </div>
            </div>
            <div class="col-lg-5">
              <div class="panel-button text-right fs18">
                <button
                  type="button"
                  class="btn
                  btn-outline-warning"
                  (click)="_onChangeColor($event, calendar)"
                >
                  表示カラーの変更
                </button>

                <button *ngIf="calendar.visible" (click)="_onDisplay(false, calendar)" type="button" class="btn btn-success">表示中</button>
                <button *ngIf="! calendar.visible" (click)="_onDisplay(true, calendar)" type="button" class="btn btn-secondary">非表示</button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>    
  `,
  styleUrls: ['../ca0006-page/ca0006-page.component.scss'],
  providers: [ OptionColorComponent ]
})
export class CalendarConsentComponent implements OnDestroy {

  /**
   * プロバイダの指定、GOOGLE, OUTLOOK, GAROON
   */
  @Input("provider") private _provider$: string = null;

  /**
   * プラットホームの指定、WEB | WEB_PRJOY
   */
  @Input("platform") private _platform$: string = null;

  /**
   * 表示する情報の指定
   */
  @Input("accounts") public _accounts$: ExternalCalendar.Account[] = null;

  /**
   * 同期情報の再取得よ要求するイベント
   */
  @Output("reload") private _reload$ = new EventEmitter<boolean>();

  /**
   * カラーピッカー表示オプション用バインド変数
   */
  public _colorPickerDisplay: ColorPickerPanelDisplay = null;

  /**
   * カラーピッカーに渡すカラー初期値用バインド変数
   */
  public _colorPickerColor: number = null;

  /**
   * 色変更用の一時的なカレンダー情報（カラーピッカーにカレンダー情報を渡したくないのでこちらに一時保存）
   */
  private _calendarForChange: ExternalCalendar.Calendar = null;

  /**
   * 画面クリック用サブスクライバの保存用
   */
  private _subscriber: Subscription = null;

  private _colorPickerComponentRef: ComponentRef<ColorPickerPanelComponent> = null;

  constructor(
    private _calendarService: CalendarService,
    private _dialogService: DialogService,
    private  _optionColorComponent: OptionColorComponent,
    private _translateService: TranslateService,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _appRef: ApplicationRef,
    private _injector: Injector
  )
  {
    this._subscriber = staticObserverForClick.
    subscribe(
      () => {
        // クリックがあったら、カラーピッカーを閉じる
        this._colorPickerDisplay = null;
        this._closeColorPicker();
      }
    );
  }

  ngOnDestroy() {
    if (this._subscriber) {
      this._subscriber.unsubscribe();
    }
    this._closeColorPicker();
  }

  /**
   * 表示用のプロバイダ名を取得する
   */
  public _getProviderName = (): string => {
    switch (this._provider$) {
      case  "GOOGLE":
        return "Google";
      case  "OUTLOOK":
        return "Outlook.com";
      case  "GAROON":
        return "サイボウズ Garoon";
    }
  }

  /**
   * 数値を #nnnnnn 形式の文字列にする
   */
  private _toColorString = toColorString;

  /**
   * アカウントの追加ボタン押下
   */
  public _onAddAccount = () => {
    this._calendarService.getConsetUrl(this._provider$, this._platform$).
    take(1).
    subscribe(
      (url: string) => {
// url = url.replace("localhost", "192.168.11.124");

        location.href = url;  // 遷移する
      },
      (error: Error) => {
        console.log(error);
        this._dialogService.showError("アカウント追加URL取得失敗");
      }
    );
  }

  /**
   * 解除ボタン
   */
  private _onDelete = (calendarId: string) => {
    this._dialogService.showMessage(
      'warning',
      false,
      null,
      'CA0010.EXTERNAL_CALENDAR_LINK.DELETE_CONFIRM',
      null,
      'MSG.YES',
      'MSG.NO'
    ).subscribe(
      (res) => {
        if (res.isOk()) {
          this._calendarService.deleteSettingsExternalSettings(this._provider$, calendarId).subscribe(
            (response) => {
              this._reload$.emit(true);
              this._dialogService.showMessage(
                'success',
                false,
                null,
                'CA0010.EXTERNAL_CALENDAR_LINK.DELETE_SUCCEEDED',
                null,
                'MSG.YES',
                null
              ).subscribe((respose) => {});
            },
            (error: Error) => {
              console.log(error);
              this._dialogService.showError("解除失敗");
            }
          );
        }
      }
    );
  }

  /**
   * ColorPicker で色が選択されたときの処理
   */
  public _setColor = (color: number) => {
    // "/dr/ca/save_calendar_references" を使う
    this._calendarForChange.color = color;
    this._putCalendarStatus(this._calendarForChange);
  }

  /**
   * 表示カラーの変更ボタンが押されたときの処理、ColorPicker ポップアップを表示する
   */
  private _onChangeColor = (event: MouseEvent, calendar: ExternalCalendar.Calendar) => {
    event.preventDefault();
    event.stopPropagation();

    if (this._colorPickerComponentRef) {
      return;
    }

    this._colorPickerDisplay = { top: event.pageY, left: event.pageX - 102 };
    this._colorPickerColor = calendar.color;

    this._calendarForChange = calendar;

    // 動的にコンポーネントを生成
    this._colorPickerComponentRef = this._componentFactoryResolver.resolveComponentFactory(
      ColorPickerPanelComponent).create(this._injector);

    this._appRef.attachView(this._colorPickerComponentRef.hostView);

    const domElem = (this._colorPickerComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);

    // 動的に生成したコンポーネントにパラメータを渡す
    this._colorPickerComponentRef.instance.display = this._colorPickerDisplay;
    this._colorPickerComponentRef.instance.color = this._colorPickerColor;
    this._colorPickerComponentRef.instance.colorChanged.subscribe(
      (color) => {
        this._setColor(color);
        this._closeColorPicker();
      }
    );
    this._colorPickerComponentRef.instance.ngOnChanges();
  }

  /**
   * カラーピッカーを閉じる
   */
  private _closeColorPicker = () => {
    if (this._colorPickerComponentRef) {
      this._appRef.detachView(this._colorPickerComponentRef.hostView);
      this._colorPickerComponentRef.destroy(); // コンポーネント破棄する
      this._colorPickerComponentRef = null;
    }
  }

  /**
   * 表示・非表示の登録
   */
  private _onDisplay = (display: boolean, calendar: ExternalCalendar.Calendar) => {
    calendar.visible = display;
    this._putCalendarStatus(calendar);
  }

  /**
   * カレンダー情報の設定（色、表示・非表示など）
   */
  private _putCalendarStatus = (calendar: ExternalCalendar.Calendar) => {
    this._calendarService.postSettingsSelfSettings(
      {
        calendarReferences: [
          {
            color: calendar.color,
            id: calendar.calendarReferenceId,
            visible: calendar.visible
          }
        ]
      }
    ).
    subscribe(
      (res) => {
        this._reload$.emit(true);
      },
      (error: Error) => {
        console.log(error);
        this._dialogService.showError("登録失敗");
      }
    );
  }
}

const DEF_COLORS = [
  13989605,
  16742075,
  14370424,
  15682379,
  16741687,
  16753682,
  1355621,
  8114504,
  4378248,
  2867620,
  5031397,
  3970799,
  9669585,
  15699598,
  14529806,
  11510120,
  11506560,
  12023671,
  12223888,
  13211578,
  8885162,
  8429196,
  10526880,
  12369084
];

/**
 * color-picker-panel の @Input("display") 用に与えるパラメーターの型
*/
interface ColorPickerPanelDisplay {
  top: number;
  left: number;
}

/**
 * カラーピッカーコンポーネント
*/

@Component({
  selector: 'color-picker-panel',
  template: `
  <ng-container *ngIf="_display$">
    <div class="popover popover-bottom">
      <div class="popover-content">
        <div
          *ngFor="let colorNo of _DEF_COLORS; let i = index;"
          class="popover-box"
          [class.active]="_color$ === colorNo"
          (click)="_onClick(i, $event)"
        >      
          <div
            class="box-bg"
            [style.backgroundColor]="_toColorString(colorNo)"
          >
          </div>
        </div>
      </div>
    </div>
  </ng-container>
  `,
  styleUrls: [
    '../ca0006-page/ca0006-page.component.scss',
    "../../../components/option-color/option-color.component.scss",
    '../ca0010-page/ca0010-page.component.scss'
  ]
})
export class ColorPickerPanelComponent implements OnChanges {
  @HostBinding('style.top') _hostTop = "0px";
  @HostBinding('style.left') _hostLeft = "0px";

  /**
   * 表示オプション
   */
  @Input("display") public _display$: ColorPickerPanelDisplay = null;
  set display(display: ColorPickerPanelDisplay) {
    this._display$ = display;
  }

  /**
   * カラー初期値
   */
  @Input("color") public _color$ = 0;
  set color(color: number) {
    this._color$ = color;
  }

  /**
   * カラーチェンジイベント、色番号を返す
   */
  @Output("colorChanged") public _colorChanged$ = new EventEmitter<number>();
  get colorChanged(): EventEmitter<number> {
    return this._colorChanged$;
  }

  public _DEF_COLORS = DEF_COLORS;

  constructor(
  ) { }

  ngOnChanges() {
    // 表示処理
    if (this._display$) {
      this._hostTop = this._display$.top + "px";
      this._hostLeft = this._display$.left + "px";
    }
  }

  /**
   * 数値を #nnnnnn 形式の文字列にする
   */
  private _toColorString = toColorString;

  /**
   * 色選択クリックの処理
   */
  private _onClick = (index: number, event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    this._display$ = null;
    this._color$ = this._DEF_COLORS[index];
    this._colorChanged$.emit(this._color$);
  }

}
