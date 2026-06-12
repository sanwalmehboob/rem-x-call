const { 
    sequelize, 
    User, 
    Company, 
    SubscriptionPlan, 
    Contact, 
    CallLog, 
    Product, 
    Message, 
    Notification, 
    SubscriptionHistory 
} = require('../models');

const seed = async () => {
    console.log('Starting demo data seeding...');
    
    // Ensure database connection
    await sequelize.authenticate();
    
    // 1. Create or Find Subscription Plans
    const [planPro] = await SubscriptionPlan.findOrCreate({
        where: { name: 'Pro' },
        defaults: {
            description: 'Professional call and branding plan',
            priceMonthly: 49.00,
            billingCycle: 'monthly',
            maxAgents: 10,
            dialerEnabled: true,
            chatEnabled: true,
            recordingEnabled: true,
            whiteLabelEnabled: true,
            isActive: true,
            sortOrder: 1,
        }
    });

    const [planBasic] = await SubscriptionPlan.findOrCreate({
        where: { name: 'Basic' },
        defaults: {
            description: 'Basic calling plan',
            priceMonthly: 29.00,
            billingCycle: 'monthly',
            maxAgents: 2,
            dialerEnabled: true,
            chatEnabled: false,
            recordingEnabled: false,
            whiteLabelEnabled: false,
            isActive: true,
            sortOrder: 2,
        }
    });

    // 2. Create or Find Company
    const [company] = await Company.findOrCreate({
        where: { name: 'FlutterCraft LLC' },
        defaults: {
            businessEmail: 'billing@fluttercraft.com',
            subscriptionPlanId: planPro.id,
            inviteStatus: 'active',
            subscriptionStatus: 'active',
            trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            discountPercent: 10.00,
            whiteLabelLogoUrl: '/uploads/chat/logo.png',
            primaryBrandColor: '#000000',
            secondaryBrandColor: '#111111',
            brandFont: 'Inter',
        }
    });

    // 3. Create or Find Users (Admin & Agent)
    const [adminUser] = await User.findOrCreate({
        where: { email: 'admin@fluttercraft.com' },
        defaults: {
            username: 'admin_user',
            password: 'Password123!', // Note: User hooks hash this
            role: 'admin',
            companyId: company.id,
            isActive: true,
            firstName: 'ACME',
            lastName: 'Admin',
            profileImageUrl: '/uploads/avatars/admin.jpg',
        }
    });

    const [agentUser] = await User.findOrCreate({
        where: { email: 'agent@fluttercraft.com' },
        defaults: {
            username: 'agent_user',
            password: 'Password123!',
            role: 'user',
            companyId: company.id,
            isActive: true,
            firstName: 'Christine',
            lastName: 'Willson',
            profileImageUrl: '/uploads/avatars/christine.jpg',
        }
    });

    // Clear old data for seeding to prevent duplicates
    await SubscriptionHistory.destroy({ where: { companyId: company.id } });
    await Contact.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Message.destroy({ where: {} });
    await Notification.destroy({ where: {} });

    // 4. Seed Subscription Histories
    await SubscriptionHistory.bulkCreate([
        {
            companyId: company.id,
            planName: 'Pro',
            action: 'subscribed',
            billingCycle: 'monthly',
            price: 49.00,
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: 'paid',
        },
        {
            companyId: company.id,
            planName: 'Basic',
            action: 'upgraded',
            billingCycle: 'monthly',
            price: 29.00,
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            status: 'paid',
        }
    ]);

    // 5. Seed Contacts
    const contactsData = [
        { fullName: 'John Doe', phone: '+15556667777', companyName: 'Acme Corp', status: 'active', assignedAgentId: agentUser.id, avatarUrl: '/uploads/avatars/john.jpg', followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
        { fullName: 'Jane Smith', phone: '+15551234567', companyName: 'Globex Corp', status: 'active', assignedAgentId: agentUser.id, avatarUrl: '/uploads/avatars/jane.jpg', followUpDate: null },
        { fullName: 'Alice Johnson', phone: '+15559876543', companyName: 'Initech', status: 'active', assignedAgentId: agentUser.id, avatarUrl: null, followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        { fullName: 'Bob Brown', phone: '+15554443333', companyName: 'Umbrella Corp', status: 'active', assignedAgentId: null, avatarUrl: null, followUpDate: null },
        { fullName: 'Charlie Davis', phone: '+15552221111', companyName: 'Hooli', status: 'active', assignedAgentId: agentUser.id, avatarUrl: null, followUpDate: null },
        { fullName: 'Diana Prince', phone: '+15558889999', companyName: 'Wayne Enterprises', status: 'active', assignedAgentId: agentUser.id, avatarUrl: null, followUpDate: null },
        { fullName: 'Edward Nigma', phone: '+15557770000', companyName: 'Enigma Labs', status: 'inactive', assignedAgentId: null, avatarUrl: null, followUpDate: null },
    ];
    const contacts = await Contact.bulkCreate(contactsData);

    // 6. Seed Call Logs (within last 90 days)
    const callLogsData = [
        // John Doe - Follow-up
        { contactId: contacts[0].id, agentUserId: agentUser.id, outcome: 'Follow-up', status: 'completed', durationSeconds: 120, startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), recordingUrl: '/uploads/recordings/call-john.mp3' },
        // Jane Smith - Connected/Answered
        { contactId: contacts[1].id, agentUserId: agentUser.id, outcome: 'Connected', status: 'completed', durationSeconds: 245, startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recordingUrl: '/uploads/recordings/call-jane.mp3' },
        // Alice Johnson - Missed
        { contactId: contacts[2].id, agentUserId: agentUser.id, outcome: 'Missed', status: 'missed', durationSeconds: 0, startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), recordingUrl: null },
        // Charlie Davis - No Answer
        { contactId: contacts[4].id, agentUserId: agentUser.id, outcome: 'No Answer', status: 'completed', durationSeconds: 15, startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), recordingUrl: null },
        // Diana Prince - Failed
        { contactId: contacts[5].id, agentUserId: agentUser.id, outcome: 'Failed', status: 'completed', durationSeconds: 0, startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), recordingUrl: null },
        
        // Historical logs for percentage comparison
        { contactId: contacts[0].id, agentUserId: agentUser.id, outcome: 'Connected', status: 'completed', durationSeconds: 180, startedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), recordingUrl: null },
        { contactId: contacts[1].id, agentUserId: agentUser.id, outcome: 'Follow-up', status: 'completed', durationSeconds: 90, startedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), recordingUrl: null },
        { contactId: contacts[2].id, agentUserId: agentUser.id, outcome: 'Connected', status: 'completed', durationSeconds: 300, startedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), recordingUrl: null },
    ];
    await CallLog.bulkCreate(callLogsData);

    // 7. Seed Products
    const productsData = [
        { name: 'Cosmetic Serum A', category: 'Cosmetics', status: 'Available', qty: 50, sold: 120, price: 15.99, userId: agentUser.id },
        { name: 'Pro Headset BH-10', category: 'Electronics', status: 'Available', qty: 20, sold: 45, price: 59.99, userId: agentUser.id },
        { name: 'Basic Keyboard K-20', category: 'Electronics', status: 'Out of stock', qty: 0, sold: 80, price: 25.00, userId: agentUser.id },
        { name: 'Lip Balm Honey', category: 'Cosmetics', status: 'Available', qty: 100, sold: 300, price: 4.50, userId: agentUser.id },
        { name: 'Face Wash Charcoal', category: 'Cosmetics', status: 'Available', qty: 15, sold: 150, price: 9.99, userId: agentUser.id },
        { name: 'USB-C Cable 2m', category: 'Electronics', status: 'Available', qty: 200, sold: 500, price: 12.99, userId: agentUser.id },
        { name: 'Ergonomic Mouse M-5', category: 'Electronics', status: 'Out of stock', qty: 0, sold: 60, price: 35.00, userId: agentUser.id },
        { name: 'Hand Cream Shea', category: 'Cosmetics', status: 'Available', qty: 85, sold: 200, price: 7.99, userId: agentUser.id },
        { name: 'Cosmetic Brush Set', category: 'Cosmetics', status: 'Available', qty: 40, sold: 90, price: 22.50, userId: agentUser.id },
        { name: 'Wireless Charger W-1', category: 'Electronics', status: 'Available', qty: 30, sold: 110, price: 29.99, userId: agentUser.id },
    ];
    
    // Add createdAt manipulation to show changes in dashboard
    for (let i = 0; i < productsData.length; i++) {
        const prod = await Product.create(productsData[i]);
        if (i < 3) {
            // Older products
            await prod.update({ 
                createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
            });
        }
    }

    // 8. Seed Chat Messages
    await Message.bulkCreate([
        { companyId: company.id, senderUserId: adminUser.id, content: 'Welcome to the FlutterCraft LLC support thread.', status: 'read', sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { companyId: company.id, senderUserId: agentUser.id, content: 'Hi! I need some guidance on uploading bulk products.', status: 'read', sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { companyId: company.id, senderUserId: adminUser.id, content: 'Sure, you can use the product import feature in the Admin panel. I will attach a template.', status: 'read', sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { companyId: company.id, senderUserId: adminUser.id, content: 'Template CSV', attachmentUrl: '/uploads/chat/template.csv', attachmentOriginalName: 'template.csv', status: 'sent', sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { companyId: company.id, senderUserId: agentUser.id, content: 'Thank you so much! Let me review this template.', status: 'sent', sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    ]);

    // 9. Seed Notifications
    await Notification.bulkCreate([
        { userId: agentUser.id, title: 'New call from Alice Johnson', body: 'Missed call at 10:30 AM', type: 'missed_call', isRead: false, isArchived: false, contactId: contacts[2].id, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { userId: agentUser.id, title: 'Follow-up Reminder', body: 'Follow up with John Doe is due tomorrow.', type: 'follow_up_reminder', isRead: false, isArchived: false, contactId: contacts[0].id, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
        { userId: agentUser.id, title: 'Branding Approved', body: 'Your company branding updates have been approved by Admin.', type: 'system', isRead: true, isArchived: false, contactId: null, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { userId: agentUser.id, title: 'Archived Alert', body: 'This is an archived system notification.', type: 'system', isRead: true, isArchived: true, contactId: null, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    ]);

    console.log('Demo data seeded successfully!');
    process.exit(0);
};

seed().catch(err => {
    console.error('Failed to seed demo data:', err);
    process.exit(1);
});
