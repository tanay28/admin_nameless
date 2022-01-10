import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { map, finalize } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { FirebaseService } from '../../__services/firebase.service';
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})

export class AboutComponent implements OnInit {
  myForm : any;
  ref: any;
  task: any;
  uploadProgress: any;
  downloadURL: any;
  submitted = false;
  basePath = '/achievements';
  imageList: any = [];
  isAboutUsData: boolean = false;
  position: any;
  aboutusDataGiven: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  constructor(
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    private spinner : NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private fbService: FirebaseService
    ) { }

  async ngOnInit()  {
    this.submitted = false;
    this.isAboutUsData = false;
    this.myForm = this.fb.group({
      description: ["",Validators.required],
    });
    this.spinner.show();
    await this.getAllImages();
    await this.getAbousUsData();
  }

  get fval(){return this.myForm.controls;}

  getAbousUsData() {
    return new Promise((resolve, reject) => {
      this.fbService.getAllAboutUsData().subscribe((data: any) => {
        if(data.length > 0) {
          this.isAboutUsData = true;
          this.aboutusDataGiven = data[0];
          this.myForm = this.fb.group({
            description: [this.aboutusDataGiven.description,Validators.required],
          });
          resolve('got it');
        } else {
          this.isAboutUsData = false;
          reject('no data');
          this.spinner.hide();
        }
      });
    })
    
  }

  onSubmit() {
    this.submitted = true;
    if (this.myForm.invalid) {
      return;
    }
    this.spinner.show();
    if(!this.isAboutUsData) {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let aboutUsObj = {
        _id: '',
        description: this.fval.description.value,
        createdAt: now,
        modifiedAt: now,
        author: 'CURRENT_USER'
      };
    
      this.fbService.saveAboutUsData(aboutUsObj).then(async () => {
        this.myForm.reset();
        this.spinner.hide();
        this.submitted = false;
        await this.getAbousUsData();
      }).catch(err => {
        this.submitted = false;
        this.myForm.reset();
        this.spinner.hide();
      });
    } else {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let aboutUsObj = {
        description: this.fval.description.value,
        createdAt: this.aboutusDataGiven.createdAt,
        modifiedAt: now,
        author: 'CURRENT_USER'
      };
      this.fbService.updateAboutUsData(this.aboutusDataGiven._id,aboutUsObj).then(async () => {
        this.myForm.reset();
        this.spinner.hide();
        this.submitted = false;
        await this.getAbousUsData();
      }).catch(err => {
        this.submitted = false;
        this.myForm.reset();
        this.spinner.hide();
      })
  
    }
    
  }

  saveAchievementDetails(url: any, img: any) {
    return new Promise((resolve, reject) => {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let obj = {
        _id: '',
        name: img,
        createdAt: now,
        isActive: true,
        imgUrl: url
      };
      this.fbService.saveAchievementData(obj).then(() => {
        resolve('saved');
      }).catch((err) => {
        reject(err);
      });
    });
  }

  async uploadToFbStorage(img: any) {
    var n = Date.now();
    const fileImg = img;
    const filePath = `achievements/${n}_${img.name}`;
    const imgName = `${n}_${img.name}`;
    return new Promise((resolve, reject) => {
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(`achievements/${n}_${img.name}`, fileImg);
      task.snapshotChanges().pipe (
          finalize(() => {
            let dwUrl;
            dwUrl = fileRef.getDownloadURL();
            dwUrl.subscribe(async (url: any) => {
              if (url) {
                this.downloadURL = url;
                await this.saveAchievementDetails(this.downloadURL,imgName);
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
      this.getAllImages();
    }
  }

  getAllImages() {
    this.spinner.show();
    this.imageList = [];
    return new Promise((resolve, reject) => {
      this.storage.storage.ref().child(this.basePath).listAll().then((res:any) => {
        if(res.items.length > 0) {
          res.items.forEach((item: any) => {
            let imgRef = this.storage.ref(item.fullPath);
            imgRef.getDownloadURL().subscribe((url: any) => {
              let obj = {
                id : item.name,
                path: url
              };
              this.imageList.push(obj);
              resolve(1);
              this.spinner.hide();
            });
          });
        } else {
          reject('no file');
          this.spinner.hide();
        }
      }).catch(err => {
        reject('no file');
        this.spinner.hide();
      });
    });
  }

  async removePhoto(img: any) {
    const removePromise = new Promise((resolve, reject) => {
      this.fbService.queryAchievementDb('imgUrl',img.path).subscribe((data: any) => {
        if(data.length > 0) {
          let docId = data[0]._id;
          this.fbService.removeAchievements(docId).then(() => {
            this.storage.storage.refFromURL(img.path).delete();
          }).catch(err => {
            console.log(err);
            reject(err);
          });
        }
        resolve(1);
      });
    });
    await removePromise;
    this.storage.storage.refFromURL(img.path).delete();
    this.getAllImages();
    return true;
  }

  openSnackBar(img: any) {
    let snackBarRef = this._snackBar.open('Are you sure..??', 'Delete', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration:5000
    });
    snackBarRef.afterDismissed().subscribe((res: any) => {
      if(res.dismissedByAction) {
        this.removePhoto(img);
      }
    });
  }
}

