import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonDatetime
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircle, cloudUpload, chevronDown, chevronBack } from 'ionicons/icons';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.page.html',
  styleUrls: ['./leave-request.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonBackButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonButton,
    IonDatetime
  ]
})
export class LeaveRequestPage {
  leaveType = 'annual';
  reason = '';

  constructor() {
    addIcons({ informationCircle, cloudUpload, chevronDown, chevronBack });
  }

  submitRequest() {
    console.log('Request submitted');
  }
}
