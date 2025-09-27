export interface User {
    id: number;
    pin: string;
    user_id: string;
    name: string;
    role: number;
    active: boolean;
    created_at?: Date;
    updated_at?: Date;
}
export interface Product {
    id: number;
    sku: string;
    name: string;
    price_cents: number;
    stock_qty: number;
    tax_rate: number;
    active: boolean;
    created_at?: Date;
    updated_at?: Date;
}
export interface Register {
    id: number;
    register_number: number;
    name: string;
    location: string;
    created_at?: Date;
}
export interface Sale {
    id: number;
    receipt_number: string;
    register_id: number;
    tse_signature?: string;
    start_at?: Date;
    end_at?: Date;
    user_id: number;
    total_cents: number;
    items?: SaleItem[] | any;
    payment_method: string;
}
export interface SaleItem {
    id: number;
    receipt_number: string;
    product_id: number;
    qty: number;
    unit_price_cents: number;
    tax_rate: number;
    stock_adjusted: boolean;
}
export interface Cancellation {
    id: number;
    receipt_number: string;
    register_id: number;
    tse_signature?: string;
    canceled_at?: Date;
    user_id: number;
    reason: string;
    amount_cents: number;
    payment_method: string;
    stock_adjusted: boolean;
}
export interface StockIn {
    id: number;
    product_id: number;
    added_qty: number;
    received_at?: Date;
    supplier: string;
    user_id: number;
    stock_adjusted: boolean;
}
export interface Turnover {
    id: number;
    register_id: number;
    date: Date;
    total_sales_cents: number;
    total_refunds_cents: number;
    net_turnover_cents: number;
    created_at?: Date;
}
export interface TseDevice {
    id: number;
    serial_number: string;
    vendor: string;
    cert_start?: Date;
    cert_end?: Date;
    created_at?: Date;
}
export interface RegisterReporting {
    id: number;
    tse_id: number;
    register_id: number;
    report_type: string;
    reported_at?: Date;
    status: string;
}
export interface DsfinvKExport {
    id: number;
    period_start: Date;
    period_end: Date;
    created_at?: Date;
    file_path: string;
}
export interface AuditLog {
    id: number;
    table_name: string;
    record_id: number;
    action: string;
    user_id: number;
    timestamp?: Date;
    old_value?: any;
    new_value?: any;
}
export interface InventoryMovement {
    id: number;
    product_id: number;
    user_id: number;
    created_at?: Date;
    change_qty: number;
    resulting_qty: number;
    movement_type: string;
    reference_table: string;
    reference_id: number;
    note?: string;
}
export interface DailySalesSummary {
    id: number;
    date: Date;
    total_sales_euro: number;
    created_at?: Date;
}
//# sourceMappingURL=models.d.ts.map