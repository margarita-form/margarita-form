import { Route } from '@angular/router';
import { ReadmeExampleComponent } from './readme-example/readme-example.component';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: ReadmeExampleComponent,
  },
];
