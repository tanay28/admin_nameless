import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './About/about/about.component';
import { ContactUsComponent } from './Contact/contact-us/contact-us.component';

import { GalleryComponent } from './Gallery/gallery/gallery.component';
import { HomeComponent } from './Home/home/home.component';
import { LoginComponent } from './login/login.component';
import { OurTeamComponent } from './Team/our-team/our-team.component';
import { OurWorksComponent } from './Works/our-works/our-works.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'works', component: OurWorksComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'team', component: OurTeamComponent },
  { path: 'contact', component: ContactUsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
