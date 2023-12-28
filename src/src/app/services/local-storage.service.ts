/**
 * Created by QuangHA on 2017/09/20.
 */
import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorage {
  public localStorage: any;

  constructor() {
    if (!localStorage) {
      throw new Error('Current browser does not support Local Storage');
    }
    this.localStorage = localStorage;
  }

  public set(key: string, value: string): void {
    this.localStorage[key] = value;
  }

  public get(key: string): any {
    return this.localStorage[key] || false;
  }

  public setObject(key: string, value: any): void {
    this.localStorage[key] = JSON.stringify(value);
  }

  public getObject(key: string): any {
    return JSON.parse(this.localStorage[key] || false);
  }

  public remove(key: string): any {
    this.localStorage.removeItem(key);
  }
}

export const LOCAL_STORAGE_PROVIDERS: any[] = [
  { provide: LocalStorage, useClass: LocalStorage }
];
