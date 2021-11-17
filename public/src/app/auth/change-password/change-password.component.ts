import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from './../auth.service';
import { NbGlobalLogicalPosition, NbToastrService } from '@nebular/theme';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  submitted = false;
  passChangeObject = {
    "oldpassword": undefined,
    "password": undefined,
    "password_retype": undefined
  }
  constructor(private toastr: NbToastrService, private authService: AuthService, private translatePipe:TranslatePipe, private router: Router) { }

  ngOnInit(): void {
  }

  checkInput(input:string) {
    if(!input || input.length < 5) {
      return false;
    } 
    return true;
  }
  save() {
    this.submitted = true;
    if(!this.checkInput(this.passChangeObject.oldpassword)) {
      this.toastr.show(
        this.translatePipe.transform("Please fill the Current password field"),
        this.translatePipe.transform("Error"),
        {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
        this.submitted = false;
        return;
    };
    if(!this.checkInput(this.passChangeObject.password)) {
      this.toastr.show(
        this.translatePipe.transform("Please fill the New password field. It should be at least 5 characters long."),
        this.translatePipe.transform("Error"),
        {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
        this.submitted = false;
        return;
    };

    if(this.passChangeObject.password !== this.passChangeObject.password_retype) {
      this.toastr.show(
        this.translatePipe.transform("Both new passwords should be the same."),
        this.translatePipe.transform("Error"),
         {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
         this.submitted = false;
         return;
    }
    this.authService.changePassword(this.passChangeObject.oldpassword, this.passChangeObject.password).subscribe(
      {
        next: (res) => {
          this.toastr.show(
            this.translatePipe.transform("Your password changed successfully."),
            this.translatePipe.transform("Details updated"),
             {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "success"});
          this.submitted = false;
          this.router.navigateByUrl("/auth/profile");
        },
        error: (err) => {
          this.toastr.show(
            this.translatePipe.transform(err.error),
            this.translatePipe.transform("Error"),
             {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
          this.submitted = false;
        }
      }
    )
  }
}
