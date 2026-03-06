CREATE TABLE [dbo].[Zones] (
    [zone_id]           INT            IDENTITY (1, 1) NOT NULL,
    [warehouse_id]      INT            NULL,
    [zone_name]         NVARCHAR (100) NULL,
    [zone_type]         NVARCHAR (50)  NULL,
    [temperature]       DECIMAL (5, 2) NULL,
    [capacity_limit]    INT            NULL,
    [current_occupancy] INT            NULL,
    [IsDeleted]         BIT            DEFAULT ((0)) NULL,
    PRIMARY KEY CLUSTERED ([zone_id] ASC),
    FOREIGN KEY ([warehouse_id]) REFERENCES [dbo].[Warehouses] ([warehouse_id])
);
GO

