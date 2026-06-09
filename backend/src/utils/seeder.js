'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { sequelize, User, Kategori } = require('../models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi database berhasil');

    await sequelize.sync({ alter: false });
    console.log('✅ Sinkronisasi database selesai\n');

    // ─── Seed Kategori ────────────────────────────────────────────────────────
    console.log('📦 Seeding kategori...');
    const kategoris = [
      { nama: 'Infrastruktur', deskripsi: 'Jalan rusak, jembatan, drainase, fasilitas umum', warna: '#7a3dff' },
      { nama: 'Lingkungan', deskripsi: 'Sampah, pencemaran, pohon tumbang, banjir', warna: '#3b89ff' },
      { nama: 'Sosial', deskripsi: 'Ketertiban masyarakat, konflik sosial, bantuan sosial', warna: '#ed52cb' },
      { nama: 'Pelayanan Publik', deskripsi: 'Layanan administrasi, perizinan, kesehatan, pendidikan', warna: '#ff6b00' },
      { nama: 'Keamanan', deskripsi: 'Kriminalitas, vandalisme, ketertiban umum', warna: '#00d722' },
    ];

    for (const kat of kategoris) {
      await Kategori.findOrCreate({
        where: { nama: kat.nama },
        defaults: kat,
      });
    }
    console.log(`  ✓ ${kategoris.length} kategori berhasil di-seed`);

    // ─── Seed Super Admin ─────────────────────────────────────────────────────
    console.log('\n📦 Seeding super admin...');
    const [superAdmin, createdSA] = await User.findOrCreate({
      where: { email: 'superadmin@laporkdm.id' },
      defaults: {
        nama: 'Super Admin',
        email: 'superadmin@laporkdm.id',
        password: 'admin123',
        role: 'super_admin',
        is_active: true,
      },
    });
    if (createdSA) {
      console.log('  ✓ Super Admin dibuat');
      console.log('    📧 Email    : superadmin@laporkdm.id');
      console.log('    🔑 Password : admin123');
    } else {
      console.log('  ℹ Super Admin sudah ada, skip');
    }

    // ─── Seed Admin ───────────────────────────────────────────────────────────
    console.log('\n📦 Seeding admin...');
    const [admin, createdAdmin] = await User.findOrCreate({
      where: { email: 'admin@laporkdm.id' },
      defaults: {
        nama: 'Admin KDM',
        email: 'admin@laporkdm.id',
        password: 'admin123',
        role: 'admin',
        is_active: true,
      },
    });
    if (createdAdmin) {
      console.log('  ✓ Admin dibuat');
      console.log('    📧 Email    : admin@laporkdm.id');
      console.log('    🔑 Password : admin123');
    } else {
      console.log('  ℹ Admin sudah ada, skip');
    }

    // ─── Seed User Contoh ─────────────────────────────────────────────────────
    console.log('\n📦 Seeding user contoh...');
    const [user, createdUser] = await User.findOrCreate({
      where: { email: 'user@laporkdm.id' },
      defaults: {
        nama: 'Budi Santoso',
        email: 'user@laporkdm.id',
        password: 'user123',
        role: 'user',
        is_active: true,
      },
    });
    if (createdUser) {
      console.log('  ✓ User contoh dibuat');
      console.log('    📧 Email    : user@laporkdm.id');
      console.log('    🔑 Password : user123');
    } else {
      console.log('  ℹ User contoh sudah ada, skip');
    }

    console.log('\n═══════════════════════════════════════');
    console.log('  ✅ Seeding selesai!');
    console.log('═══════════════════════════════════════\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error.message);
    process.exit(1);
  }
};

seedData();
