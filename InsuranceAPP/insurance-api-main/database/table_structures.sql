-- Create Users table
CREATE TABLE [users] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(255) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [phone] NVARCHAR(255) NULL,
    [address] NVARCHAR(MAX) NULL,
    [city] NVARCHAR(255) NULL,
    [state] NVARCHAR(255) NULL,
    [zip_code] NVARCHAR(255) NULL,
    [auth0_id] NVARCHAR(255) NULL,
    [avatar] NVARCHAR(255) NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT DF_users_status DEFAULT 'active',
    [email_verified_at] DATETIME2 NULL,
    [password] NVARCHAR(255) NOT NULL,
    [remember_token] NVARCHAR(100) NULL,
    [created_at] DATETIME2 NULL,
    [updated_at] DATETIME2 NULL,
    [deleted_at] DATETIME2 NULL,
    CONSTRAINT PK_users PRIMARY KEY ([id]),
    CONSTRAINT UQ_users_email UNIQUE ([email]),
    CONSTRAINT UQ_users_auth0_id UNIQUE ([auth0_id]),
    CONSTRAINT CK_users_status CHECK ([status] IN ('active', 'inactive', 'suspended'))
);

-- Create Insurance Products table
CREATE TABLE [insurance_products] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NOT NULL,
    [base_price] DECIMAL(10,2) NOT NULL,
    [created_at] DATETIME2 NULL,
    [updated_at] DATETIME2 NULL,
    CONSTRAINT PK_insurance_products PRIMARY KEY ([id])
);

-- Create Quotes table (NO CASCADE to users)
CREATE TABLE [quotes] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [quote_number] NVARCHAR(255) NULL,
    [user_id] BIGINT NOT NULL,
    [insurance_product_id] BIGINT NOT NULL,
    [coverage_amount] DECIMAL(10,2) NULL,
    [deductible] DECIMAL(10,2) NULL,
    [additional_options] NVARCHAR(MAX) NULL,
    [estimated_premium] DECIMAL(10,2) NOT NULL,
    [calculated_price] DECIMAL(10,2) NULL,
    [status] NVARCHAR(255) NOT NULL CONSTRAINT DF_quotes_status DEFAULT 'pending',
    [expires_at] DATETIME2 NULL,
    [created_at] DATETIME2 NULL,
    [updated_at] DATETIME2 NULL,
    CONSTRAINT PK_quotes PRIMARY KEY ([id]),
    CONSTRAINT UQ_quotes_quote_number UNIQUE ([quote_number]),
    CONSTRAINT FK_quotes_user_id FOREIGN KEY ([user_id]) REFERENCES [users]([id]) ON DELETE NO ACTION,
    CONSTRAINT FK_quotes_insurance_product_id FOREIGN KEY ([insurance_product_id]) REFERENCES [insurance_products]([id]) ON DELETE CASCADE
);

-- Create Policies table (with NO ACTION to prevent cascade cycles)
CREATE TABLE [policies] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [user_id] BIGINT NOT NULL,
    [quote_id] BIGINT NOT NULL,
    [insurance_product_id] BIGINT NOT NULL,
    [policy_number] NVARCHAR(255) NOT NULL,
    [premium_amount] DECIMAL(10,2) NOT NULL,
    [start_date] DATE NOT NULL,
    [end_date] DATE NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT DF_policies_status DEFAULT 'Active',
    [effective_date] DATE NOT NULL,
    [created_at] DATETIME2 NULL,
    [updated_at] DATETIME2 NULL,
    CONSTRAINT PK_policies PRIMARY KEY ([id]),
    CONSTRAINT UQ_policies_policy_number UNIQUE ([policy_number]),
    CONSTRAINT FK_policies_user_id FOREIGN KEY ([user_id]) REFERENCES [users]([id]) ON DELETE NO ACTION,
    CONSTRAINT FK_policies_quote_id FOREIGN KEY ([quote_id]) REFERENCES [quotes]([id]) ON DELETE NO ACTION,
    CONSTRAINT FK_policies_insurance_product_id FOREIGN KEY ([insurance_product_id]) REFERENCES [insurance_products]([id]) ON DELETE NO ACTION,
    CONSTRAINT CK_policies_status CHECK ([status] IN ('Active', 'Expired', 'Cancelled'))
);

-- Create Claims table
CREATE TABLE [claims] (
    [id] BIGINT NOT NULL IDENTITY(1,1),
    [user_id] BIGINT NOT NULL,
    [policy_id] BIGINT NOT NULL,
    [claim_number] NVARCHAR(255) NOT NULL,
    [incident_date] DATE NOT NULL,
    [description] NVARCHAR(MAX) NOT NULL,
    [claim_amount] DECIMAL(10,2) NOT NULL,
    [approved_amount] DECIMAL(10,2) NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT DF_claims_status DEFAULT 'Submitted',
    [documents] NVARCHAR(MAX) NULL,
    [resolution_date] DATE NULL,
    [created_at] DATETIME2 NULL,
    [updated_at] DATETIME2 NULL,
    CONSTRAINT PK_claims PRIMARY KEY ([id]),
    CONSTRAINT UQ_claims_claim_number UNIQUE ([claim_number]),
    CONSTRAINT FK_claims_user_id FOREIGN KEY ([user_id]) REFERENCES [users]([id]) ON DELETE CASCADE,
    CONSTRAINT FK_claims_policy_id FOREIGN KEY ([policy_id]) REFERENCES [policies]([id]) ON DELETE CASCADE,
    CONSTRAINT CK_claims_status CHECK ([status] IN ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'))
);

-- Create indexes for better performance
CREATE INDEX IX_claims_user_id ON [claims]([user_id]);
CREATE INDEX IX_claims_policy_id ON [claims]([policy_id]);
CREATE INDEX IX_policies_user_id ON [policies]([user_id]);
CREATE INDEX IX_policies_quote_id ON [policies]([quote_id]);
CREATE INDEX IX_policies_insurance_product_id ON [policies]([insurance_product_id]);
CREATE INDEX IX_quotes_user_id ON [quotes]([user_id]);
CREATE INDEX IX_quotes_insurance_product_id ON [quotes]([insurance_product_id]);