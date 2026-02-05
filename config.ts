// Stock Condition Configuration
// These thresholds define the stock status based on current quantity vs minimum stock

export const STOCK_CONDITION_CONFIG = {
    // bahaya: qty < minStock
    // low: qty >= minStock && qty < minStock * LOW_THRESHOLD_MULTIPLIER
    // cukup: qty >= minStock * LOW_THRESHOLD_MULTIPLIER && qty < minStock * CUKUP_THRESHOLD_MULTIPLIER
    // banyak: qty >= minStock * CUKUP_THRESHOLD_MULTIPLIER
    LOW_THRESHOLD_MULTIPLIER: 1.2,    // 20% above minStock
    CUKUP_THRESHOLD_MULTIPLIER: 2.0,  // 2x minStock
};

// Mock data for stock report
export const STOCK_REPORT_INFO = {
    staffName: "Budi Santoso",
    lastUpdated: "04/02/2026 09:10:20",
};
