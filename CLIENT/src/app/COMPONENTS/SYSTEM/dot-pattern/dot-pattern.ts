import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dot-pattern',
  standalone: false,
  templateUrl: './dot-pattern.html',
  styleUrl: './dot-pattern.css',
})
export class DotPattern {

  @Input() h = [1,1,1,1,1,1,1,1];
  @Input() v = [1,1,1,1,1,1,1,1,1];

}
