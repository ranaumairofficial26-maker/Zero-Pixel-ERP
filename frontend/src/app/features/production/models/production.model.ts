export interface ProductionJob {
  jobId: number;
  jobNumber: string;
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  productionType: 'IN_HOUSE' | 'OUTSOURCED';
  status: string;
  priority: 'Normal' | 'High' | 'Urgent' | string;
  dueDate?: string;
  targetStartDate?: string;
  operatorAssigned?: string;
  assignedOperator?: string;
  machineAssigned?: string;
  machineName?: string;
  vendorName?: string;
  vendorContact?: string;
  vendorPhone?: string;
  vendorCost?: number;
  outsourcedCost?: number;
  expectedDeliveryDate?: string;
  internalNotes?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  items: ProductionJobItem[];
}

export interface ProductionJobItem {
  jobItemId: number;
  jobId: number;
  orderItemId: number;
  productName: string;
  sizeDimensions?: string;
  material?: string;
  quantity: number;
  unit: string;
}

export interface UpdateProductionJobRequest {
  status: string;
  priority?: string;
  dueDate?: string;
  targetStartDate?: string;
  operatorAssigned?: string;
  assignedOperator?: string;
  machineAssigned?: string;
  machineName?: string;
  vendorName?: string;
  vendorContact?: string;
  vendorPhone?: string;
  vendorCost?: number;
  outsourcedCost?: number;
  expectedDeliveryDate?: string;
  internalNotes?: string;
  notes?: string;
}
