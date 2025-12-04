import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shimmer',
  templateUrl: './shimmer.component.html',
  styleUrl: './shimmer.component.css',
  standalone: false
})
export class ShimmerComponent {
  @Input() count: number = 1;              // how many shimmers to render
  @Input() width: string = '100%';         // default width
  @Input() height: string = '20px';        // default height
  @Input() borderRadius: string = '4px';  // default radius
}
