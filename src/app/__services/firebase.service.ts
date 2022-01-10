import { Injectable } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { AchievementMaster,AboutUsMaster } from "../model/achievement";
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
