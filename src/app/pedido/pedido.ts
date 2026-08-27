import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CarritoService } from '../core/services/carrito.service';
import { CartItem } from '../core/models/cart-item.model';

interface DatosCliente {
  nombre: string;
  celular: string;
  direccion: string;
}

@Component({
  selector: 'app-pedido',
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './pedido.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pedido.css',
})
export class Pedido {
  carritoService = inject(CarritoService);

  cliente: DatosCliente = { nombre: '', celular: '', direccion: '' };
  pedidoConfirmado = signal(false);
  errorFormulario = signal<string | null>(null);
  numeroPedido = signal<string>('');

  incrementar(item: CartItem) {
    this.carritoService.actualizarCantidad(item.id, item.tipo, item.cantidad + 1);
  }

  decrementar(item: CartItem) {
    this.carritoService.actualizarCantidad(item.id, item.tipo, item.cantidad - 1);
  }

  quitar(item: CartItem) {
    this.carritoService.quitar(item.id, item.tipo);
  }

  private formularioValido(): boolean {
    if (this.carritoService.items().length === 0) {
      this.errorFormulario.set('Tu pedido está vacío. Agrega comidas o bebidas antes de continuar.');
      return false;
    }
    if (!this.cliente.nombre.trim() || !this.cliente.celular.trim() || !this.cliente.direccion.trim()) {
      this.errorFormulario.set('Completa nombre, celular y dirección para realizar el pedido.');
      return false;
    }
    this.errorFormulario.set(null);
    return true;
  }

  async realizarPedido() {
    if (!this.formularioValido()) {
      return;
    }

    this.numeroPedido.set(this.generarNumeroPedido());
    await this.generarPdf();
    this.pedidoConfirmado.set(true);
  }

  nuevoPedido() {
    this.carritoService.vaciar();
    this.cliente = { nombre: '', celular: '', direccion: '' };
    this.pedidoConfirmado.set(false);
    this.errorFormulario.set(null);
  }

  private generarNumeroPedido(): string {
    return `MNL-${Date.now().toString().slice(-6)}`;
  }

  private async generarPdf() {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const items = this.carritoService.items();
    const total = this.carritoService.totalPagar();
    const fecha = new Date().toLocaleString('es-CO', {
      dateStyle: 'long',
      timeStyle: 'short',
    });

    const marginX = 48;
    let y = 56;

    // Encabezado con "logo" (texto de marca, ya que jsPDF no necesita imagen para el logo)
    doc.setFillColor(20, 23, 26); // nordic-dark: mismo tono del header/footer del sitio
    doc.rect(0, 0, 595, 90, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('MANILA', marginX, 48);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Restaurante · Sabores que cuentan historias', marginX, 68);

    y = 120;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Formato de pedido', marginX, y);

    y += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`N.º de pedido: ${this.numeroPedido()}`, marginX, y);
    y += 14;
    doc.text(`Fecha: ${fecha}`, marginX, y);

    y += 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Datos del cliente', marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y += 16;
    doc.text(`Nombre: ${this.cliente.nombre}`, marginX, y);
    y += 14;
    doc.text(`Celular: ${this.cliente.celular}`, marginX, y);
    y += 14;
    doc.text(`Dirección: ${this.cliente.direccion}`, marginX, y);

    y += 26;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Detalle del pedido', marginX, y);

    y += 12;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, 547, y);
    y += 16;

    doc.setFontSize(10);
    doc.text('Ítem', marginX, y);
    doc.text('Cant.', 340, y);
    doc.text('Precio unit.', 400, y);
    doc.text('Subtotal', 490, y);
    y += 8;
    doc.line(marginX, y, 547, y);
    y += 16;

    doc.setFont('helvetica', 'normal');
    for (const item of items) {
      if (y > 760) {
        doc.addPage();
        y = 56;
      }
      const subtotal = item.cantidad * item.precioUnitario;
      const tipoTexto = item.tipo === 'comida' ? '(Comida)' : '(Bebida)';
      doc.text(`${item.nombre} ${tipoTexto}`, marginX, y, { maxWidth: 270 });
      doc.text(String(item.cantidad), 340, y);
      doc.text(`$${item.precioUnitario.toLocaleString('es-CO')}`, 400, y);
      doc.text(`$${subtotal.toLocaleString('es-CO')}`, 490, y);
      y += 20;
    }

    y += 6;
    doc.line(marginX, y, 547, y);
    y += 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(168, 81, 66); // nordic-brick: acento de marca
    doc.text('Total a pagar:', 400, y);
    doc.text(`$${total.toLocaleString('es-CO')}`, 490, y);
    doc.setTextColor(30, 30, 30);

    y += 40;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Gracias por tu pedido en MANILA. Este documento es tu comprobante.', marginX, y);

    doc.save(`pedido-${this.numeroPedido()}.pdf`);
  }
}
