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
  selector: 'app-our-works',
  templateUrl: './our-works.component.html',
  styleUrls: ['./our-works.component.css']
})

export class OurWorksComponent implements OnInit {

  myForm : any;
  myFilmForm : any;
  ref: any;
  task: any;
  uploadProgress: any;
  downloadURL: any;
  submitted = false;
  submitted_films = false;
  basePath = '/films';
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
    this.submitted_films = false;
    this.isOurWorkData = false;
    this.contentList = [];
    this.isEdit = false;
    this.downloadURL = '';
    this.myForm = this.fb.group({
      description: ["",Validators.required],
    });
    this.myFilmForm = this.fb.group({
      contentType: ["",Validators.required],
      genre: ["",Validators.required],
      shortdes: ["",Validators.required],
      youtubeLink: ["",Validators.required]
    });
    this.spinner.show();
    try {
      await this.getAllFilmsImages();
      await this.getOurWorksData();
      await this.getAllContentData();
    } catch (err: any) {
      console.log(err);
    }
    
  }

  get fval(){return this.myForm.controls;}
  get flval(){return this.myFilmForm.controls;}

  getOurWorksData() {
    return new Promise((resolve, reject) => {
      this.fbService.getAllOurWorkData().subscribe((data: any) => {
        if(data.length > 0) {
          this.isOurWorkData = true;
          this.ourWorkDataGiven = data[0];
          this.myForm = this.fb.group({
            description: [this.ourWorkDataGiven.description,Validators.required],
          });
          resolve('got it');
        } else {
          this.isOurWorkData = false;
          reject('no data');
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
    if(!this.isOurWorkData) {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let aboutUsObj = {
        _id: '',
        description: this.fval.description.value,
        createdAt: now,
        modifiedAt: now,
        author: 'CURRENT_USER'
      };
    
      this.fbService.saveOurWorkData(aboutUsObj).then(async () => {
        this.myForm.reset();
        this.spinner.hide();
        this.submitted = false;
        await this.getOurWorksData();
      }).catch(err => {
        this.submitted = false;
        this.myForm.reset();
        this.spinner.hide();
      });
    } else {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let aboutUsObj = {
        description: this.fval.description.value,
        createdAt: this.ourWorkDataGiven.createdAt,
        modifiedAt: now,
        author: 'CURRENT_USER'
      };
      this.fbService.updateOurWorkData(this.ourWorkDataGiven._id,aboutUsObj).then(async () => {
        this.myForm.reset();
        this.spinner.hide();
        this.submitted = false;
        await this.getOurWorksData();
      }).catch(err => {
        this.submitted = false;
        this.myForm.reset();
        this.spinner.hide();
      })
  
    }
    
  }

  onSubmit_content() {
    this.submitted_films = true;
    if (this.myFilmForm.invalid) {
      return;
    }
    if(!this.isEdit) {
      this.spinner.show();
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let obj = {
        _id: '',
        contentType: this.flval.contentType.value,
        genre: this.flval.genre.value,
        shortdes: this.flval.shortdes.value,
        youtubeLink: this.flval.youtubeLink.value,
        posterImgUrl: this.downloadURL,
        createdAt: now,
        modifiedAt: now,
        author: 'CURRENT_USER'
      };
      this.fbService.saveContentData(obj).then(() => {
        this.submitted_films = false;
        this.myFilmForm.reset();
        this.spinner.hide();
        this.ngOnInit();
        this.scroller.scrollToAnchor('targetTop');
      }).catch(err => {
        this.submitted_films = false;
        this.spinner.hide();
      });
    } else {
      this.spinner.show();
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      const documentId = this.selectedDataSource._id;
      let obj = {
        contentType: this.flval.contentType.value,
        genre: this.flval.genre.value,
        shortdes: this.flval.shortdes.value,
        youtubeLink: this.flval.youtubeLink.value,
        posterImgUrl: this.downloadURL == '' ? this.selectedDataSource.posterImgUrl : this.downloadURL,
        createdAt: this.selectedDataSource.createdAt,
        modifiedAt: now,
        author: 'CURRENT_USER'
      };

      this.fbService.updateContentData(documentId, obj).then(() => {
        this.submitted_films = false;
        this.myFilmForm.reset();
        this.spinner.hide();
        this.ngOnInit();
        this.scroller.scrollToAnchor('targetTop');
      }).catch(err => {
        this.submitted_films = false;
        this.spinner.hide();
      });
      
    }
  }


  saveWorkDetails(url: any, img: any) {
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
    const filePath = `films/${n}_${img.name}`;
    const imgName = `${n}_${img.name}`;
    return new Promise((resolve, reject) => {
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(`films/${n}_${img.name}`, fileImg);
      task.snapshotChanges().pipe (
          finalize(() => {
            let dwUrl;
            dwUrl = fileRef.getDownloadURL();
            dwUrl.subscribe(async (url: any) => {
              if (url) {
                this.downloadURL = url;
                await this.saveWorkDetails(this.downloadURL,imgName);
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
      this.getAllFilmsImages();
    }
  }

  getAllFilmsImages() {
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

  sanitizeData(data: any) {
    let sanitizedData: any  = [];
    data.forEach((content: any) => {
      let obj = {
        _id: content._id,
        author: content.author,
        contentType: content.contentType,
        createdAt: content.createdAt,
        genre: content.genre,
        modifiedAt: content.modifiedAt,
        posterImgUrl: content.posterImgUrl,
        shortdes: content.shortdes,
        youtubeLink: content.youtubeLink
      };
      sanitizedData.push(obj);
    });
    return sanitizedData;
  }

  getAllContentData() {
    this.contentList = [];
    this.spinner.show();
    return new Promise((resolve, reject) => {
      this.fbService.getAllContentData().subscribe((data: any) => {
        if(data.length > 0) {
          this.contentList = this.sanitizeData(data);
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
    const imgUrl = content.posterImgUrl;

    this.fbService.removeContent(documentId).then(async() => {
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
    this.selectedDataSource = content;
    this.myFilmForm.patchValue({
      contentType: content.contentType,
      genre: content.genre,
      shortdes: content.shortdes,
      youtubeLink: content.youtubeLink
    });
    this.scroller.scrollToAnchor('targetEdit');
  }
  
}
