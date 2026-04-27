CREATE TABLE ServiceablePincodes (
    pincode VARCHAR(10) PRIMARY KEY,
    warehouse_id INT FOREIGN KEY REFERENCES Warehouses(warehouse_id),
    city_name VARCHAR(100),
    delivery_zone VARCHAR(50) -- Optional: e.g., 'Metro', 'Regional', 'Remote'
);