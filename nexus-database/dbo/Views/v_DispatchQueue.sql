CREATE VIEW v_DispatchQueue AS
SELECT 
    O.order_id,
    O.customer_name,
    P.name AS ProductName,
    W.location_name AS DispatchPoint,
    F.driver_name,
    F.vehicle_type,
    O.priority_level
FROM Orders O
JOIN Products P ON O.product_id = P.product_id
JOIN Warehouses W ON W.warehouse_id = (SELECT TOP 1 current_warehouse_id FROM Fleet WHERE status = 'Idle') -- Simple Dispatch Logic
JOIN Fleet F ON F.current_warehouse_id = W.warehouse_id
WHERE O.order_status = 'Dispatched' AND F.status = 'Idle';
GO

