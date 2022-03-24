import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from "@angular/common";
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { map, finalize } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { FirebaseService } from '../../__services/firebase.service';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-our-team',
  templateUrl: './our-team.component.html',
  styleUrls: ['./our-team.component.css']
})
export class OurTeamComponent implements OnInit {

  myTeamForm : any;
  ref: any;
  task: any;
  uploadProgress: any;
  downloadURL: any;
  submitted = false;
  basePath = '/teamMates';
  imageList: any = [];
  isOurWorkData: boolean = false;
  position: any;
  ourWorkDataGiven: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  contentTYpe: any;
  selectedDataSource: any;
  contentList: any = [];
  isEdit: boolean = false;
  constructor(
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    private spinner : NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private fbService: FirebaseService,
    private scroller: ViewportScroller
  ) { }

  async ngOnInit()  {
    this.contentTYpe = [
      { id: 'music_video', value: 'Music Video' },
      { id: 'short_film', value: 'Short Film' },
      { id: 'audio_story', value: 'Audio Story' },
      { id: 'trailer', value: 'Trailer' },
      { id: 'upcoming', value: 'Upcoming' },
    ];

    this.submitted = false;
    this.contentList = [];
    this.isEdit = false;
    this.downloadURL = '';
  
    this.myTeamForm = this.fb.group({
      fullName: ["",Validators.required],
      role: ["",Validators.required],
    });
    this.spinner.show();
    try {
      await this.getAllContentData();
    } catch (err: any) {
      console.log(err);
    }
    
  }

  get flval(){return this.myTeamForm.controls;}


  onSubmit_team() {
    this.submitted = true;
    if (this.myTeamForm.invalid) {
      return;
    }
    if(!this.isEdit) {
      this.spinner.show();
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let obj = {
        _id: '',
        fullName: this.flval.fullName.value.toUpperCase(),
        role: this.flval.role.value.toUpperCase(),
        imgUrl: this.downloadURL,
        createdAt: now,
        modifiedAt: now,
        isActive: true,
        author: 'CURRENT_USER'
      };

      this.fbService.saveTeamData(obj).then(() => {
        this.submitted = false;
        this.myTeamForm.reset();
        this.spinner.hide();
        this.ngOnInit();
        this.scroller.scrollToAnchor('targetTop');
      }).catch(err => {
        this.submitted = false;
        this.spinner.hide();
      });
    } else {
      this.spinner.show();
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      const documentId = this.selectedDataSource._id;
      let obj = {
        fullName: this.flval.fullName.value.toUpperCase(),
        role: this.flval.role.value.toUpperCase(),
        imgUrl: this.downloadURL == '' ? this.selectedDataSource.imgUrl : this.downloadURL,
        createdAt: this.selectedDataSource.createdAt,
        modifiedAt: now,
        isActive: true,
        author: 'CURRENT_USER'
      };

      this.fbService.updateTeamData(documentId, obj).then(() => {
        this.submitted = false;
        this.myTeamForm.reset();
        this.spinner.hide();
        this.ngOnInit();
        this.scroller.scrollToAnchor('targetTop');
      }).catch(err => {
        this.submitted = false;
        this.spinner.hide();
      });
      
    }
  }

  async uploadToFbStorage(img: any) {
    var n = Date.now();
    const fileImg = img;
    const filePath = `teamMates/${n}_${img.name}`;
    const imgName = `${n}_${img.name}`;
    return new Promise((resolve, reject) => {
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(`teamMates/${n}_${img.name}`, fileImg);
      task.snapshotChanges().pipe (
          finalize(() => {
            let dwUrl;
            dwUrl = fileRef.getDownloadURL();
            dwUrl.subscribe(async (url: any) => {
              if (url) {
                this.downloadURL = url;
                this.spinner.hide();
                resolve('uploaded');
              }
            });
          })
      ).subscribe(url => { if (url) {}});
    });

  }

  async upload(event : any) {
    this.spinner.show();
    if(event.target.files.length > 0) {
      for(let i = 0; i < event.target.files.length; i++ ) {
        var n = Date.now();
        const fileImg = event.target.files[i];
        await this.uploadToFbStorage(fileImg);
      }
    }
  }

  openSnackBar(openSnackBar: any) {
    let snackBarRef = this._snackBar.open('Are you sure..??', 'Delete', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration:5000
    });
    snackBarRef.afterDismissed().subscribe((res: any) => {
      if(res.dismissedByAction) {
        this.removeContent(openSnackBar);
      }
    });
  }

  getAllContentData() {
    this.contentList = [];
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.fbService.getAllTeamData().subscribe((data: any) => {
        if(data.length > 0) {
          this.contentList = data
          this.spinner.hide();
          resolve('got content data');
        } else {
          this.spinner.hide();
          throwError('no content data');
          reject('no content data');
        }
      },(err: any) => {
        this.spinner.hide();
        reject(err);
      })
    });
  }

  removeContent(content: any) {
    this.spinner.show();
    const documentId = content._id;
    const imgUrl = content.imgUrl;

    this.fbService.removeTeamMate(documentId).then(async() => {
      this.storage.storage.refFromURL(imgUrl).delete();
      try{
        await this.getAllContentData();
      } catch(err: any) {
        console.log(err);
      }
      
      this.spinner.hide();
    });
    
  }

  loadContent(content: any) {
    this.isEdit = true;
    console.log(content);
    this.selectedDataSource = content;
    this.myTeamForm.patchValue({
      fullName: content.fullName,
      role: content.role,
    });
    this.scroller.scrollToAnchor('targetEdit');
  }

}
