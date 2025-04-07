import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DetailsComponent } from './details/details.component';
import { ContactComponent } from './contact/contact.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { SettingComponent } from './setting/setting.component';
import { EventComponent } from './dashboard/event/event.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './dashboard/home/home.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
          { path: '', component: HomeComponent },
          { path: 'event', component: EventComponent },
        ],
      },
      { path: 'contact', component: ContactComponent },
      { path: 'detail/:id', component: DetailsComponent },
      { path: 'about', component: AboutComponent },
      { path: 'setting', component: SettingComponent },
    ],
  },
  {
    path: 'auth',
    children: [
      { path: 'signin', component: SigninComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'logout', component: LogoutComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
