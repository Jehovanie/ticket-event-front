import { Routes } from '@angular/router';
import { AboutComponent } from './page/about/about.component';
import { SigninComponent } from './page/auth/signin/signin.component';
import { SignupComponent } from './page/auth/signup/signup.component';
import { DetailsComponent } from './page/details/details.component';
import { ContactComponent } from './page/contact/contact.component';
import { LogoutComponent } from './page/auth/logout/logout.component';
import { SettingComponent } from './page/setting/setting.component';
import { EventComponent } from './page/dashboard/event/event.component';
import { DashboardComponent } from './page/dashboard/dashboard.component';
import { HomeComponent } from './page/dashboard/home/home.component';

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
