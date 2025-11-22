import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://127.0.0.1:3000/api';

async function main() {
    console.log('🚀 Starting verification...');

    // 1. Create Test User
    const testUserEmail = 'admin@test.com';
    const testUserPassword = 'password123';

    let user = await prisma.user.findUnique({ where: { email: testUserEmail } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: testUserEmail,
                name: 'Admin User',
                password: testUserPassword,
                role: 'SUPER_ADMIN',
            },
        });
        console.log('✅ Created test user');
    } else {
        console.log('ℹ️ Test user already exists');
    }

    // 2. Test Login
    console.log('\n🔐 Testing Login...');
    let token = '';
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUserEmail,
                password: testUserPassword,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }

        const data = await response.json() as any;
        token = data.access_token;
        console.log('✅ Login successful, token received');
    } catch (error: any) {
        console.error('❌ Login failed:', error.message);
        process.exit(1);
    }

    // 3. Test Protected Route (Drivers List)
    console.log('\n🛡️ Testing Protected Route (With Token)...');
    try {
        const response = await fetch(`${API_URL}/drivers`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }

        const data = await response.json() as any;
        console.log(`✅ Access granted. Total drivers: ${data.total}`);
    } catch (error: any) {
        console.error('❌ Access failed:', error.message);
    }

    // 4. Test Protected Route (Without Token)
    console.log('\n🚫 Testing Protected Route (Without Token)...');
    try {
        const response = await fetch(`${API_URL}/drivers`);
        if (response.status === 401) {
            console.log('✅ Access denied as expected (401)');
        } else {
            console.error(`❌ Unexpected status: ${response.status}`);
        }
    } catch (error: any) {
        console.error('❌ Unexpected error:', error.message);
    }

    // 5. Test Input Validation
    console.log('\n✨ Testing Input Validation...');
    try {
        const response = await fetch(`${API_URL}/drivers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: 'Invalid Driver', email: 'not-an-email' }),
        });

        if (response.status === 400) {
            const error = await response.json() as any;
            console.log('✅ Validation failed as expected (400)');
            console.log('   Error message:', JSON.stringify(error.message));
        } else {
            console.error(`❌ Unexpected status: ${response.status}`);
        }
    } catch (error: any) {
        console.error('❌ Unexpected error:', error.message);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
