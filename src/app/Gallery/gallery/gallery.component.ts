import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { map, finalize, catchError } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { FirebaseService } from '../../__services/firebase.service';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  ref: any;
  task: any;
  uploadProgress: any;
  downloadURL: any;
  basePath = '/gallery';
  imageList: any = [];
  isGalleryData: boolean = false;
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
    this.isGalleryData = false;
    this.spinner.show();
    try {
      await this.getAllImages();
    } catch(err: any) {
      console.log(err);
    }
   
  }

  saveGalleryDetails(url: any, img: any) {
    return new Promise((resolve, reject) => {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let obj = {
        _id: '',
        name: img,
        createdAt: now,
        isActive: true,
        imgUrl: url,
        author: 'CURRENT_USER'
      };
      this.fbService.saveGalleryData(obj).then(() => {
        resolve('saved');
      }).catch((err) => {
        reject(err);
      });
    });
  }

  async uploadToFbStorage(img: any) {
    var n = Date.now();
    const fileImg = img;
    const filePath = `gallery/${n}_${img.name}`;
    const imgName = `${n}_${img.name}`;
    return new Promise((resolve, reject) => {
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(`gallery/${n}_${img.name}`, fileImg);
      task.snapshotChanges().pipe (
          finalize(() => {
            let dwUrl;
            dwUrl = fileRef.getDownloadURL();
            dwUrl.subscribe(async (url: any) => {
              if (url) {
                this.downloadURL = url;
                await this.saveGalleryDetails(this.downloadURL,imgName);
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
      this.storage.storage.ref().child(this.basePath).listAll().then((res: any) => {
        if(res.items.length > 0) {
          try {
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
              },(err: any) => {
                reject('no file');
                this.spinner.hide();    
              });
            });
          } catch(fbErr) {
            reject(fbErr);
            this.spinner.hide();
          };
        } else {
          reject('no file here');
          this.spinner.hide();
        }
      }).catch(err => {
        reject(err);
        this.spinner.hide();
      });
    });
  }

  async removePhoto(img: any) {
    const fieldName = 'imgUrl';
    const removePromise = new Promise((resolve, reject) => {
      this.fbService.queryGalleryDb(fieldName, img.path).subscribe((data: any) => {
        if(data.length > 0) {
          let docId = data[0]._id;
          this.fbService.removeGalleryImage(docId).then(() => {
            this.storage.storage.refFromURL(img.path).delete();
          }).catch(err => {
            console.log(err);
            reject(err);
          });
        }
        resolve(1);
      }, err => {
        throwError(err);
      });
    });

    try {
      await removePromise;
      this.storage.storage.refFromURL(img.path).delete().catch((delerr: any) => {
        throwError(delerr);
      });
      await this.getAllImages();
    } catch (err) {
      console.log(err);
    }
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
