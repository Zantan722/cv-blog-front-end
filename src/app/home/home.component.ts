import { AuthService } from './../service/auth.service';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BaseComponent } from './base/base.component';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent extends BaseComponent {
  constructor() {
    super();
  }

}