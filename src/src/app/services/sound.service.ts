import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {NGXLogger} from 'ngx-logger';

/**
 * 効果音サービス.
 */
@Injectable()
export class SoundService implements OnInit, OnDestroy {

  // Variables
  // --------------------------------------------------------------------------
  private NoticeSound: HTMLAudioElement = new Audio('/assets/sound/notice.mp3');

  // Constructor
  // --------------------------------------------------------------------------
  constructor(private logger: NGXLogger) {
  }

  // Overrideed
  // --------------------------------------------------------------------------
  ngOnInit(): void {
    this.NoticeSound.load();
  }

  ngOnDestroy(): void {
    this.NoticeSound.remove();
  }

  // Methods
  // --------------------------------------------------------------------------
  play() {
    this.NoticeSound.play().then(error => {
      if (error) {
        this.logger.warn('Failed play sound');
      }
    }, reason => {
      this.logger.warn('Failed play sound: ', reason);
    });
  }
}
