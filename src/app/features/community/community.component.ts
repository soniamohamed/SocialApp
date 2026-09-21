import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-community',
  imports: [TranslatePipe],
  templateUrl: './community.component.html',
  styleUrl: './community.component.css',
})
export class CommunityComponent {}
