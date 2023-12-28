/**
 * Firebase database base model.
 *
 * @author k.sumi 2017/09/27
 */
export abstract class FirBase {
  /**
   * ID.
   */
  id?: string;

  /**
   * Updated data.
   */
  abstract updateData(key: string, val: any);
}
