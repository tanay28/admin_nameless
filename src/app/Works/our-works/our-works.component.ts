import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { map, finalize } from "rxjs/operators";
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { FirebaseService } from '../../__services/firebase.service';
import {MatTableDataSource} from '@angular/material/table';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

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
  basePath = '/films';
  imageList: any = [];
  isAboutUsData: boolean = false;
  position: any;
  aboutusDataGiven: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  contentTYpe: any;
  dataSource: any;
  displayedColumns: any;
  constructor(
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    private spinner : NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private fbService: FirebaseService
  ) { }

  async ngOnInit()  {
    this.contentTYpe = [
      { id: 'music_video', value: 'Music Video' },
      { id: 'short_film', value: 'Short Film' },
      { id: 'audio_story', value: 'Audio Story' },
      { id: 'trailer', value: 'Trailer' },
      { id: 'upcoming', value: 'Upcoming' },
    ];

     // Mat Table
    this.displayedColumns = ['position', 'name', 'weight', 'symbol'];
    this.dataSource = new MatTableDataSource(ELEMENT_DATA);

    this.submitted = false;
    this.isAboutUsData = false;
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
    await this.getAllFilmsImages();
    await this.getOurWorksData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  get fval(){return this.myForm.controls;}
  get flval(){return this.myFilmForm.controls;}

  getOurWorksData() {
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
        createdAt: this.aboutusDataGiven.createdAt,
        modifiedAt: now,
        author: 'CURRENT_USER'
      };
      this.fbService.updateAboutUsData(this.aboutusDataGiven._id,aboutUsObj).then(async () => {
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
    const fieldName = 'imgUrl';
    const removePromise = new Promise((resolve, reject) => {
      this.fbService.queryAchievementDb(fieldName, img.path).subscribe((data: any) => {
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
    this.getAllFilmsImages();
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
