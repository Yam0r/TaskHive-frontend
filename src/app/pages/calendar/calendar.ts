import { ChangeDetectorRef, Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { HeaderComponent } from '../../components/header/header';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FullCalendarModule, CalendarOptions } from '@fullcalendar/angular';
import themePlugin from '@fullcalendar/angular/themes/monarch';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import dayGridPlugin from '@fullcalendar/angular/daygrid';

export interface CalendarEvent {
  day: number;
  time: string;
  duration: number;
  title: string;
  color: string;
}

@Component({
  selector: 'app-calendar',
  imports: [SidebarComponent, HeaderComponent, DatePipe, FormsModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarComponent {
  currentDate = new Date();
  constructor(private cdr: ChangeDetectorRef) {}

  calendarOptions: CalendarOptions = {
    plugins: [themePlugin, timeGridPlugin, interactionPlugin, dayGridPlugin],
    initialView: 'dayGridMonth',
    slotDuration: '00:15:00',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    allDaySlot: true,
    height: 'auto',
    selectable: true,
    editable: true,
    select: (info) => this.handleTimeSelect(info),
    dateClick: (info) => this.handleDateClick(info),
    eventClick: (info) => this.handleEventClick(info),

    events: [
      {
        title: 'Разработать макет главной',
        start: new Date().setHours(10, 0, 0, 0),
        end: new Date().setHours(11, 30, 0, 0),
        backgroundColor: '#ff4757',
        borderColor: 'transparent',
      },
    ],
  };

  selectedDay: number = 1;
  activeTimeSlot: string | null = null;
  timeSlots: string[] = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  events: CalendarEvent[] = [];

  readonly PIXELS_PER_MINUTE = 1;
  selectedDuration: number = 60;
  newEventTitle: string = '';
  newEventDescription: string = '';
  selectedColor: string = 'purple';
  availableColors: string[] = ['purple', 'blue', 'green', 'yellow', 'red'];
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedEventApi: any = null;
  selectedStartStr: string = '';
  selectedEndStr: string = '';

  private openModalForm() {
    this.newEventTitle = '';
    this.newEventDescription = '';
    this.selectedColor = 'purple';
    this.isModalOpen = true;
    this.cdr.detectChanges();
    this.isEditMode = false;
    this.selectedEventApi = null;
  }

  handleEventClick(info: any) {
    this.isEditMode = true;
    this.selectedEventApi = info.event;
    this.newEventTitle = info.event.title;
    this.selectedColor = info.event.extendedProps?.colorName || 'purple';
    this.newEventDescription = info.event.extendedProps?.description || '';

    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  updateEvent() {
    if (!this.newEventTitle.trim() || !this.selectedEventApi) return;

    this.selectedEventApi.setProp('title', this.newEventTitle);
    this.selectedEventApi.setProp('backgroundColor', this.getColorHex(this.selectedColor));
    this.selectedEventApi.setExtendedProp('colorName', this.selectedColor);
    this.selectedEventApi.setExtendedProp('description', this.newEventDescription);

    this.closeModal();
  }

  handleDateClick(info: any) {
    this.selectedStartStr = info.dateStr;
    this.selectedEndStr = info.dateStr;
    this.openModalForm();
  }

  openEmptyModal() {
    const today = new Date();
    this.selectedStartStr = today.toISOString().split('T')[0]; // Сегодняшняя дата
    this.selectedEndStr = this.selectedStartStr;
    this.openModalForm();
  }

  handleTimeSelect(info: any) {
    this.selectedStartStr = info.startStr;
    this.selectedEndStr = info.endStr;
    this.openModalForm();
    

    this.newEventTitle = '';
    this.selectedColor = 'purple';
    this.isModalOpen = true;
    info.view.calendar.unselect();
  }

  closeModal() {
    this.isModalOpen = false;
  }

  selectDay(day: number) {
    this.selectedDay = day;
    this.activeTimeSlot = null;
  }

  openEventForm(time: string): void {
    this.activeTimeSlot = time;
    this.selectedColor = 'purple';
    this.newEventTitle = '';
    this.selectedDuration = 60;
  }

  closeEventForm(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.activeTimeSlot = null;
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  addEvent() {
    if (!this.newEventTitle.trim()) {
      return;
    }

    const newEvent = {
      title: this.newEventTitle,
      start: this.selectedStartStr,
      end: this.selectedEndStr,
      backgroundColor: this.getColorHex(this.selectedColor),
      borderColor: 'transparent',
      extendedProps: { 
        colorName: this.selectedColor,
        description: this.newEventDescription,
      
      },
    };

    const currentEvents = (this.calendarOptions.events as any[]) || [];
    this.calendarOptions.events = [...currentEvents, newEvent];

    this.closeModal();
  }

  getColorHex(colorName: string): string {
    const colors: Record<string, string> = {
      purple: '#8e54e9',
      blue: '#00B8D9',
      green: '#22c55e',
      yellow: '#ffab00',
      red: '#ff4757',
    };
    return colors[colorName] || '#8e54e9';
  }

  deleteEvent(): void {
    if (this.selectedEventApi) {
      if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        this.selectedEventApi.remove();
        this.closeModal();
      }
    }
  }

  getEventTopPosition(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    const startHour = 8;
    const totalMinutes = (hours - startHour) * 60 + minutes;
    return totalMinutes * this.PIXELS_PER_MINUTE;
  }

  getEventHeight(durationInMinutes: number): number {
    return durationInMinutes * this.PIXELS_PER_MINUTE;
  }

  getEventsForDay(day: number): CalendarEvent[] {
    return this.events.filter((e) => e.day === day);
  }

  getEventsForTime(day: number, time: string): CalendarEvent[] {
    return this.events.filter((e) => e.day === day && e.time === time);
  }
}
