import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../__services/firebase.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  title = 'Nameless-Storyteller';
  constructor(
    private fbService: FirebaseService,
    private _router: Router
  ) { }

  ngOnInit(): void {
  }

  signout() {
    let currentUser = localStorage.getItem('currentUser');
    if(currentUser != '') {
      this.fbService.getSingleLoginData(currentUser).subscribe(res => {
        const data = {
          _id: '',
          username: res[0].username,
          loginAt: res[0].loginAt,
          logoutAt: moment().format('YYYY-MM-DDTHH:mm:ss'),
          author: res[0].author 
        };
        this.fbService.updateLoginData(res[0]._id,data).then(() => {
          this._router.navigate(['/']);
          localStorage.clear();
        }).catch(err => {
          localStorage.clear();
          this._router.navigate(['/']);
        })
      }, err => {
        console.log(err);
        localStorage.clear();
        this._router.navigate(['/']);
      });
      
    } else {
      this._router.navigate(['/']);
    }
   
  }

}
