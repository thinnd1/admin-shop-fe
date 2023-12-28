/**
 * RE0030 初回登録
 */
export class PrGrantAuthSendApiSettings {
    public managementAuthority: string;
    public loginId: string;
    constructor(managementAuthority: string, loginId: string) {
        this.managementAuthority = managementAuthority;
        this.loginId = loginId;
    }
}