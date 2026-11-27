import { Component } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar";
import { HeaderComponent } from "../../components/header/header";
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [TranslocoPipe, SidebarComponent, HeaderComponent],
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class TeamComponent {

}
