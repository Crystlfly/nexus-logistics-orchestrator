CREATE TABLE warehouse_activities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    warehouse_id INT, -- Foreign key linking to your warehouses table
    activity_type VARCHAR(50), -- e.g., 'Inbound Receipt', 'Outbound Shipment'
    reference_code VARCHAR(50), -- e.g., 'PO-28451', 'SO-19872'
    quantity INT,
    status VARCHAR(50), -- e.g., 'Completed', 'In Progress'
    created_at DATETIME2 DEFAULT GETDATE()
);