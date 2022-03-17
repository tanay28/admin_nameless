import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from "@angular/common";
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { FirebaseService } from '../__services/firebase.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm : any;
  submitted = false;
  isUserExists = false;
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
    this.isUserExists = false;
    this.signupForm = this.fb.group({
      username: ["",Validators.required],
      password: ["",Validators.required],
      retypePassword
      
      : ["",Validators.required],
    });
  }

  get flval(){ return this.signupForm.controls; }

  onBlur(event: any) {
    this.isUserExists = false;
    const username = event.target.value;
    this.fbService.getSingleUserData(this.flval.username.value).subscribe(res => {
      if(res.length > 0) this.isUserExists = true;
    }, err => {
      console.log(err);
    })
  }

  onSubmit() {
    this.submitted = true;
    if (this.signupForm.invalid) {
      this._snackBar.open('All fields are required.!! Please fill all the fields.', 'Close', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration:5000
      });
      return;
    }
    if(this.flval.password.value != this.flval.retypePassword.value) {
      this._snackBar.open('Mismatch password..!!', 'Close', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration:5000
      });
      return;
    }
    this.spinner.show();
    let now = moment().format('YYYY-MM-DDTHH:mm:ss');
    let obj = {
      _id: '',
      username: this.flval.username.value,
      password: this.flval.password.value,
      createdAt: now,
      modifiedAt: now,
      author: 'CURRENT_USER'
    };
  
    if(this.isUserExists) {
      this.spinner.hide();
      this._snackBar.open('The user already exists..!!', 'Close', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration:5000
      });
    } else {
      this.fbService.saveUserData(obj).then(() => {
        this.submitted = false;
        this.signupForm.reset();
        this._router.navigate(['/']);
        this.spinner.hide();
        
      }).catch(err => {
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

}
