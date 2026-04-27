CREATE PROCEDURE MatchAndDispatch
AS
BEGIN
    -- Prevent extra result sets from interfering with SELECT statements
    SET NOCOUNT ON;

    DECLARE @OrderID INT, @VehicleID INT;

    -- Finding the oldest packed order
    SELECT TOP 1 @OrderID = order_id
    FROM Orders
    WHERE order_status = 'Packed'  -- FIX: Changed from 'status'
    ORDER BY order_date ASC;

    -- 2. Find any available idle truck
    SELECT TOP 1 @VehicleID = vehicle_id
    FROM Fleet
    WHERE status = 'Idle'; 

    -- 3. If we have BOTH an order and a truck, assign them!
    IF @OrderID IS NOT NULL AND @VehicleID IS NOT NULL
    BEGIN
        BEGIN TRANSACTION;
        
        -- Update the Order
        UPDATE Orders 
        SET order_status = 'Dispatched', assigned_vehicle_id = @VehicleID -- FIX: Changed column names
        WHERE order_id = @OrderID;

        -- Update the Fleet Vehicle
        UPDATE Fleet 
        SET status = 'In Transit' 
        WHERE vehicle_id = @VehicleID;

        COMMIT TRANSACTION;
        
        SELECT @OrderID AS DispatchedOrderID, @VehicleID AS AssignedVehicleID;
    END
    ELSE
    BEGIN
        SELECT NULL AS DispatchedOrderID, NULL AS AssignedVehicleID;
    END
END
GO