import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from "@angular/common";
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { map, finalize } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { FirebaseService } from '../__services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm : any;
  submitted = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    private spinner : NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private fbService: FirebaseService,
    private scroller: ViewportScroller,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.submitted = false;
    this.loginForm = this.fb.group({
      username: ["",Validators.required],
      password: ["",Validators.required],
    });
  }

  get flval(){ return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this._snackBar.open('All fields are required.!! Please fill all the fields.', 'Close', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration:5000
      });
      return;
    }
    let now = moment().format('YYYY-MM-DDTHH:mm:ss');
    this.fbService.getSingleUserData(this.flval.username.value).subscribe(res => {
      if(res.length > 0) {
        if(res[0].password === this.flval.password.value) {
          const obj = {
            _id: '',
            username: this.flval.username.value,
            loginAt: now,
            logoutAt: '',
            author: 'CURRENT_USER'
          };
          this.fbService.saveLoginData(obj).then(() => {
            this.submitted = false;
          }).catch(err => {
            this.submitted = false;
          });
          this.loginForm.reset();
          this.spinner.hide();
         
          localStorage.setItem('currentUser',res[0].username);
          this._router.navigate(['/home']);
        } else {
          this.spinner.hide();
          this._snackBar.open('Incorrect credentials..!!', 'Close', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration:5000
          });
        }
      } else {
        this.spinner.hide();
        this._snackBar.open('The user does not exists..!!', 'Close', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration:5000
        });
      }
    }, err => {
      this.submitted = false;
      this.spinner.hide();
      this._snackBar.open('Internal server error.!! Please try again.', 'Close', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration:5000
      });
      this._router.navigate(['/']);
    });
  }

}
