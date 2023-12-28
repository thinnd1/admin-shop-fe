import { Injectable } from '@angular/core';

@Injectable()
export class FormatSizeConverter {
  private Math: any;
  constructor() {
    this.Math = Math;
  }
  formatSizeUnits(bytes: number) {
    let formatSize;
    if (bytes >= 1073741824) {
      formatSize = (bytes / 1073741824).toFixed(2) + 'GB';
    } else if (bytes >= 1048576) {
      formatSize = this.roundUp((bytes / 1048576), 1) + 'MB';
    } else if (bytes >= 1024) {
      formatSize = this.roundUp((bytes / 1024), 0) + 'KB';
    } else if (bytes > 1) {
      formatSize = bytes + 'bytes';
    } else if (bytes === 1) {
      formatSize = bytes + 'byte';
    } else {
      formatSize = '0byte';
    }
    return formatSize;
  }

  roundUp(num, precision) {
    precision = this.Math.pow(10, precision);
    return this.Math.ceil(num * precision) / precision;
  }
}
