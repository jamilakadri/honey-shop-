import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderItem } from '../../../models/order.model';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-order-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})

export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  errorMessage = '';
  selectedOrder: Order | null = null;
  isAdmin = false;

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin;
    this.loadOrders();
  }
  
  goToHome() {
    this.router.navigate(['/']);
  }

  loadOrders() {
    this.loading = true;
    this.errorMessage = '';

    // Use appropriate service method based on user role
    const orderObservable = this.isAdmin 
      ? this.orderService.getAllOrders() 
      : this.orderService.getMyOrders();

    orderObservable.subscribe({
      next: (orders) => {
        this.orders = orders || [];
        this.loading = false;
        console.log('Orders loaded:', this.orders);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load orders';
        this.loading = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
  }

  closeOrderDetails() {
    this.selectedOrder = null;
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered' || statusLower === 'completed') return 'status-delivered';
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'processing' || statusLower === 'shipped' || statusLower === 'shipping') return 'status-processing';
    if (statusLower === 'cancelled' || statusLower === 'canceled') return 'status-cancelled';
    return 'status-pending';
  }

  getPaymentStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'paid' || statusLower === 'completed') return 'payment-paid';
    if (statusLower === 'pending') return 'payment-pending';
    if (statusLower === 'failed') return 'payment-failed';
    return 'payment-pending';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  cancelOrder(orderId: number) {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.loadOrders();
        this.closeOrderDetails();
        alert('Order cancelled successfully');
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order');
      }
    });
  }

  // Admin only: Update order status
  updateOrderStatus(orderId: number, newStatus: string) {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.loadOrders();
        if (this.selectedOrder && this.selectedOrder.orderId === orderId) {
          this.selectedOrder.orderStatus = newStatus;
        }
        alert('Order status updated successfully');
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        alert('Failed to update order status');
      }
    });
  }
  getCurrentUser() {
    const user = this.authService.currentUserValue;
    console.log('getCurrentUser called:', user);
    return user;
  }

  getUserInitials(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    
    const firstInitial = user.firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0).toUpperCase() || '';
    
    return `${firstInitial}${lastInitial}`;
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }

}
