/*
  # Simplified Realistic Seed Data for iTrading Dashboard

  This file contains realistic seed data that works with hosted Supabase.
  Uses the existing admin user for relationships and provides comprehensive
  sample data for all resources.
*/

-- ===============================================
-- CLEAN EXISTING SEED DATA
-- ===============================================

DELETE FROM user_notifications;
DELETE FROM notifications WHERE user_id IS NOT NULL;
DELETE FROM images;
DELETE FROM banners;
DELETE FROM products;
DELETE FROM posts WHERE author_id = (SELECT id FROM users WHERE email = 'admin@admin.com');
DELETE FROM brokers;

-- ===============================================
-- BROKERS (Realistic Trading Brokers)
-- ===============================================

INSERT INTO brokers (name, established_in, headquarter, description, logo_url) VALUES
(
  'Charles Schwab',
  1971,
  'Westlake, Texas, USA',
  'Charles Schwab Corporation is a leading provider of financial services, offering a wide range of investment, advisory, banking and retirement plan services to individual investors and independent investment advisors.',
  'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg'
),
(
  'Interactive Brokers',
  1978,
  'Greenwich, Connecticut, USA',
  'Interactive Brokers is an automated global electronic broker and market maker that specializes in routing orders and executing and processing trades in securities, futures and foreign exchange instruments.',
  'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg'
),
(
  'TD Ameritrade',
  1975,
  'Omaha, Nebraska, USA',
  'TD Ameritrade is an American online broker that offers an electronic trading platform for the trade of financial securities to retail investors.',
  'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg'
),
(
  'E*TRADE',
  1991,
  'Arlington, Virginia, USA',
  'E*TRADE Financial Corporation offers an electronic trading platform to trade financial securities. The company provides online investing services to retail investors.',
  'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg'
),
(
  'Robinhood',
  2013,
  'Menlo Park, California, USA',
  'Robinhood is an American financial services company offering commission-free stock trading through a mobile app and website.',
  'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg'
),
(
  'Fidelity Investments',
  1946,
  'Boston, Massachusetts, USA',
  'Fidelity Investments is an American multinational financial services corporation offering fund management, fund distribution, investment advice, retirement services, wealth management, securities execution and clearance.',
  'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg'
),
(
  'Vanguard',
  1975,
  'Malvern, Pennsylvania, USA',
  'The Vanguard Group is an American registered investment advisor based in Malvern, Pennsylvania, with over $7 trillion in global assets under management.',
  'https://images.pexels.com/photos/210742/pexels-photo-210742.jpeg'
),
(
  'Merrill Lynch',
  1914,
  'New York City, New York, USA',
  'Merrill Lynch is an American investment management and wealth management division of Bank of America that offers a broad range of brokerage, investment advisory and other financial services.',
  'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg'
);

-- ===============================================
-- PRODUCTS (Trading & Investment Products)
-- ===============================================

INSERT INTO products (name, price, description, featured_image_url, subscription) VALUES
(
  'Premium Trading Platform',
  49.99,
  'Advanced trading platform with real-time market data, advanced charting tools, portfolio analytics, and priority customer support. Perfect for active traders who need professional-grade tools.',
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
  true
),
(
  'Market Research Pro',
  29.99,
  'Comprehensive market research and analysis tools including sector analysis, earnings forecasts, technical indicators, and expert market insights updated daily.',
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
  true
),
(
  'Algorithmic Trading Suite',
  199.99,
  'Complete algorithmic trading solution with backtesting capabilities, strategy development tools, and automated execution. Includes popular trading algorithms and custom strategy builder.',
  'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg',
  false
),
(
  'Risk Management Dashboard',
  79.99,
  'Professional risk management tools with portfolio risk assessment, Value at Risk (VaR) calculations, stress testing, and real-time risk monitoring for your investments.',
  'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg',
  true
),
(
  'Mobile Trading App Pro',
  19.99,
  'Enhanced mobile trading experience with advanced order types, real-time alerts, mobile charts, and seamless synchronization across all your devices.',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
  true
),
(
  'Educational Trading Course',
  149.99,
  'Comprehensive online trading course covering fundamentals, technical analysis, risk management, and advanced trading strategies. Includes video lessons, quizzes, and certification.',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
  false
),
(
  'Portfolio Analytics Pro',
  39.99,
  'Advanced portfolio analysis with performance attribution, benchmark comparison, asset allocation tracking, and detailed reporting tools for serious investors.',
  'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
  true
),
(
  'Options Trading Tools',
  89.99,
  'Specialized options trading platform with options chain analysis, volatility modeling, Greeks calculator, and strategy analyzer for options traders.',
  'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
  true
);

