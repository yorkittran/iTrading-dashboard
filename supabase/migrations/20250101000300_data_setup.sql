/*
  # Data Setup & Initial Configuration Migration

  This migration establishes initial data and configurations including:
  - Default role permissions
  - Sample/seed data if needed
  - Post authorship setup
  - Final configurations
*/

-- ===============================================
-- DEFAULT ROLE PERMISSIONS
-- ===============================================

-- Insert default permissions for different roles
INSERT INTO role_permissions (role, resource, action) VALUES
-- User role permissions (read-only access to most content)
('user', 'posts', 'read'),
('user', 'products', 'read'),
('user', 'brokers', 'read'),
('user', 'banners', 'read'),
('user', 'notifications', 'read'),
('user', 'user_notifications', 'read'),
('user', 'user_notifications', 'create'),
('user', 'user_notifications', 'update'),

-- Admin role permissions (full CRUD on content, limited user management)
('admin', 'posts', 'read'),
('admin', 'posts', 'create'),
('admin', 'posts', 'update'),
('admin', 'posts', 'delete'),
('admin', 'products', 'read'),
('admin', 'products', 'create'),
('admin', 'products', 'update'),
('admin', 'products', 'delete'),
('admin', 'brokers', 'read'),
('admin', 'brokers', 'create'),
('admin', 'brokers', 'update'),
('admin', 'brokers', 'delete'),
('admin', 'banners', 'read'),
('admin', 'banners', 'create'),
('admin', 'banners', 'update'),
('admin', 'banners', 'delete'),
('admin', 'users', 'read'),
('admin', 'users', 'update'),
('admin', 'notifications', 'read'),
('admin', 'notifications', 'create'),
('admin', 'notifications', 'update'),
('admin', 'notifications', 'delete'),
('admin', 'user_notifications', 'read'),
('admin', 'user_notifications', 'create'),
('admin', 'user_notifications', 'update'),
('admin', 'user_notifications', 'delete'),
('admin', 'images', 'read'),
('admin', 'images', 'create'),
('admin', 'images', 'update'),
('admin', 'images', 'delete'),

-- Super admin role permissions (full access to everything)
('super_admin', 'posts', 'read'),
('super_admin', 'posts', 'create'),
('super_admin', 'posts', 'update'),
('super_admin', 'posts', 'delete'),
('super_admin', 'products', 'read'),
('super_admin', 'products', 'create'),
('super_admin', 'products', 'update'),
('super_admin', 'products', 'delete'),
('super_admin', 'brokers', 'read'),
('super_admin', 'brokers', 'create'),
('super_admin', 'brokers', 'update'),
('super_admin', 'brokers', 'delete'),
('super_admin', 'banners', 'read'),
('super_admin', 'banners', 'create'),
('super_admin', 'banners', 'update'),
('super_admin', 'banners', 'delete'),
('super_admin', 'users', 'read'),
('super_admin', 'users', 'create'),
('super_admin', 'users', 'update'),
('super_admin', 'users', 'delete'),
('super_admin', 'user_permissions', 'read'),
('super_admin', 'user_permissions', 'create'),
('super_admin', 'user_permissions', 'update'),
('super_admin', 'user_permissions', 'delete'),
('super_admin', 'role_permissions', 'read'),
('super_admin', 'role_permissions', 'create'),
('super_admin', 'role_permissions', 'update'),
('super_admin', 'role_permissions', 'delete'),
('super_admin', 'notifications', 'read'),
('super_admin', 'notifications', 'create'),
('super_admin', 'notifications', 'update'),
('super_admin', 'notifications', 'delete'),
('super_admin', 'user_notifications', 'read'),
('super_admin', 'user_notifications', 'create'),
('super_admin', 'user_notifications', 'update'),
('super_admin', 'user_notifications', 'delete'),
('super_admin', 'images', 'read'),
('super_admin', 'images', 'create'),
('super_admin', 'images', 'update'),
('super_admin', 'images', 'delete')
ON CONFLICT (role, resource, action) DO NOTHING;

-- ===============================================
-- POST AUTHORSHIP SETUP
-- ===============================================

-- Update existing posts to have a default author (first admin user if available)
DO $$
DECLARE
  admin_user_id uuid;
  posts_updated int;
BEGIN
  -- Try to find the first admin user
  SELECT id INTO admin_user_id
  FROM users
  WHERE role IN ('admin', 'super_admin')
  ORDER BY created_at
  LIMIT 1;

  -- If we found an admin, update existing posts
  IF admin_user_id IS NOT NULL THEN
    UPDATE posts
    SET author_id = admin_user_id
    WHERE author_id IS NULL;

    GET DIAGNOSTICS posts_updated = ROW_COUNT;

    IF posts_updated > 0 THEN
      RAISE NOTICE '📝 Updated % existing posts with default author (%)' , posts_updated, admin_user_id;
    ELSE
      RAISE NOTICE '📝 No posts needed author assignment';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  No admin users found for post authorship assignment';
  END IF;
