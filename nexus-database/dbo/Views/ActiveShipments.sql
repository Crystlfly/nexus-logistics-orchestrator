CREATE VIEW ActiveShipments AS 
SELECT 
    o.order_id,
    w.location_name AS origin,
    o.destination_address AS destination,
    o.order_status,
    f.vehicle_type AS carrier 
FROM Orders o
LEFT JOIN Warehouses w ON o.warehouse_id = w.warehouse_id
LEFT JOIN Fleet f ON o.assigned_vehicle_id = f.vehicle_id
WHERE o.order_status IN ('Dispatched', 'In-Transit', 'Delayed');
GO

