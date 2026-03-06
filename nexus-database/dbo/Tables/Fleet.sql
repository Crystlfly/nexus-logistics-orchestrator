CREATE TABLE [dbo].[Fleet] (
    [vehicle_id]           INT            IDENTITY (1, 1) NOT NULL,
    [driver_name]          NVARCHAR (255) NULL,
    [vehicle_type]         NVARCHAR (50)  NULL,
    [status]               NVARCHAR (50)  DEFAULT ('Idle') NULL,
    [current_warehouse_id] INT            NULL,
    [fuel_level]           INT            DEFAULT ((100)) NULL,
    [progress]             INT            DEFAULT ((0)) NULL,
    [current_route]        NVARCHAR (100) DEFAULT ('Unassigned') NULL,
    [odometer]             INT            DEFAULT ((0)) NULL,
    [IsDeleted]            BIT            DEFAULT ((0)) NULL,
    PRIMARY KEY CLUSTERED ([vehicle_id] ASC),
    FOREIGN KEY ([current_warehouse_id]) REFERENCES [dbo].[Warehouses] ([warehouse_id])
);
GO

