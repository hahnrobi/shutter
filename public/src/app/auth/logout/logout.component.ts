/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
 import { Component, Inject, OnInit } from '@angular/core';
 import { Router } from '@angular/router';
 import { getDeepFromObject, NbAuthResult, NbAuthService, NbTokenService, NB_AUTH_OPTIONS } from '@nebular/auth';
 
import { NbLogoutComponent } from '@nebular/auth';
import { NbGlobalLogicalPosition, NbToastrService } from '@nebular/theme';
 
 @Component({
   selector: 'auth-logout',
   templateUrl: './logout.component.html',
 })
 export class LogoutComponent extends NbLogoutComponent implements OnInit {
 
  redirectDelay: number = 0;
  strategy: string = '';

  constructor(protected service: NbAuthService,
              @Inject(NB_AUTH_OPTIONS) protected options = {},
              protected router: Router, protected nbTokenService:NbTokenService, protected toastrService: NbToastrService,) {
  super(service, options, router);
  this.redirectDelay = this.getConfigValue('forms.logout.redirectDelay');
  this.strategy = this.getConfigValue('forms.logout.strategy');
  }

  ngOnInit(): void {
    this.logout(this.strategy);
  }

  logout(strategy: string): void {
    this.service.logout(strategy).subscribe((result: NbAuthResult) => {
    console.log(result);
    console.log(this.redirectDelay);
    console.log(result.getRedirect());
      const redirect = result.getRedirect();
      if (redirect) {
        setTimeout(() => {
          return window.location.href = redirect;
          //return this.router.navigateByUrl(redirect);
        }, this.redirectDelay);
      }
    });
  }

  getConfigValue(key: string): any {
    return getDeepFromObject(this.options, key, null);
  }
 }