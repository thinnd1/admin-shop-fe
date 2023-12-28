/**
 * Created by thaobtb on 9/8/2017.
 */
export class Re0010UpdateMailSendApi {
  public reservationId: string;
  public reservationToken: string;
  public password: string;

  constructor(reservationId, reservationToken, password) {
    this.reservationId = reservationId;
    this.reservationToken = reservationToken;
    this.password = password;
  }
}
