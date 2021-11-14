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
  constructor(private toastr:NbToastrService) { }

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
       "Please fill the Current password field",
        "Error",
        {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
        this.submitted = false;
        return;
    };
    if(!this.checkInput(this.passChangeObject.password)) {
      this.toastr.show(
       "Please fill the New password field. It should be at least 5 characters long.",
        "Error",
        {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
        this.submitted = false;
        return;
    };

    if(this.passChangeObject.password !== this.passChangeObject.password_retype) {
      this.toastr.show(
        "Both new passwords should be the same.",
         "Error",
         {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
         this.submitted = false;
         return;
    }
    console.log("SAVE");
  }
}
