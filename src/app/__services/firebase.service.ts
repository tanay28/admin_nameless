import { Injectable } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { AchievementMaster, AboutUsMaster, OurWorkMaster, ContentMaster, GalleryMaster, TeamMaster } from "../model/admin";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private db : AngularFirestore) { }

  //---------- Achievement function --------------//
  saveAchievementData(data : AchievementMaster) : Promise<any>{
    const id = this.db.createId();
    data._id = id;
    return this.db.collection<AchievementMaster>("achievementMaster").doc(id).set(data);
  }

  getAllAchievementData() : Observable<AchievementMaster[]>{
    return this.db.collection<AchievementMaster>('achievementMaster').valueChanges();
  }

  getSingleAchievementData(id: any) : Observable<AchievementMaster[]>{
    return this.db.collection<AchievementMaster>('achievementMaster',ref => ref.where('_id' ,'==', id)).valueChanges();
  }

  queryAchievementDb(fieldName: any, searchKey: any) {
    return this.db.collection<AchievementMaster>('achievementMaster',ref => ref.where(fieldName ,'==', searchKey)).valueChanges();
  }

  removeAchievements(documentId: any): Promise<any> {
    return this.db.collection('achievementMaster').doc(documentId).delete();
  }
  //------------------ END ------------------------//

  //------------- About Us Function --------------//
  saveAboutUsData(data : AboutUsMaster) : Promise<any>{
    const id = this.db.createId();
    data._id = id;
    return this.db.collection<AboutUsMaster>("aboutUsMaster").doc(id).set(data);
  }

  getAllAboutUsData() : Observable<AboutUsMaster[]>{
    return this.db.collection<AboutUsMaster>('aboutUsMaster').valueChanges();
  }

  getSingleAboutUsData(id: any) : Observable<AboutUsMaster[]>{
    return this.db.collection<AboutUsMaster>('aboutUsMaster',ref => ref.where('_id' ,'==', id)).valueChanges();
  }

  updateAboutUsData(documentId: any, data: any): Promise<any> {
    data._id = documentId;  
    return this.db.collection('aboutUsMaster').doc(documentId).set(data);
  }
  //------------------- END ---------------------//

  //------------- Our Work Function --------------//
  saveOurWorkData(data : OurWorkMaster) : Promise<any>{
    const id = this.db.createId();
    data._id = id;
    return this.db.collection<OurWorkMaster>("ourWorkMaster").doc(id).set(data);
  }

  updateOurWorkData(documentId: any, data: any): Promise<any> {
    data._id = documentId;  
    return this.db.collection('ourWorkMaster').doc(documentId).set(data);
  }

  getAllOurWorkData() : Observable<OurWorkMaster[]>{
    return this.db.collection<OurWorkMaster>('ourWorkMaster').valueChanges();
  }

  getSingleOurWorkData(id: any) : Observable<OurWorkMaster[]>{
    return this.db.collection<OurWorkMaster>('ourWorkMaster',ref => ref.where('_id' ,'==', id)).valueChanges();
  }
  //------------------ END ----------------------//

  //------------- Content Function --------------//
  saveContentData(data : ContentMaster) : Promise<any>{
    const id = this.db.createId();
    data._id = id;
    return this.db.collection<ContentMaster>("contentMaster").doc(id).set(data);
  }

  updateContentData(documentId: any, data: any): Promise<any> {
    data._id = documentId;  
    return this.db.collection('contentMaster').doc(documentId).set(data);
  }

  getAllContentData() : Observable<ContentMaster[]>{
    return this.db.collection<ContentMaster>('contentMaster').valueChanges();
  }

  getSingleContentData(id: any) : Observable<ContentMaster[]>{
    return this.db.collection<ContentMaster>('contentMaster',ref => ref.where('_id' ,'==', id)).valueChanges();
  }
  removeContent(documentId: any): Promise<any> {
    return this.db.collection('contentMaster').doc(documentId).delete();
  }
  //------------------ END ----------------------//

   //---------- Gallery function --------------//
  saveGalleryData(data : GalleryMaster) : Promise<any>{
    const id = this.db.createId();
    data._id = id;
    return this.db.collection<GalleryMaster>("galleryMaster").doc(id).set(data);
  }

  getAllGalleryData() : Observable<GalleryMaster[]>{
    return this.db.collection<GalleryMaster>('galleryMaster').valueChanges();
  }

  getSingleGalleryData(id: any) : Observable<GalleryMaster[]>{
    return this.db.collection<GalleryMaster>('galleryMaster',ref => ref.where('_id' ,'==', id)).valueChanges();
  }

  queryGalleryDb(fieldName: any, searchKey: any) {
    return this.db.collection<GalleryMaster>('galleryMaster',ref => ref.where(fieldName ,'==', searchKey)).valueChanges();
  }

  removeGalleryImage(documentId: any): Promise<any> {
    return this.db.collection('galleryMaster').doc(documentId).delete();
  }
  //------------------ END ------------------------//

  //------------- Team Function --------------//
  saveTeamData(data : TeamMaster) : Promise<any>{
    const id = this.db.createId();
    data._id = id;
    return this.db.collection<TeamMaster>("teamMaster").doc(id).set(data);
  }

  updateTeamData(documentId: any, data: any): Promise<any> {
    data._id = documentId;  
    return this.db.collection('teamMaster').doc(documentId).set(data);
  }

  getAllTeamData() : Observable<TeamMaster[]>{
    return this.db.collection<TeamMaster>('teamMaster').valueChanges();
  }

  getSingleTeamData(id: any) : Observable<TeamMaster[]>{
    return this.db.collection<TeamMaster>('teamMaster',ref => ref.where('_id' ,'==', id)).valueChanges();
  }
  removeTeamMate(documentId: any): Promise<any> {
    return this.db.collection('teamMaster').doc(documentId).delete();
  }
  //------------------ END ----------------------//


  //------- Generic Function ---------//
  async deleteCollection(collectionName: any): Promise<any>{
    return new Promise(async (resolve, reject) => {
      const qry: firebase.firestore.QuerySnapshot = await this.db.collection(collectionName).ref.get();
      qry.forEach(doc => {
        doc.ref.delete();
        resolve('deleted');
      });
    })
    
    
  }



  //----------- Tenant functions ------------//
  // savetenantInfo(data: any){
  //   const id = this.db.createId();
  //   data._id = id;
  //   return this.db.collection<any>("tenantData").doc(id).set(data);
  // }

  // getAllTenantData(tenant) : Observable<any>{
  //   return this.db.collection<any>('tenantData',ref => ref.where('tenant' ,'==', tenant)).valueChanges();
  // }

  // getSingleTenantData(id,tenant) : Observable<any>{
  //   return this.db.collection<any>('tenantData',ref => ref.where('_id' ,'==', id)).valueChanges();
  // }
  // updateTenant(documentId, data): Promise<any> {
  //   data._id = documentId;  
  //   return this.db.collection('tenantData').doc(documentId).set(data);
  // }
  
  // deleteTenant(documentId): Promise<any>{
    
  //   return this.db.collection('tenantData').doc(documentId).delete();


  //   //------ Delete collection from firebase ---------//
  //   // const qry: firebase.firestore.QuerySnapshot = await this.db.collection("tenantData").ref.get();

  //   // qry.forEach(doc => {
  //   //   doc.ref.delete();
  //   // });
    
  // }


  //----------------- END ------------------//
}
