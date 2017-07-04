import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ModalComponent } from './modal/modal.component';

const AppRoutes: Routes = [
	{ path: '', component: DashboardComponent },
];
export const appRoutingProviders: any[] = [];
export const AppRoutingModule = RouterModule.forRoot(AppRoutes, { useHash: true });
