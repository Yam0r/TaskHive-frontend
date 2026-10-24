import { Component } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar";
import { HeaderComponent } from "../../components/header/header";

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent],
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class TeamComponent {

}
