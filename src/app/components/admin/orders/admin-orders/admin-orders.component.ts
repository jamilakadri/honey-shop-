// src/app/components/admin/orders/admin-orders.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../services/order.service';
import { Order, OrderItem } from '../../../../models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  
  // Modal state
  showDetailsModal = false;
  selectedOrder: Order | null = null;
  
  // Filter state
  selectedStatus = '';
  searchQuery = '';
  
  // UI state
  loading = true;
  successMessage = '';
  errorMessage = '';

  statuses = [
    { value: 'Pending', label: 'En Attente', color: '#856404' },
    { value: 'Processing', label: 'En Cours', color: '#084298' },
    { value: 'Shipped', label: 'Expédiée', color: '#0f5132' },
    { value: 'Delivered', label: 'Livrée', color: '#0a3622' },
    { value: 'Cancelled', label: 'Annulée', color: '#842029' }
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Erreur lors du chargement des commandes';
        this.loading = false;
      }
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = !this.selectedStatus || order.orderStatus === this.selectedStatus;
      const matchesSearch = 
        order.orderId.toString().includes(this.searchQuery) ||
        order.orderNumber.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  openDetailsModal(order: Order): void {
    this.selectedOrder = order;
    
    // Charger les détails complets de la commande
    this.orderService.getOrderById(order.orderId).subscribe({
      next: (data) => {
        this.selectedOrder = data;
        this.showDetailsModal = true;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.errorMessage = 'Erreur lors du chargement des détails';
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedOrder = null;
  }

  updateOrderStatus(orderId: number, newStatus: string): void {
    this.clearMessages();

    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.successMessage = `Statut mis à jour : ${this.getStatusLabel(newStatus)}`;
        this.loadOrders();
        
        // Mettre à jour le modal si ouvert
        if (this.selectedOrder && this.selectedOrder.orderId === orderId) {
          this.selectedOrder.orderStatus = newStatus;
        }
        
        this.autoHideMessage();
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du statut';
      }
    });
  }

  getStatusLabel(status: string): string {
    const statusObj = this.statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} TND`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  autoHideMessage(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 3000);
  }

  getTotalItems(order: Order): number {
    if (!order.orderItems) return 0;
    return order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  }
}