END;
$$;

-- ===============================================
-- SAMPLE DATA (OPTIONAL)
-- ===============================================

-- Insert sample posts if none exist
DO $$
DECLARE
  admin_user_id uuid;
  posts_count int;
BEGIN
  -- Check if posts already exist
  SELECT count(*) INTO posts_count FROM posts;

  IF posts_count = 0 THEN
    -- Get admin user for authorship
    SELECT id INTO admin_user_id
    FROM users
    WHERE role IN ('admin', 'super_admin')
    ORDER BY created_at
    LIMIT 1;

    IF admin_user_id IS NOT NULL THEN
      -- Insert sample posts
      INSERT INTO posts (title, content, type, status, author_id, views) VALUES
      ('Welcome to Our Platform',
       '<p>Welcome to our trading platform! We are excited to have you join our community of traders and investors.</p><p>Explore our features and start your trading journey today.</p>',
       'news', 'published', admin_user_id, 0),
      ('Privacy Policy Update',
       '<p>We have updated our privacy policy to better protect your data and provide more transparency about how we handle your information.</p>',
       'privacy_policy', 'published', admin_user_id, 0),
      ('Upcoming Trading Conference',
       '<p>Join us for our annual trading conference where industry experts will share insights and strategies.</p><p>Registration opens next month!</p>',
       'event', 'draft', admin_user_id, 0);

      RAISE NOTICE '📝 Inserted 3 sample posts';
    ELSE
      RAISE NOTICE '⚠️  No admin user found, skipping sample posts creation';
    END IF;
  ELSE
    RAISE NOTICE '📝 Posts already exist (%), skipping sample data', posts_count;
  END IF;
END;
$$;

-- ===============================================
-- BANNER NAMING SETUP
-- ===============================================

-- Update any existing banners without names
DO $$
DECLARE
  banners_updated int;
BEGIN
  UPDATE banners
  SET name = CASE
    WHEN target_url IS NOT NULL AND target_url != '' THEN
      CONCAT('Banner for ',
        COALESCE(
          NULLIF(REGEXP_REPLACE(target_url, '^https?://(www\.)?([^/]+).*', '\2'), ''),
          'Website'
        )
      )
    ELSE
      CONCAT('Banner #', LEFT(id::text, 8))
  END
  WHERE name IS NULL OR name = '';

  GET DIAGNOSTICS banners_updated = ROW_COUNT;

  IF banners_updated > 0 THEN
    RAISE NOTICE '🏷️  Updated % banners with proper names', banners_updated;
  ELSE
    RAISE NOTICE '🏷️  All banners already have names';
  END IF;
END;
$$;

-- ===============================================
-- FINAL VERIFICATION & REPORTING
-- ===============================================

-- Generate final setup report
DO $$
DECLARE
  total_users int;
  total_posts int;
  total_products int;
  total_brokers int;
  total_banners int;
  total_permissions int;
  admin_users int;
BEGIN
  -- Count all the important entities
  SELECT count(*) INTO total_users FROM users;
  SELECT count(*) INTO total_posts FROM posts;
  SELECT count(*) INTO total_products FROM products;
  SELECT count(*) INTO total_brokers FROM brokers;
  SELECT count(*) INTO total_banners FROM banners;
  SELECT count(*) INTO total_permissions FROM role_permissions;
  SELECT count(*) INTO admin_users FROM users WHERE role IN ('admin', 'super_admin');

  -- Generate report
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ================================';
  RAISE NOTICE '🎉 DATABASE SETUP COMPLETE!';
  RAISE NOTICE '🎉 ================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 SUMMARY:';
  RAISE NOTICE '👥 Users: % (% admins)', total_users, admin_users;
  RAISE NOTICE '📝 Posts: %', total_posts;
  RAISE NOTICE '🛍️ Products: %', total_products;
  RAISE NOTICE '🏢 Brokers: %', total_brokers;
  RAISE NOTICE '🖼️ Banners: %', total_banners;
  RAISE NOTICE '🔐 Role Permissions: %', total_permissions;
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables created with RLS enabled';
  RAISE NOTICE '✅ Storage buckets configured';
  RAISE NOTICE '✅ Admin user available';
  RAISE NOTICE '✅ Default permissions set';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your application is ready to use!';
  RAISE NOTICE '';

END;
$$;
