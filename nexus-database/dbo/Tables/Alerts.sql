CREATE TABLE [dbo].[Alerts] (
    [AlertID]      INT            IDENTITY (1, 1) NOT NULL,
    [ProductID]    INT            NULL,
    [AlertMessage] NVARCHAR (MAX) NULL,
    [CreatedAt]    DATETIME       DEFAULT (getdate()) NULL,
    [IsResolved]   BIT            DEFAULT ((0)) NULL,
    PRIMARY KEY CLUSTERED ([AlertID] ASC),
    FOREIGN KEY ([ProductID]) REFERENCES [dbo].[Products] ([product_id])
);
GO

