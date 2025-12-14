// src/app/components/admin/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
}

interface RecentOrder {
  orderId: number;
  customerName: string;
  totalAmount: number;
  status: string;
  orderDate: string;
}

interface TopProduct {
  productId: number;
  productName: string;
  totalSold: number;
  revenue: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0
  };

  recentOrders: RecentOrder[] = [];
  topProducts: TopProduct[] = [];
  loading = true;
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';

    // Charger les statistiques
    this.adminService.getStats().subscribe({
      next: (data: any) => {  // ✅ Added type
        // Ensure data is properly assigned
        if (data && typeof data === 'object') {
          this.stats = {
            totalOrders: data.totalOrders || 0,
            totalRevenue: data.totalRevenue || 0,
            totalCustomers: data.totalCustomers || 0,
            totalProducts: data.totalProducts || 0
          };
        }
      },
      error: (error: any) => {  // ✅ Added type
        console.error('Error loading stats:', error);
        this.errorMessage = 'Erreur lors du chargement des statistiques';
        this.loading = false;
      }
    });

    // Charger les commandes récentes
    this.adminService.getRecentOrders().subscribe({
      next: (data: any) => {  // ✅ Added type
        // Check if data is an array or needs conversion
        if (Array.isArray(data)) {
          this.recentOrders = data;
        } else if (data && typeof data === 'object') {
          // Convert object to array if needed
          this.recentOrders = Object.values(data);
        } else {
          this.recentOrders = [];
        }
      },
      error: (error: any) => {  // ✅ Added type
        console.error('Error loading recent orders:', error);
      }
    });

    // Charger les produits top
    this.adminService.getTopProducts().subscribe({
      next: (data: any) => {  // ✅ Added type
        // Check if data is an array or needs conversion
        if (Array.isArray(data)) {
          this.topProducts = data;
        } else if (data && typeof data === 'object') {
          // Convert object to array if needed
          this.topProducts = Object.values(data);
        } else {
          this.topProducts = [];
        }
        this.loading = false;
      },
      error: (error: any) => {  // ✅ Added type
        console.error('Error loading top products:', error);
        this.loading = false;
      }
    });
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
    // Add null/undefined check
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0.00 TND';
    }
    return `${amount.toFixed(2)} TND`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}