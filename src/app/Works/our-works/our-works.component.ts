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
  myMusicVideoForm : any;
  myAudioStoryForm : any;
  myTrailerForm : any;
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
  selectedDataSource: any;
  contentList: any = [];
  isEdit: boolean = false;
  selectedContentType: string = '';
  isContentReleased: boolean = false;
  contentReleaseStatus: any = 'false';
  constructor(
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    private spinner : NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private fbService: FirebaseService,
    private scroller: ViewportScroller
  ) { }

  async ngOnInit()  {
    this.submitted = false;
    this.submitted_films = false;
    this.isOurWorkData = false;
    this.contentList = [];
    this.isEdit = false;
    this.downloadURL = '';
    this.selectedContentType = 'short_film';
    this.myForm = this.fb.group({
      description: ['',Validators.required],
    });
    this.myFilmForm = this.fb.group({
      genre: ['',Validators.required],
      shortdes: ['',Validators.required],
      youtubeLink: ['',Validators.required],
      release_status: ['',Validators.required]
    });

    this.myMusicVideoForm = this.fb.group({
      song: ['',Validators.required],
      singer: ['',Validators.required],
      link: ['',Validators.required],
      release_status: ['',Validators.required]
    });

    this.myAudioStoryForm = this.fb.group({
      story: ['',Validators.required],
      writer: ['',Validators.required],
      link: ['',Validators.required],
      release_status: ['',Validators.required]
    });

    this.myTrailerForm = this.fb.group({
      link: ['',Validators.required],
      release_status: ['',Validators.required]
    });

    this.spinner.show();
    try {
      await this.getAllFilmsImages();
    } catch(err: any) {
      console.log('film Image Err',err);
    }

    try {
      await this.getOurWorksData();
    } catch(err: any) {
      console.log('Our Work Err',err);
    }

    try {
      await this.getAllContentData();
    } catch (err: any) {
      console.log('All ContentData err',err);
    }
    
  }

  get fval(){return this.myForm.controls;}
  get flval(){return this.myFilmForm.controls;}
  get flval_musicvideo(){return this.myMusicVideoForm.controls;}
  get flval_audiostory(){return this.myAudioStoryForm.controls;}
  get flval_trailer(){return this.myTrailerForm.controls;}

  async onTypeClick(type: any) {
    this.selectedContentType = '';
    this.contentList = [];

    this.selectedContentType = type;
    try {
      await this.getAllContentData();
    } catch (err: any) {
      console.log('All ContentData err',err);
    }
    console.log('list',this.contentList);
  }

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

  submit_shortFilm(type: any) {
    if (this.myFilmForm.invalid) {
      return;
    }
    if(!this.isEdit) {
      this.spinner.show();
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let obj = {
        _id: '',
        contentType: type,
        genre: this.flval.genre.value,
        shortdes: this.flval.shortdes.value,
        youtubeLink: this.flval.youtubeLink.value,
        posterImgUrl: this.downloadURL,
        createdAt: now,
        modifiedAt: now,
        author: 'CURRENT_USER',
        singer: '',
        writer: '',
        song: '',
        story: '',
        isReleased: this.flval.release_status.value
      };
      this.fbService.saveContentData(obj).then(() => {
        this.submitted_films = false;
        this.myFilmForm.reset();
        this.spinner.hide();
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
        contentType: type,
        genre: this.flval.genre.value,
        shortdes: this.flval.shortdes.value,
        youtubeLink: this.flval.youtubeLink.value,
        posterImgUrl: this.downloadURL == '' ? this.selectedDataSource.posterImgUrl : this.downloadURL,
        createdAt: this.selectedDataSource.createdAt,
        modifiedAt: now,
        author: 'CURRENT_USER',
        singer: '',
        writer: '',
        song: '',
        story: '',
        isReleased: this.flval.release_status.value
      };

      this.fbService.updateContentData(documentId, obj).then(() => {
        this.submitted_films = false;
        this.myFilmForm.reset();
        this.spinner.hide();
        this.scroller.scrollToAnchor('targetTop');
      }).catch(err => {
        this.submitted_films = false;
        this.spinner.hide();
      });
      
    }
  }

  submit_musicVideo(type: any) {
    if (this.flval_musicvideo.invalid) {
      return;
    }
    if(!this.isEdit) {
      this.spinner.show();
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let obj = {
        _id: '',
        contentType: type,
        genre: '',
        shortdes: '',
        youtubeLink: this.flval_musicvideo.link.value,
        posterImgUrl: this.downloadURL,
        createdAt: now,
        modifiedAt: now,
        author: 'CURRENT_USER',
        singer: this.flval_musicvideo.singer.value,
        writer: '',
        song: this.flval_musicvideo.song.value,
        story: '',
        isReleased: this.flval_musicvideo.release_status.value
      };
      this.fbService.saveContentData(obj).then(() => {
        this.submitted_films = false;
        this.myMusicVideoForm.reset();
        this.spinner.hide();
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
        contentType: type,
        genre: '',
        shortdes: '',
        youtubeLink: this.flval_musicvideo.link.value,
        posterImgUrl: this.downloadURL == '' ? this.selectedDataSource.posterImgUrl : this.downloadURL,
        createdAt: this.selectedDataSource.createdAt,
        modifiedAt: now,
        author: 'CURRENT_USER',
        singer: this.flval_musicvideo.singer.value,
        writer: '',
        song: this.flval_musicvideo.singer.value,
        story: '',
        isReleased: this.flval_musicvideo.release_status.value
      };

      this.fbService.updateContentData(documentId, obj).then(() => {
        this.submitted_films = false;
        this.myMusicVideoForm.reset();
        this.spinner.hide();
        this.scroller.scrollToAnchor('targetTop');
      }).catch(err => {
        this.submitted_films = false;
        this.spinner.hide();
      });
      
    }
  }

  submit_audioStory(type: any) {
    if (this.flval_audiostory.invalid) {
      return;
    }
    if(!this.isEdit) {
      this.spinner.show();
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let obj = {
        _id: '',
        contentType: type,
        genre: '',
        shortdes: '',
        youtubeLink: this.flval_audiostory.link.value,
        posterImgUrl: this.downloadURL,
        createdAt: now,
        modifiedAt: now,
        author: 'CURRENT_USER',
        singer: '',
        writer: this.flval_audiostory.writer.value,
        song: '',
        story: this.flval_audiostory.story.value,
        isReleased: this.flval_audiostory.release_status.value,
      };
      this.fbService.saveContentData(obj).then(() => {
        this.submitted_films = false;
        this.myAudioStoryForm.reset();
        this.spinner.hide();
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
        contentType: type,
        genre: '',
        shortdes: '',
        youtubeLink: this.flval_audiostory.link.value,
        posterImgUrl: this.downloadURL == '' ? this.selectedDataSource.posterImgUrl : this.downloadURL,
        createdAt: this.selectedDataSource.createdAt,
        modifiedAt: now,
        author: 'CURRENT_USER',
        singer: '',
        writer: this.flval_audiostory.writer.value,
        song: '',
        story: this.flval_audiostory.story.value,
        isReleased: this.flval_audiostory.release_status.value,
      };

      this.fbService.updateContentData(documentId, obj).then(() => {
        this.submitted_films = false;
        this.myMusicVideoForm.reset();
        this.spinner.hide();
        this.scroller.scrollToAnchor('targetTop');
      }).catch(err => {
        this.submitted_films = false;
        this.spinner.hide();
      });
      
    }
  }

  submit_trailer(type: any) {
    if (this.flval_trailer.invalid) {
      return;
    }
    if(!this.isEdit) {
      this.spinner.show();
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let obj = {
        _id: '',
        contentType: type,
        genre: '',
        shortdes: '',
        youtubeLink: this.flval_trailer.link.value,
        posterImgUrl: this.downloadURL,
        createdAt: now,
        modifiedAt: now,
        author: 'CURRENT_USER',
        singer: '',
        writer: '',
        song: '',
        story: '',
        isReleased: this.flval_trailer.release_status.value
      };
      this.fbService.saveContentData(obj).then(() => {
        this.submitted_films = false;
        this.myTrailerForm.reset();
        this.spinner.hide();
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
        contentType: type,
        genre: '',
        shortdes: '',
        youtubeLink: this.flval_trailer.link.value,
        posterImgUrl: this.downloadURL == '' ? this.selectedDataSource.posterImgUrl : this.downloadURL,
        createdAt: this.selectedDataSource.createdAt,
        modifiedAt: now,
        author: 'CURRENT_USER',
        singer: '',
        writer: '',
        song: '',
        story: '',
        isReleased: this.flval_trailer.release_status.value
      };

      this.fbService.updateContentData(documentId, obj).then(() => {
        this.submitted_films = false;
        this.myTrailerForm.reset();
        this.spinner.hide();
        this.scroller.scrollToAnchor('targetTop');
      }).catch(err => {
        this.submitted_films = false;
        this.spinner.hide();
      });
      
    }
  }

  async onSubmit_content() {
    this.submitted_films = true;

    if(this.selectedContentType == 'short_film') {
     this.submit_shortFilm(this.selectedContentType);
    } 

    if(this.selectedContentType == 'music_video') {
      this.submit_musicVideo(this.selectedContentType);
    }

    if(this.selectedContentType == 'audio_story') {
      this.submit_audioStory(this.selectedContentType);
    }

    if(this.selectedContentType == 'trailer') {
      this.submit_trailer(this.selectedContentType);
    }

    try {
      await this.getAllContentData();
    } catch (err: any) {
      console.log('All ContentData err',err);
    }

    
  }


  saveWorkDetails(url: any, img: any) {
    return new Promise((resolve, reject) => {
      let now = moment().format('YYYY-MM-DDTHH:mm:ss');
      let obj = {
        _id: '',
        name: img,
        imgType: '',
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
      if(this.selectedContentType == 'short_film') {
        if(content.contentType == 'short_film') {
          let obj = {
            _id: content._id,
            author: content.author,
            contentType: content.contentType,
            createdAt: content.createdAt,
            genre: content.genre,
            modifiedAt: content.modifiedAt,
            posterImgUrl: content.posterImgUrl,
            shortdes: content.shortdes,
            youtubeLink: content.youtubeLink,
            isReleased: content.isReleased
          };
          sanitizedData.push(obj);
        }
      }

      if(this.selectedContentType == 'music_video') {
        if(content.contentType == 'music_video') {
          let obj = {
            _id: content._id,
            author: content.author,
            contentType: content.contentType,
            createdAt: content.createdAt,
            modifiedAt: content.modifiedAt,
            posterImgUrl: content.posterImgUrl,
            youtubeLink: content.youtubeLink,
            song: content.song,
            singer: content.singer,
            isReleased: content.isReleased
          };
          sanitizedData.push(obj);
        }
        
      }

      if(this.selectedContentType == 'audio_story') {
        if(content.contentType == 'audio_story') {
          let obj = {
            _id: content._id,
            author: content.author,
            contentType: content.contentType,
            createdAt: content.createdAt,
            modifiedAt: content.modifiedAt,
            posterImgUrl: content.posterImgUrl,
            youtubeLink: content.youtubeLink,
            story: content.story,
            writer: content.writer,
            isReleased: content.isReleased
          };
          sanitizedData.push(obj);
        }
      }

      if(this.selectedContentType == 'trailer') {
        if(content.contentType == 'trailer') {
          let obj = {
            _id: content._id,
            author: content.author,
            contentType: content.contentType,
            createdAt: content.createdAt,
            modifiedAt: content.modifiedAt,
            posterImgUrl: content.posterImgUrl,
            youtubeLink: content.youtubeLink,
            isReleased: content.isReleased
          };
          sanitizedData.push(obj);
        }
      }
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

    if(this.selectedContentType == 'short_film') {
      this.myFilmForm.patchValue({
        genre: content.genre,
        shortdes: content.shortdes,
        youtubeLink: content.youtubeLink,
        release_status: content.isReleased
      });
    }

    if(this.selectedContentType == 'music_video') {
      this.myMusicVideoForm.patchValue({
        link: content.youtubeLink,
        song: content.song,
        singer: content.singer,
        release_status: content.isReleased
      });
    }

    if(this.selectedContentType == 'audio_story') {
      this.myAudioStoryForm.patchValue({
        link: content.youtubeLink,
        story: content.story,
        writer: content.writer,
        release_status: content.isReleased
      });
    }

    if(this.selectedContentType == 'trailer') {
      this.myAudioStoryForm.patchValue({
        link: content.youtubeLink,
        release_status: content.isReleased
      });
    }
    
    this.scroller.scrollToAnchor('targetEdit');
  }

  OnToggle() {
    let flag;
    alert(!flag);
  }
  
}
