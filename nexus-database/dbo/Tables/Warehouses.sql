CREATE TABLE [dbo].[Warehouses] (
    [warehouse_id]           INT             IDENTITY (1, 1) NOT NULL,
    [location_name]          NVARCHAR (255)  NOT NULL,
    [latitude]               DECIMAL (9, 6)  NULL,
    [longitude]              DECIMAL (9, 6)  NULL,
    [operating_cost_per_day] DECIMAL (10, 2) NULL,
    [warehouse_type]         NVARCHAR (50)   DEFAULT ('Distribution Center') NULL,
    [total_capacity_sqft]    INT             DEFAULT ((50000)) NULL,
    [used_capacity_sqft]     INT             DEFAULT ((0)) NULL,
    [total_staff]            INT             DEFAULT ((0)) NULL,
    [status]                 NVARCHAR (20)   DEFAULT ('Operational') NULL,
    [IsDeleted]              BIT             DEFAULT ((0)) NULL,
    PRIMARY KEY CLUSTERED ([warehouse_id] ASC)
);
GO

