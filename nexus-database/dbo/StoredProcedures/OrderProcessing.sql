CREATE PROCEDURE OrderProcessing
@customerName NVARCHAR(255),
@productId INT,
@qty INT,
@priority INT
AS
BEGIN
DECLARE @avlQty INT;
DECLARE @reorderLvl int;
DECLARE @ProductName NVARCHAR(255);
SELECT @avlQty=current_stock, @reorderLvl=reorder_level, @ProductName=name FROM Products where product_id=@productId;
IF @avlQty<@qty 
BEGIN
SELECT 'Order Failed: Insufficient Stock' AS Result;
END
ELSE
BEGIN
UPDATE Products SET current_stock=current_stock-@qty WHERE product_id=@productId;
INSERT INTO Orders (customer_name, product_id, quantity, priority_level, order_status) VALUES (@customerName, @productId, @qty, @priority, 'Dispatched');
IF (@avlQty-@qty < @reorderLvl)
BEGIN
INSERT INTO Alerts (ProductID, AlertMessage)
VALUES (@ProductID, 'CRITICAL STOCK: ' + @ProductName + ' is below threshold.');
END
SELECT 'Order Dispatched' AS Result;
END
END;
GO