-- ===============================================
-- POSTS (Trading News & Content) - Using Admin as Author
-- ===============================================

INSERT INTO posts (title, content, type, status, author_id, thumbnail_url, views) VALUES
(
  'Market Analysis: Q1 2024 Review',
  '<h2>Q1 2024 Market Performance</h2><p>The first quarter of 2024 has shown remarkable resilience in global markets despite ongoing economic uncertainties. <strong>Key highlights include:</strong></p><ul><li>S&P 500 up 8.2% year-to-date</li><li>Technology sector leading gains with 12.5% growth</li><li>Emerging markets showing strong momentum</li><li>Bond yields stabilizing around historical averages</li></ul><p>Looking ahead, we expect continued volatility as markets navigate through earnings season and evolving monetary policy decisions.</p><h3>Investment Recommendations</h3><p>Our analysis suggests maintaining a diversified portfolio with a slight overweight in technology and healthcare sectors while remaining cautious about interest rate sensitive assets.</p>',
  'news',
  'published',
  (SELECT id FROM users WHERE email = 'admin@admin.com'),
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
  2847
),
(
  'Understanding Options Trading: A Beginner''s Guide',
  '<h2>What Are Options?</h2><p>Options are financial contracts that give traders the right, but not the obligation, to buy or sell an underlying asset at a predetermined price within a specific timeframe.</p><h3>Types of Options</h3><ul><li><strong>Call Options:</strong> Give you the right to buy an asset</li><li><strong>Put Options:</strong> Give you the right to sell an asset</li></ul><h3>Key Benefits</h3><p>Options trading offers several advantages:</p><ul><li>Leverage your investment capital</li><li>Hedge existing positions</li><li>Generate additional income</li><li>Limited risk with defined maximum loss</li></ul><p><em>Remember: Options trading involves significant risk and may not be suitable for all investors. Always consult with a financial advisor before making investment decisions.</em></p>',
  'news',
  'published',
  (SELECT id FROM users WHERE email = 'admin@admin.com'),
  'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
  1924
),
(
  'Virtual Trading Conference 2024',
  '<h2>Join Us for the Premier Trading Event of the Year</h2><p>We''re excited to announce our <strong>Virtual Trading Conference 2024</strong>, bringing together industry experts, professional traders, and investment enthusiasts from around the world.</p><h3>Event Details</h3><ul><li><strong>Date:</strong> March 15-17, 2024</li><li><strong>Format:</strong> Virtual (Online)</li><li><strong>Duration:</strong> 3 days of intensive sessions</li><li><strong>Registration:</strong> Early bird pricing available</li></ul><h3>Featured Speakers</h3><p>This year''s lineup includes renowned market analysts, successful hedge fund managers, and fintech innovators who will share their insights on:</p><ul><li>Market trends and predictions for 2024</li><li>Advanced trading strategies</li><li>Risk management techniques</li><li>Technology trends in finance</li></ul><p><strong>Register now</strong> and secure your spot at this exclusive event. Limited seats available!</p>',
  'event',
  'published',
  (SELECT id FROM users WHERE email = 'admin@admin.com'),
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
  856
),
(
  'New Platform Features: Advanced Charting Tools',
  '<h2>Enhanced Technical Analysis Capabilities</h2><p>We''re thrilled to introduce our latest platform update featuring advanced charting tools designed to empower traders with professional-grade analysis capabilities.</p><h3>New Features Include:</h3><ul><li><strong>200+ Technical Indicators:</strong> From basic moving averages to complex momentum oscillators</li><li><strong>Custom Drawing Tools:</strong> Fibonacci retracements, trend lines, and pattern recognition</li><li><strong>Multiple Timeframes:</strong> Analyze from 1-minute to monthly charts</li><li><strong>Real-time Data:</strong> Lightning-fast market data updates</li><li><strong>Alert System:</strong> Custom price and indicator alerts</li></ul><h3>How to Access</h3><p>All Premium and Pro subscribers can access these features immediately through the updated web platform and mobile app. Free users can explore basic charting tools with limited indicators.</p><p>Our development team has worked tirelessly to ensure these tools meet the highest standards of accuracy and performance.</p>',
  'news',
  'published',
  (SELECT id FROM users WHERE email = 'admin@admin.com'),
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
  3421
),
(
  'Risk Management in Volatile Markets',
  '<h2>Protecting Your Portfolio During Market Uncertainty</h2><p>Recent market volatility has highlighted the critical importance of robust risk management strategies. Here''s how professional traders protect their capital during uncertain times.</p><h3>Essential Risk Management Principles</h3><ol><li><strong>Position Sizing:</strong> Never risk more than 2% of your portfolio on a single trade</li><li><strong>Stop Losses:</strong> Always set predetermined exit points</li><li><strong>Diversification:</strong> Spread risk across different assets and sectors</li><li><strong>Regular Review:</strong> Continuously assess and adjust your strategy</li></ol><h3>Tools for Risk Assessment</h3><p>Modern risk management relies on quantitative tools:</p><ul><li>Value at Risk (VaR) calculations</li><li>Beta analysis for portfolio volatility</li><li>Correlation analysis between holdings</li><li>Stress testing against historical scenarios</li></ul><p><strong>Remember:</strong> The goal isn''t to eliminate risk entirely, but to manage it intelligently while pursuing your investment objectives.</p>',
  'news',
  'published',
  (SELECT id FROM users WHERE email = 'admin@admin.com'),
  'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg',
  1677
),
(
  'Privacy Policy Update',
  '<h2>Updated Privacy Policy - Effective March 1, 2024</h2><p>We are committed to protecting your privacy and have updated our privacy policy to provide greater transparency about how we collect, use, and protect your personal information.</p><h3>Key Changes</h3><ul><li><strong>Enhanced Data Protection:</strong> Additional security measures for sensitive financial data</li><li><strong>Cookie Management:</strong> Improved controls for managing website cookies and tracking</li><li><strong>Third-Party Integrations:</strong> Clear disclosure of data sharing with trading partners</li><li><strong>User Rights:</strong> Expanded rights for data access, correction, and deletion</li></ul><h3>Your Data Rights</h3><p>Under our updated policy, you have the right to:</p><ul><li>Access your personal data</li><li>Correct inaccurate information</li><li>Request data deletion (subject to regulatory requirements)</li><li>Opt-out of marketing communications</li><li>Export your data in a portable format</li></ul><p>For questions about this policy update, please contact our privacy team at privacy@trading.com</p>',
  'privacy_policy',
  'published',
  (SELECT id FROM users WHERE email = 'admin@admin.com'),
  'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg',
  654
),
(
  'Platform Terms of Service',
  '<h2>Terms of Service Agreement</h2><p>By accessing and using our trading platform, you agree to comply with and be bound by the following terms and conditions.</p><h3>Account Requirements</h3><ul><li>Users must be 18 years or older</li><li>Accurate information required for account verification</li><li>Compliance with applicable securities regulations</li><li>Maintenance of account security credentials</li></ul><h3>Trading Rules</h3><p>All trading activities must comply with:</p><ul><li>Market regulations and exchange rules</li><li>Anti-money laundering (AML) requirements</li><li>Pattern day trading regulations where applicable</li><li>Position limits and margin requirements</li></ul><h3>Risk Disclosure</h3><p><strong>Important:</strong> Trading securities involves substantial risk of loss and is not suitable for all investors. Past performance does not guarantee future results. Please read our full risk disclosure before trading.</p><h3>Limitation of Liability</h3><p>Our platform is provided "as is" without warranties. We are not liable for trading losses, system downtime, or market data delays beyond our reasonable control.</p>',
  'terms_of_use',
  'published',
  (SELECT id FROM users WHERE email = 'admin@admin.com'),
  'https://images.pexels.com/photos/210742/pexels-photo-210742.jpeg',
  432
),
(
  'Cryptocurrency Integration Coming Soon',
  '<h2>Expanding Our Offering: Digital Assets</h2><p>We''re excited to announce that cryptocurrency trading will be available on our platform starting Q2 2024. This expansion represents our commitment to providing comprehensive investment opportunities.</p><h3>Supported Cryptocurrencies</h3><p>Initially, we''ll support major cryptocurrencies including:</p><ul><li>Bitcoin (BTC)</li><li>Ethereum (ETH)</li><li>Cardano (ADA)</li><li>Solana (SOL)</li><li>Polygon (MATIC)</li></ul><h3>Security Measures</h3><p>Cryptocurrency trading will feature enhanced security protocols:</p><ul><li>Cold storage for digital assets</li><li>Multi-signature wallet technology</li><li>Two-factor authentication requirement</li><li>Real-time transaction monitoring</li></ul><p><em>This feature is currently in beta testing. Full rollout expected by June 2024.</em></p>',
  'news',
  'draft',
  (SELECT id FROM users WHERE email = 'admin@admin.com'),
  'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg',
  0
);

