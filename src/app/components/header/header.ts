import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent implements OnInit{
  @Input() title: string = 'Dashboard';

  formattedDate: string = '';

  
  ngOnInit() {
    this.setFormattedDate();
  }

  private setFormattedDate(){
    const date = new Date();
    const userLocale = navigator.language;

    const options: Intl.DateTimeFormatOptions = {
      weekday:'long',
      day:'numeric',
      month: 'long',
      year: 'numeric',
    };

    let dateStr = new Intl.DateTimeFormat('en-US', options).format(date);
    dateStr = dateStr.replace(/\s*г\.$/, '');
    this.formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    
  }
}
