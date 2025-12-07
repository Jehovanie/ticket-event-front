import { Routes } from '@angular/router';
import { AboutComponent } from './page/about/about.component';
import { SigninComponent } from './page/auth/signin/signin.component';
import { SignupComponent } from './page/auth/signup/signup.component';
import { DetailsComponent } from './page/details/details.component';
import { ContactComponent } from './page/contact/contact.component';
import { LogoutComponent } from './page/auth/logout/logout.component';
import { SettingComponent } from './page/setting/setting.component';
import { DashboardComponent } from './page/dashboard/dashboard.component';
import { EventComponent } from './page/event/event.component';
import { EventsComponent } from './page/events/events.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      { path: 'events', component: EventsComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'events/:eventID', component: EventComponent },
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
