-- sample-data.sql - Insert sample data for development

-- Insert sample products (if not already in schema.sql)

INSERT INTO insurance_products (name, description, base_price) VALUES
('Auto Insurance Basic', 'Basic coverage for your vehicle including liability and collision', 500.00),
('Auto Insurance Premium',  'Comprehensive coverage with roadside assistance and rental car', 800.00),
('Home Insurance Basic','Coverage for your home structure and personal belongings', 600.00),
('Home Insurance Premium',  'Comprehensive home coverage including natural disasters and theft', 950.00),
('Life Insurance Term',  'Term life insurance with flexible coverage options', 300.00),
('Health Insurance Basic',  'Basic health coverage for individuals and families', 400.00);