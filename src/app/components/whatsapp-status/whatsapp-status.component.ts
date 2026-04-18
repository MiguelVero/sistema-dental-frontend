import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsAppService } from '../../services/whatsapp.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-whatsapp-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-status.component.html',
  styleUrls: ['./whatsapp-status.component.css']
})
export class WhatsAppStatusComponent implements OnInit, OnDestroy {
  conectado: boolean = false;
  private statusSubscription: Subscription | null = null;

  constructor(private whatsappService: WhatsAppService) {}

  ngOnInit() {
    this.actualizarStatus();
    
    // Actualizar estado cada 30 segundos
    this.statusSubscription = interval(30000).subscribe(() => {
      this.actualizarStatus();
    });
  }

  actualizarStatus() {
    this.whatsappService.getStatus().subscribe({
      next: (status) => {
        this.conectado = status.conectado;
        console.log('📱 Estado WhatsApp:', status);
      },
      error: (err) => {
        console.error('Error obteniendo estado WhatsApp:', err);
        this.conectado = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }
}