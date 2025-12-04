import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-loader',
  templateUrl: './button-loader.component.html',
  styleUrl: './button-loader.component.css',
  standalone: false
})
export class ButtonLoaderComponent {
  @Input() text: string = 'Submit';
  @Input() loading: boolean = false;
  @Input() color: string = '#061023'; // default color
  @Input() fullWidth: boolean = true;
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() textColor: string = 'white';
}