-- ===============================================
-- BANNERS (Promotional Content)
-- ===============================================

INSERT INTO banners (name, target_url, is_active) VALUES
('Welcome New Traders', 'https://trading.com/welcome-bonus', true),
('Premium Features Upgrade', 'https://trading.com/premium-upgrade', true),
('Trading Conference 2024', 'https://trading.com/conference-2024', true),
('Mobile App Download', 'https://trading.com/mobile-app', true),
('Educational Resources', 'https://trading.com/education', true),
('Risk Management Guide', 'https://trading.com/risk-management', false),
('Options Trading Course', 'https://trading.com/options-course', true);

-- ===============================================
-- NOTIFICATIONS (System-wide only for now)
-- ===============================================

INSERT INTO notifications (title, description, user_id) VALUES
('Platform Maintenance Scheduled', 'We will be performing scheduled maintenance on Sunday, March 10th from 2:00 AM to 6:00 AM EST. Trading will be temporarily unavailable during this time.', NULL),
('New Security Features', 'We''ve enhanced our security with two-factor authentication and biometric login options. Update your security settings in your account preferences.', NULL),
('Market Data Provider Update', 'We''ve upgraded our market data feeds for faster and more accurate real-time quotes. You may notice improved response times across the platform.', NULL),
('Educational Webinar Series', 'Join our free webinar series "Advanced Trading Strategies" every Thursday at 2 PM EST. Register now to secure your spot for expert insights.', NULL);

