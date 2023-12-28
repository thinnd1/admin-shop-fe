import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions, Headers } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { environment } from '../../environments/environment';
import { HttpStatusCode } from '../common/http_status_code';

export function fakeBackendFactory(backend: MockBackend, options: BaseRequestOptions, realBackend: XHRBackend) {
  console.log('### fakeBackendFactory');

  backend.connections.subscribe((connection: MockConnection) => {
    // console.log('production ' + environment.production);
    console.log('### api ' + environment.api);

    if (environment.api !== 'mock') {
      // TODO 暫定対応
      // production環境向けにビルドした場合にローカルサーバーやdevelop環境に接続する設定
      let url = (environment.api + connection.request.url);
      // url = 'http://user:drjoy3230@rocky-bastion-30367.herokuapp.com/dr/re/notification';
      // url = 'http://user:drjoy3230@shielded-anchorage-91142.herokuapp.com/dr/re/notification';
      // url = 'http://shielded-anchorage-91142.herokuapp.com/dr/re/notification';
      // console.log('**** ' + url);

      connection.request.url = url;
      const headers = new Headers();
      headers.append('UserId', 'user0002'); // TODO fake user
      // headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Content-Type', 'application/json; charset=utf-8');
      // headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      // headers.append('Accept', 'application/json');
      // headers.append('Authorization', 'Basic ' + btoa('user:drjoy3230'));
      // headers.append('Access-Control-Request-Headers', 'accept, content-type'); // refused
      // fake header test in ominext
      headers.append('Accept', 'application/json');
      headers.append('OfficeId', 'office002');
      headers.append('managementAuthority', 'MP_1');
      headers.append('funcAuthority', 'FPS_2');

      const realHttp = new Http(realBackend, options);
      const requestOptions = new RequestOptions({
        method: connection.request.method,
        headers: headers,
        body: connection.request.getBody(),
        url: url,
        // withCredentials: connection.request.withCredentials,
        // responseType: connection.request.responseType
      });
      realHttp.request(url, requestOptions)
        .subscribe((response: Response) => {
            connection.mockRespond(response);
          },
          (error: any) => {
            connection.mockError(error);
          });
      return;
    }

    // Helper methods
    const loadJson = (filename, statusCode) => {
      const http = new Http(backend, options);

      http.get('asserts/mock/json/' + filename).map(res => res.json()).subscribe(data => {
        connection.mockRespond(new Response(new ResponseOptions({
          status: statusCode,
          body: data
        })));
      });
    };

    setTimeout(() => {
      if (connection.request.url.endsWith('/api/dr/re/department_settings')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/re/staff_edit/staff')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/re/staff_edit/staff/lock')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            status: 204,
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/re/staff_edit/staff/unlock')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            status: 204,
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/re/staff_edit/delete_account')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            status: 204,
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/re/staff_edit/post_staff')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            status: 204,
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/re/provisional_users?departmentId=1&name=&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/provisional_users?departmentId=&name=aa&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/provisional_users?departmentId=&name=&page=2&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/provisional_users?departmentId=&name=&page=3&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/provisional_users?departmentId=&name=&page=4&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_admin/users?departmentId=&name=&group=0&sort=-lastName&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_list/users?departmentId=&name=&group=0&sort=-lastName&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_list/users?departmentId=&name=&group=0&sort=-lastName&page=2&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/first_entry_confirm/user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_list/users?departmentId=1&name=&group=0&sort=-lastName&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_list/users?departmentId=&name=&group=1&sort=-lastName&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_list/users?department=1&name=')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_list/users?department=1&name=aaa')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_list/users/1')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_list/users/2')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_admin/users?departmentId=&name=aaa&group=0&sort=-lastName&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_admin/users?departmentId=1&name=aaa&group=0&sort=-lastName&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_admin/users?departmentId=&name=&group=0&sort=+lastName&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_admin/users?departmentId=1&name=&group=0&sort=-jobType&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_admin/users?departmentId=&name=&group=0&sort=-lastName&page=2&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_admin/users?departmentId=&name=&group=0&sort=-lastName&page=3&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_admin/users?departmentId=&name=&group=0&sort=-lastName&page=4&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_list/users')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/first_entry/user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/user_edit/get_user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/user_edit/user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/user_edit/delete_user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/user_edit/mail_address_change_reservation')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/user_edit/additional_mail_address_change_reservation')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/user_edit/update_mail_address')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/user_edit/additional_update_mail_address')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_invite/provisional_users')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/first_entry/get_user_entry/904db0842676fa694862bba76cb872b3d986aedc')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/first_entry/create_user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_invite/invite_users')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/send_provisional_register_mail')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/user_edit/get_user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/user_edit/user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/user_edit/mail_address_change_reservation')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/user_edit/additional_mail_address_change_reservation')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/user_edit/update_mail_address')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/handling_hospitals')) {
        return;
      }
      if (connection.request.url.endsWith('/api/ma/search/medical_offices')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/user_edit/additional_update_mail_address')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/user_edit/delete_user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/notification')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/handling_other_hospitals')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/staff_invite/handle_offices')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/staff_invite/invite_user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/staff_list?name=&sort=-lastName&page=1&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/staff_list?name=&sort=-lastName&page=2&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/staff_list?name=aaa&sort=-lastName&page=0&size=10')) {
        return;
      }
      if (connection.request.url.endsWith('/api/ba/session/drjoy')) {
        return;
      }
      if (connection.request.url.endsWith('/api/ba/session/info')) {
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/keycode')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_invite/provisional_users?departmentId=&name=&group=0&page=1&size=10')) {
        return;
      }

      if (connection.request.url.endsWith('/api/ma/search/medical_offices')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: [
            { officeId: '1', officeName: 'Hospital 1', otherHandling: false },
            { officeId: '2', officeName: 'Hospital 2', otherHandling: false },
            { officeId: '3', officeName: 'Hospital 3', otherHandling: true },
            { officeId: '4', officeName: 'Hospital 4', otherHandling: true },
          ]
        })));
        return;
      }
      if (connection.request.url.endsWith('/api/pr/re/user_edit/additional_update_mail_address')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {}
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/pr/re/user_edit/delete_user')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/pr/re/notification')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            desktopWhenMentioned: true,
            desktopWhenNewPost: true,
            desktopWhenNewPostLeftUnread: true,
            mailWhenMentioned: true,
            mailWhenNewPost: true,
            mailWhenNewPostLeftUnread: true
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/pr/re/handling_other_hospitals')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: []
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/pr/re/staff_invite/handle_offices')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: [
            {
              medicalOfficeId: '3',
              medicalOfficeName: 'aaaaaaa'
            },
            {
              medicalOfficeId: '2',
              medicalOfficeName: 'bbbbbbb'
            },
            {
              medicalOfficeId: '1',
              medicalOfficeName: 'ccccccc'
            }
          ]
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/pr/re/staff_invite/invite_user')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            errorList: [
              'aaa@gmail.com',
              'bbb@gmail.com',
              'ccc@gmail.com'
            ],
            successList: [
              'ddd@gmail.com',
              'eee@gmail.com',
              'fff@gmail.com',
              'ggg@gmail.com'
            ]
          }
        })));
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_invite/provisional_users?departmentId=&name=&group=0&page=2&size=10')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            page: 2,
            user: [
              {
                id: 1222,
                firstName: '22東海林',
                lastName: '哲哉',
                firstNameKana: '2しょうじ',
                lastNameKana: '2てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: '2LG009',
                temporaryPassword: '2abcAdmin123'
              },
              {
                id: 2,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 3,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 4,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 5,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 6,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 7,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 8,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 9,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 10,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              }
            ]
          }
        })));
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_invite/provisional_users?departmentId=&name=aa&group=0&page=1&size=10')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            page: 2,
            user: [
              {
                id: 1222,
                firstName: 'aa東海林',
                lastName: 'a哲哉',
                firstNameKana: 'a2しょうじ',
                lastNameKana: 'aa2てつや',
                jobType: 'aJ0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: '2LG009',
                temporaryPassword: '2abcAdmin123'
              },
              {
                id: 2,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 3,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 4,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 5,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 6,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 7,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 8,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 9,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 10,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              }
            ]
          }
        })));
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/staff_invite/provisional_users?departmentId=&name=aa&group=0&page=1&size=10')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            page: 2,
            user: [
              {
                id: 1222,
                firstName: 'aa東海林',
                lastName: 'a哲哉',
                firstNameKana: 'a2しょうじ',
                lastNameKana: 'aa2てつや',
                jobType: 'aJ0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: '2LG009',
                temporaryPassword: '2abcAdmin123'
              },
              {
                id: 2,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 3,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 4,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 5,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 6,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 7,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 8,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 9,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              },
              {
                id: 10,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                loginId: 'LG009',
                temporaryPassword: 'abcAdmin123'
              }
            ]
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/ba/session/drjoy')) {
        return;
      }

      if (connection.request.url.endsWith('/api/ba/session/info')) {
        return;
      }

      if (connection.request.url.endsWith('/api/pr/re/keycode')) {
        return;
      }

      if (connection.request.url.endsWith('/api/pr/re/password')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            currentPassword: 'string',
            newPassword: 'string'
          }
        })));
        return;
      }
      if (connection.request.url.endsWith('/api/ba/specializedDepartment')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/ca/get_event')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            allDay: false,
            calendarId: 'string',
            created: 'string',
            createdUserId: 'string',
            delete_flag: false,
            deleted: 'string',
            deletedUserId: 'string',
            end: 'string',
            externalEventId: 'string',
            id: 'string',
            meetingPublishType: 'string',
            modified: 'string',
            modifiedUserId: 'string',
            note: 'string',
            officeId: 'string',
            place: 'string',
            publishType: 'string',
            recurringEventId: 'string',
            repeatParentId: 'string',
            repeatRule: 'string',
            start: 'string',
            title: 'string',
            userId: 'string'
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/ca/search_events')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            items: [
              {
                allDay: false,
                calendarId: 'string',
                color: 0,
                end: '2017-08-25T10:37:11.961Z',
                id: 'string',
                start: '2017-08-25T10:37:11.961Z',
                title: 'string'
              }
            ]
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/ca/get_staff_calendar_users')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            items: [
              {
                facePhoto: 'string',
                firstName: 'string',
                id: 'string',
                lastName: 'string'
              }
            ]
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/ca/save_event')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            allDay: false,
            end: '2017-08-28T01:16:03.227Z',
            id: 'string',
            meetingPublishType: 'DISPLAY_AS_BUSY',
            note: 'string',
            place: 'string',
            publishType: 'DISPLAY_AS_BUSY',
            recursiveOption: 'THIS_EVENT',
            repeatParentId: 'string',
            repeatRule: 'string',
            start: '2017-08-28T01:16:03.227Z',
            title: 'string'
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/ca/get_calendar_references')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            items: [
              {
                calendarReferenceId: '01',
                calendarId: '01', calendarType: 'MY', color: 11506560, visible: true,
                userId: 'string', lastName: 'string', firstName: 'string',
                shareStatus: 'DENY', groupId: 'string', groupName: 'string', externalCalendarName: 'string'
              },
              {
                calendarReferenceId: '01',
                calendarId: '02', calendarType: 'MEETING_DECIDED', color: 16741687, visible: false,
                userId: 'string', lastName: 'string', firstName: 'string',
                shareStatus: 'DENY', groupId: 'string', groupName: 'string', externalCalendarName: 'string'
              },
              {
                calendarReferenceId: '01',
                calendarId: '03', calendarType: 'MEETING_ACCEPTING', color: 8114504, visible: true,
                userId: 'string', lastName: 'string', firstName: 'string',
                shareStatus: 'DENY', groupId: 'string', groupName: 'string', externalCalendarName: 'string'
              },
              {
                calendarReferenceId: '01',
                calendarId: '01', calendarType: 'MEETING_MEDIATOR', color: 14529806, visible: false,
                userId: 'string', lastName: 'string', firstName: 'string',
                shareStatus: 'DENY', groupId: 'string', groupName: 'string', externalCalendarName: 'string'
              },
              {
                calendarReferenceId: '01',
                calendarId: '04', calendarType: 'VISIT', color: 13211578, visible: true,
                userId: 'string', lastName: 'string', firstName: 'string',
                shareStatus: 'DENY', groupId: 'string', groupName: 'string', externalCalendarName: 'string'
              },
              {
                calendarReferenceId: '01',
                calendarId: '05', calendarType: 'SOCIETY', color: 9669585, visible: false,
                userId: 'string', lastName: 'string', firstName: 'string',
                shareStatus: 'DENY', groupId: 'string', groupName: 'string', externalCalendarName: 'string'
              },
              {
                calendarReferenceId: '01',
                calendarId: '06', calendarType: 'HOLIDAY', color: 15699598, visible: true,
                userId: 'string', lastName: 'string', firstName: 'string',
                shareStatus: 'DENY', groupId: 'string', groupName: 'string', externalCalendarName: 'string'
              }
            ]
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/ca/save_calendar_references')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            calendarReferences: [
              {
                color: 0,
                id: 'string',
                visible: false
              }
            ]
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/ca/get_referencing_users')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            items: [
              {
                color: 0,
                userId: 'string',
                visible: false
              }
            ]
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/ca/save_referencing_users')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            items: [
              {
                color: 0,
                userId: 'string',
                visible: false
              }
            ]
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/ca/get_external_calendar_references')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            items: [
              {
                accountName: 'string',
                calendarName: 'string',
                calendarReferenceId: 'string',
                color: 0,
                externalCalendarId: 'string',
                provider_type: 'GOOGLE',
                visible: false
              }
            ]
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/ca/delete_external_authorization')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            id: 'string'
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/re/grant_auth/user')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            status: 204,
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/ba/joptype')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: [
            { Id: 'J0001', Name: 'J0001' }, { Id: 'J0002', Name: 'J0002' }, { Id: 'J0003', Name: 'J0003' }, { Id: 'J0004', Name: 'J0004' },
            { Id: 'J0005', Name: 'J0005' }, { Id: 'J0006', Name: 'J0006' }, { Id: 'J0007', Name: 'J0007' }, { Id: 'J0008', Name: 'J0008' },
            { Id: 'J0009', Name: 'J0009' }, { Id: 'J0010', Name: 'J0010' }, { Id: 'J0011', Name: 'J0011' }, { Id: 'J0012', Name: 'J0012' },
            { Id: 'J0013', Name: 'J0013' }, { Id: 'J0014', Name: 'J0014' }, { Id: 'J0015', Name: 'J0015' }, { Id: 'J0016', Name: 'J0016' },
            { Id: 'J0017', Name: 'J0017' }, { Id: 'J0018', Name: 'J0018' }, { Id: 'J0019', Name: 'J0019' }, { Id: 'J0020', Name: 'J0020' },
            { Id: 'J0021', Name: 'J0021' }, { Id: 'J0022', Name: 'J0022' }, { Id: 'J0023', Name: 'J0023' }, { Id: 'J0024', Name: 'J0024' },
            { Id: 'J0025', Name: 'J0025' }, { Id: 'J0026', Name: 'J0026' }, { Id: 'J0027', Name: 'J0027' }, { Id: 'J0028', Name: 'J0028' },
            { Id: 'J0029', Name: 'J0029' }, { Id: 'J0030', Name: 'J0030' }, { Id: 'J0031', Name: 'J0031' }, { Id: 'J0032', Name: 'J0032' },
            { Id: 'J0033', Name: 'J0033' }, { Id: 'J0034', Name: 'J0034' }, { Id: 'J0035', Name: 'J0035' }, { Id: 'J0036', Name: 'J0036' },
            { Id: 'J0037', Name: 'J0037' }, { Id: 'J0038', Name: 'J0038' }, { Id: 'J0039', Name: 'J0039' }, { Id: 'J0040', Name: 'J0040' },
            { Id: 'J0041', Name: 'J0041' }, { Id: 'J0042', Name: 'J0042' }, { Id: 'J0043', Name: 'J0043' }, { Id: 'J0044', Name: 'J0044' },
            { Id: 'J0045', Name: 'J0045' }, { Id: 'J0046', Name: 'J0046' }, { Id: 'J9999', Name: 'J9999' }
          ]
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/ba/province')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: ['P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008', 'P009', 'P010', 'P011',
            'P012', 'P013', 'P014', 'P015', 'P016', 'P017', 'P018', 'P019', 'P020', 'P021', 'P022', 'P023', 'P024',
            'P025', 'P026', 'P027', 'P028', 'P029', 'P030', 'P031', 'P032', 'P033', 'P034', 'P035', 'P036', 'P037',
            'P038', 'P039', 'P040', 'P041', 'P042', 'P043', 'P044', 'P045', 'P046', 'P047']
        })));
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/grant_auth/users?departmentId=&name=&group=0&sort=-lastName&page=1&size=10')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            page: 1,
            user: [
              {
                id: 1,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 2,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 3,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 4,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 5,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 6,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 7,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 8,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 9,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 10,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              }
            ]
          }
        })));
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/grant_auth/users?departmentId=&name=&group=0&sort=+lastName&page=1&size=10')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            page: 1,
            user: [
              {
                id: 1,
                firstName: '++東海林',
                lastName: '++哲哉',
                firstNameKana: '++しょうじ',
                lastNameKana: '++てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 2,
                firstName: '++東海林',
                lastName: '++哲哉',
                firstNameKana: '++しょうじ',
                lastNameKana: '++てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 3,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 4,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 5,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 6,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 7,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 8,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 9,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 10,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              }
            ]
          }
        })));
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/grant_auth/users?departmentId=&name=&group=0&sort=-lastName&page=2&size=10')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            page: 2,
            user: [
              {
                id: 1,
                firstName: '22東海林',
                lastName: '22哲哉',
                firstNameKana: '++しょうじ',
                lastNameKana: '++てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 2,
                firstName: '++東海林',
                lastName: '++哲哉',
                firstNameKana: '++しょうじ',
                lastNameKana: '++てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 3,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 4,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 5,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 6,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 7,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 8,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 9,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 10,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              }
            ]
          }
        })));
        return;
      }
      if (connection.request.url.endsWith('/api/dr/re/grant_auth/users?departmentId=&name=&group=0&sort=-lastName&page=3&size=10')) {
        connection.mockRespond(new Response(new ResponseOptions({
          status: 200,
          body: {
            page: 3,
            user: [
              {
                id: 1,
                firstName: '33東海林',
                lastName: '33哲哉',
                firstNameKana: '++しょうじ',
                lastNameKana: '++てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 2,
                firstName: '++東海林',
                lastName: '++哲哉',
                firstNameKana: '++しょうじ',
                lastNameKana: '++てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 3,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 4,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 5,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 6,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 7,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 8,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 9,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              },
              {
                id: 10,
                firstName: '東海林',
                lastName: '哲哉',
                firstNameKana: 'しょうじ',
                lastNameKana: 'てつや',
                jobType: 'J0001',
                accountStatus: '1',
                department: {
                  id: '1',
                  name: 'Root1',
                  displayName: 'Root1',
                  children: [
                    {
                      id: '9',
                      name: 'Root1-Sub1',
                      displayName: 'Root1-Sub1',
                      children: [
                        {
                          id: '10',
                          name: 'Root11-Sub1',
                          displayName: 'Root1-Sub2',
                          children: [{
                            id: '11',
                            name: 'Root1-Sub3',
                            displayName: 'Root1-Sub3',
                            children: [{
                              id: '12',
                              name: 'Root1-Sub4',
                              displayName: 'Root1-Sub4'
                            }]
                          }]
                        }
                      ]
                    }
                  ]
                },
                adminAuthority: 'MP_1',
                functionAuthority: 'FP_1',
                mailAddress: 'demo@drjoy.jp',
                officeID: '01234567890',
                officeUserID: '343456728'
              }
            ]
          }
        })));
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/inside/create/prepare')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/dept/user')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/inside/create/save')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/inside/create/dept/prepare')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/inside/create/dept/save')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/inside/edit/prepare')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/inside/edit/save')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/delete')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/inside/edit/dept/prepare')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/inside/edit/dept/save')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/surveys/create/save')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/surveys/edit/save')) {
        return;
      }

      if (connection.request.url.endsWith('/api/dr/gr/outside/create/prepare')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/gr/office/user')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/gr/outside/user/from/email')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/gr/outside/create/save')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/gr/outside/edit/prepare')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/gr/outside/edit/save')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/gr/member/join/prepare')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/gr/member/join/agree')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/gr/member/join/disagree')) {
        return;
      }
      if (connection.request.url.endsWith('/api/dr/gr/comment/create')) {
        return;
      }

      const realHttp = new Http(realBackend, options);
      const requestOptions = new RequestOptions({
        method: connection.request.method,
        headers: connection.request.headers,
        body: connection.request.getBody(),
        url: connection.request.url,
        withCredentials: connection.request.withCredentials,
        responseType: connection.request.responseType
      });
      realHttp.request(connection.request.url, requestOptions)
        .subscribe((response: Response) => {
            connection.mockRespond(response);
          },
          (error: any) => {
            connection.mockError(error);
          });

    }, 500);

  });

  return new Http(backend, options);
}

// export let fakeBackendProvider = {
//   // use fake backend in place of Http service for backend-less development
//   provide: HttpInterceptor,
//   useFactory: fakeBackendFactory,
//   deps: [MockBackend, BaseRequestOptions, XHRBackend]
// };
