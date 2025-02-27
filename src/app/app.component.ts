import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FooterComponent } from './shared/footer/footer.component';
import { TopBarComponent } from './shared/top-bar/top-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FontAwesomeModule,FooterComponent,TopBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ram-ager';

  constructor(library: FaIconLibrary){
    library.addIconPacks(fas, far, fab);
  }
}