-- ===============================================
-- IMAGES (Centralized Image Management)
-- ===============================================

-- Product images
INSERT INTO images (table_name, record_id, image_url, alt_text, mime_type, file_size) VALUES
('products', '1', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'Premium Trading Platform Dashboard', 'image/jpeg', 245760),
('products', '2', 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg', 'Market Research Analytics', 'image/jpeg', 198340),
('products', '3', 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg', 'Algorithmic Trading Interface', 'image/jpeg', 302150),
('products', '4', 'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg', 'Risk Management Dashboard', 'image/jpeg', 156890),
('products', '5', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg', 'Mobile Trading App Screenshot', 'image/jpeg', 128450),
('products', '6', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg', 'Trading Education Course', 'image/jpeg', 234670),
('products', '7', 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg', 'Portfolio Analytics Interface', 'image/jpeg', 187520),
('products', '8', 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg', 'Options Trading Tools', 'image/jpeg', 167840);

-- Broker images (logos)
INSERT INTO images (table_name, record_id, image_url, alt_text, mime_type, file_size) VALUES
('brokers', '1', 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg', 'Charles Schwab Logo', 'image/jpeg', 89320),
('brokers', '2', 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg', 'Interactive Brokers Logo', 'image/jpeg', 76540),
('brokers', '3', 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg', 'TD Ameritrade Logo', 'image/jpeg', 82150),
('brokers', '4', 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg', 'E*TRADE Logo', 'image/jpeg', 78920),
('brokers', '5', 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg', 'Robinhood Logo', 'image/jpeg', 65780),
('brokers', '6', 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg', 'Fidelity Investments Logo', 'image/jpeg', 94330),
('brokers', '7', 'https://images.pexels.com/photos/210742/pexels-photo-210742.jpeg', 'Vanguard Logo', 'image/jpeg', 71240),
('brokers', '8', 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg', 'Merrill Lynch Logo', 'image/jpeg', 88650);

-- Post thumbnail images
INSERT INTO images (table_name, record_id, image_url, alt_text, mime_type, file_size) VALUES
('posts', '1', 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg', 'Q1 2024 Market Analysis Chart', 'image/jpeg', 156780),
('posts', '2', 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg', 'Options Trading Illustration', 'image/jpeg', 143290),
('posts', '3', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg', 'Virtual Trading Conference Banner', 'image/jpeg', 289340),
('posts', '4', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'New Platform Features', 'image/jpeg', 198760),
('posts', '5', 'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg', 'Risk Management Illustration', 'image/jpeg', 167430),
('posts', '6', 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg', 'Privacy Policy Document', 'image/jpeg', 134520),
('posts', '7', 'https://images.pexels.com/photos/210742/pexels-photo-210742.jpeg', 'Terms of Service Agreement', 'image/jpeg', 145780),
('posts', '8', 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg', 'Cryptocurrency Trading', 'image/jpeg', 178290);

-- Banner images (using UUIDs for banner record_id)
DO $$
DECLARE
    banner_record RECORD;
    image_urls text[] := ARRAY[
        'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg',
        'https://images.pexels.com/photos/586996/pexels-photo-586996.jpeg',
        'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
        'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
        'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg',
        'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg'
    ];
    alt_texts text[] := ARRAY[
        'Welcome New Traders Banner',
        'Premium Features Upgrade Banner',
        'Trading Conference 2024 Banner',
        'Mobile App Download Banner',
        'Educational Resources Banner',
        'Risk Management Guide Banner',
        'Options Trading Course Banner'
    ];
    counter int := 1;
BEGIN
    FOR banner_record IN
        SELECT id, name FROM banners ORDER BY created_at
    LOOP
        INSERT INTO images (table_name, record_id, image_url, alt_text, mime_type, file_size)
        VALUES (
            'banners',
            banner_record.id::text,
            image_urls[counter],
            alt_texts[counter],
            'image/jpeg',
            200000 + (random() * 100000)::int
        );
        counter := counter + 1;
    END LOOP;
END $$;

-- ===============================================
-- SEED DATA SUMMARY REPORT
-- ===============================================

DO $$
DECLARE
    total_users int;
    total_posts int;
    total_products int;
    total_brokers int;
    total_banners int;
    total_notifications int;
    total_images int;
    admin_user_exists boolean;
BEGIN
    -- Count all seeded data
    SELECT count(*) INTO total_users FROM users;
    SELECT count(*) INTO total_posts FROM posts;
    SELECT count(*) INTO total_products FROM products;
    SELECT count(*) INTO total_brokers FROM brokers;
    SELECT count(*) INTO total_banners FROM banners;
    SELECT count(*) INTO total_notifications FROM notifications;
    SELECT count(*) INTO total_images FROM images;
    SELECT exists(SELECT 1 FROM users WHERE email = 'admin@admin.com') INTO admin_user_exists;

    -- Generate report
    RAISE NOTICE '';
    RAISE NOTICE '🎉 =======================================';
    RAISE NOTICE '🎉 SIMPLIFIED SEED DATA COMPLETE!';
    RAISE NOTICE '🎉 =======================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SEEDED DATA SUMMARY:';
    RAISE NOTICE '👥 Users: % (admin only)', total_users;
    RAISE NOTICE '📝 Posts: % (with admin as author)', total_posts;
    RAISE NOTICE '🛍️  Products: % (with featured images)', total_products;
    RAISE NOTICE '🏢 Brokers: % (major trading brokers)', total_brokers;
    RAISE NOTICE '🖼️  Banners: % (promotional banners)', total_banners;
    RAISE NOTICE '🔔 Notifications: % (system notifications)', total_notifications;
    RAISE NOTICE '📷 Images: % (across all resources)', total_images;
    RAISE NOTICE '';

    IF admin_user_exists THEN
        RAISE NOTICE '✅ Admin account ready:';
        RAISE NOTICE '   📧 admin@admin.com - password: 123123123';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '📝 NOTE: Additional users should be created through:';
    RAISE NOTICE '   1. Your application''s signup process';
    RAISE NOTICE '   2. Supabase Auth dashboard';
    RAISE NOTICE '   3. Auth API calls';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your application is ready with realistic sample data!';
    RAISE NOTICE '';
END $$;
