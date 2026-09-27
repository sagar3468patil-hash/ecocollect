-- ============================================================
-- EcoCollect — seed data
-- 15 realistic rows with Pune-area neighbourhood names.
-- Run AFTER schema.sql.
-- ============================================================

insert into waste_requests
  (request_code, user_name, user_email, waste_category, quantity_kg,
   pickup_address, pickup_date, pickup_time, notes, priority, status)
values
  -- SUBMITTED requests (newly created, awaiting review)
  ('ECO-0001', 'Priya Desai',     'priya.desai@example.com',
   'Plastic',    4.5,  'Flat 12, Sai Residency, Kothrud',
   '2026-09-30', '09:00', 'Mostly PET bottles and carry bags.',  'HIGH',   'SUBMITTED'),

  ('ECO-0002', 'Rahul Kulkarni',  'rahul.k@example.com',
   'E-Waste',    2.0,  'Shop 4, Orbit Mall Road, Viman Nagar',
   '2026-09-30', '11:00', 'Old laptop, two broken phones.',       'HIGH',   'SUBMITTED'),

  ('ECO-0003', 'Sneha Joshi',     'sneha.joshi@example.com',
   'Organic',    8.0,  'Row House 7, Baner Gaon',
   '2026-10-01', '08:00', 'Kitchen and garden waste.',            'LOW',    'SUBMITTED'),

  ('ECO-0004', 'Amit Sharma',     'amit.sharma@example.com',
   'Glass',      6.5,  'Flat 201, Panchavati Apartments, Shivajinagar',
   '2026-10-01', '10:00', 'Broken crockery and old bottles.',     'MEDIUM', 'SUBMITTED'),

  -- REVIEWED requests
  ('ECO-0005', 'Kavita Patil',    'kavita.patil@example.com',
   'Paper',      12.0, 'Office 501, IT Park, Hinjewadi Phase 1',
   '2026-10-02', '14:00', 'Old newspapers and cardboard boxes.',  'LOW',    'REVIEWED'),

  ('ECO-0006', 'Suresh Nair',     'suresh.nair@example.com',
   'Metal',      9.0,  'Gala 3, Industrial Estate, Hadapsar',
   '2026-10-02', '09:30', 'Scrap iron sheets from renovation.',   'MEDIUM', 'REVIEWED'),

  ('ECO-0007', 'Meera Iyer',      'meera.iyer@example.com',
   'E-Waste',    3.5,  'Flat 9, Green Valley, Wakad',
   '2026-10-03', '11:30', 'Printer, monitor, keyboard.',          'HIGH',   'REVIEWED'),

  -- SCHEDULED requests
  ('ECO-0008', 'Deepak Gaikwad',  'deepak.g@example.com',
   'Plastic',    7.0,  'Plot 18, Dhayari Phata, Dhayari',
   '2026-10-04', '08:00', 'Mixed plastic containers.',            'MEDIUM', 'SCHEDULED'),

  ('ECO-0009', 'Anita Kulkarni',  'anita.kulkarni@example.com',
   'Mixed Waste', 15.0, 'Bungalow 22, Bavdhan',
   '2026-10-04', '10:00', 'Post-renovation debris — mixed.',      'HIGH',   'SCHEDULED'),

  ('ECO-0010', 'Rajan More',      'rajan.more@example.com',
   'Organic',    5.0,  'Flat 403, Lotus Tower, Aundh',
   '2026-10-05', '07:30', 'Compostable kitchen waste only.',      'LOW',    'SCHEDULED'),

  -- COLLECTED requests
  ('ECO-0011', 'Shruti Pawar',    'shruti.pawar@example.com',
   'Paper',      10.0, 'Office 12, Kalyani Nagar Business Hub',
   '2026-09-25', '13:00', 'Bulk document shredding.',             'LOW',    'COLLECTED'),

  ('ECO-0012', 'Vikas Tupe',      'vikas.tupe@example.com',
   'Glass',      4.0,  'Row House 5, Kondhwa Budruk',
   '2026-09-24', '09:00', null,                                   'LOW',    'COLLECTED'),

  ('ECO-0013', 'Pooja Bhatt',     'pooja.bhatt@example.com',
   'Metal',      11.5, 'Gala 7, MIDC Bhosari',
   '2026-09-23', '08:30', 'Aluminium scrap from factory.',        'MEDIUM', 'COLLECTED'),

  -- CANCELLED requests
  ('ECO-0014', 'Kiran Sawant',    'kiran.sawant@example.com',
   'Plastic',    3.0,  'Flat 6, Shree Complex, Katraj',
   '2026-09-28', '10:00', 'Cancelled by citizen — rescheduling.', 'MEDIUM', 'CANCELLED'),

  ('ECO-0015', 'Nandini Gokhale', 'nandini.g@example.com',
   'E-Waste',    1.5,  'Flat 302, Rohan Mithila, Viman Nagar',
   '2026-09-29', '15:00', 'Item already disposed by other means.','HIGH',   'CANCELLED');
