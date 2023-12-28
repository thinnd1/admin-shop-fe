import {FirBase} from './fir.base';

/**
 * 添付ファイル情報.
 */
export class FirAttachments extends FirBase {

  /** 添付ファイルID */
  fileId: string;

  /** Name */
  name: string;

  /** Size */
  size = 0;

  /** Width. */
  width = 0;

  /** Height. */
  height = 0;

  /** Type. */
  type: string;

  /** URL. */
  url: string;

  /** createdAt. */
  createdAt: Date;

  /** Owner. */
  owner: string;

  /** fire base key**/
  key?: string;

  /**
   * priority
   */
  priority?: Priority;

  original_file_type?: string;

  original_file_id?: string;

  // @Override
  updateData(key: string, val: any) {
    // ignore
  }
}

// とりあえず
export type FirFile = Object;

// display priority
export enum Priority {
  IMAGE = 1,
  VIDEO = 2,
  AUDIO = 3,
  OTHER_FILES = 4
}
