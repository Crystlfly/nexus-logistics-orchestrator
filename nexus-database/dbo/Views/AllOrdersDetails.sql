create view AllOrdersDetails
as 
select p.name as ProductName, (o.quantity * p.unit_price) as TotalValue,o.* from Orders o join Products p on o.product_id = p.product_id
go