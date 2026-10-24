import { Component } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar";
import { HeaderComponent } from "../../components/header/header";

@Component({
  selector: 'app-settings',
  imports: [SidebarComponent, HeaderComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent {}
