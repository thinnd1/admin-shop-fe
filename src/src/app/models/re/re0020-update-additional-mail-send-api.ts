/**
 * Created by thaobtb on 9/11/2017.
 */
export class Re0020UpdateAdditionalMailSendApi {
  public reservationId: string;
  public reservationToken: string;
  public password: string;

  constructor(reservationId, reservationToken, password) {
    this.reservationId = reservationId;
    this.reservationToken = reservationToken;
    this.password = password;
  }
}
