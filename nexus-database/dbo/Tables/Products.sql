CREATE TABLE [dbo].[Products] (
    [product_id]             INT             IDENTITY (1, 1) NOT NULL,
    [name]                   NVARCHAR (255)  NOT NULL,
    [sku]                    NVARCHAR (50)   NULL,
    [reorder_level]          INT             DEFAULT ((10)) NULL,
    [current_stock]          INT             DEFAULT ((0)) NULL,
    [unit_price]             DECIMAL (10, 2) NULL,
    [category]               NVARCHAR (50)   NULL,
    [status]                 NVARCHAR (20)   NULL,
    [IsDeleted]              BIT             DEFAULT ((0)) NULL,
    [total_volume_occupancy] INT             NULL,
    [warehouse_id]           INT             NULL,
    [zone_id]                INT             NULL,
    [per_volume]             INT             NULL,
    PRIMARY KEY CLUSTERED ([product_id] ASC),
    UNIQUE NONCLUSTERED ([sku] ASC)
);
GO

CREATE TRIGGER trg_UpdateProductStatus
ON dbo.Products
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE p
    SET p.status = CASE 
        WHEN i.current_stock = 0 THEN 'Out of Stock'
        WHEN i.current_stock <= i.reorder_level THEN 'Low Stock'
        ELSE 'In-Stock'
    END
    FROM dbo.Products p
    INNER JOIN inserted i ON p.product_id = i.product_id;
END;
GO

ALTER TABLE [dbo].[Products]
    ADD CONSTRAINT [FK_Products_zone] FOREIGN KEY ([zone_id]) REFERENCES [dbo].[Zones] ([zone_id]);
GO

ALTER TABLE [dbo].[Products]
    ADD CONSTRAINT [FK_Products_warehouse] FOREIGN KEY ([warehouse_id]) REFERENCES [dbo].[Warehouses] ([warehouse_id]);
GO

