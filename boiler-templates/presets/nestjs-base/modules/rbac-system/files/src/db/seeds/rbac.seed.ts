import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../database/entities/role.entity';
import { User } from '../../../../../../../database/entities/user.entity';
import { ROLES, getAllRoles } from '../../common/rbac/roles';

/**
 * Seed RBAC roles and permissions
 */
export async function seedRbac(dataSource: DataSource): Promise<void> {
  console.log('🌱 Starting RBAC seeding...');

  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);

  try {
    // 1. Create all default roles
    console.log('👥 Creating default roles...');
    const createdRoles: Role[] = [];

    for (const roleDefinition of getAllRoles()) {
      const existingRole = await roleRepository.findOne({
        where: { name: roleDefinition.name },
      });

      if (!existingRole) {
        const role = roleRepository.create({
          name: roleDefinition.name,
          displayName: roleDefinition.displayName,
          description: roleDefinition.description,
          permissions: roleDefinition.permissions,
          isSystem: roleDefinition.isSystem,
          priority: roleDefinition.priority,
          isActive: true,
        });

        const savedRole = await roleRepository.save(role);
        createdRoles.push(savedRole);
        console.log(`✅ Created role: ${roleDefinition.displayName} with ${roleDefinition.permissions.length} permissions`);
      } else {
        // Update existing role permissions if needed
        existingRole.permissions = roleDefinition.permissions;
        existingRole.priority = roleDefinition.priority;
        existingRole.isSystem = roleDefinition.isSystem;
        const updatedRole = await roleRepository.save(existingRole);
        createdRoles.push(updatedRole);
        console.log(`⚠️  Updated existing role: ${roleDefinition.name}`);
      }
    }

    // 2. Create super admin user if it doesn't exist
    console.log('👤 Creating super admin user...');

    const superAdminEmail = process.env.RBAC_SUPER_ADMIN_EMAIL || 'admin@{{projectName}}.com';
    const superAdminPassword = process.env.RBAC_SUPER_ADMIN_PASSWORD || 'Admin@123456';

    const existingSuperAdmin = await userRepository.findOne({
      where: { email: superAdminEmail },
    });

    if (!existingSuperAdmin) {
      const superAdminRole = createdRoles.find(r => r.name === ROLES.super_admin.name);

      if (superAdminRole) {
        const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

        const superAdmin = userRepository.create({
          email: superAdminEmail,
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          isActive: true,
          isSuperAdmin: true,
          role: superAdminRole,
        });

        await userRepository.save(superAdmin);
        console.log(`✅ Created super admin user: ${superAdminEmail}`);
      } else {
        console.error('❌ Super admin role not found!');
      }
    } else {
      console.log(`⚠️  Super admin user already exists: ${superAdminEmail}`);
    }

    // 3. Create sample users for each role (optional, for development)
    if (process.env.NODE_ENV === 'development') {
      console.log('👥 Creating sample users for development...');

      const sampleUsers = [
        {
          email: 'admin@{{projectName}}.com',
          password: 'Password@123',
          firstName: 'Admin',
          lastName: 'User',
          roleName: ROLES.admin.name,
        },
        {
          email: 'manager@{{projectName}}.com',
          password: 'Password@123',
          firstName: 'Manager',
          lastName: 'User',
          roleName: ROLES.manager.name,
        },
        {
          email: 'editor@{{projectName}}.com',
          password: 'Password@123',
          firstName: 'Editor',
          lastName: 'User',
          roleName: ROLES.editor.name,
        },
        {
          email: 'viewer@{{projectName}}.com',
          password: 'Password@123',
          firstName: 'Viewer',
          lastName: 'User',
          roleName: ROLES.viewer.name,
        },
      ];

      for (const userData of sampleUsers) {
        const existingUser = await userRepository.findOne({
          where: { email: userData.email },
        });

        if (!existingUser) {
          const role = createdRoles.find(r => r.name === userData.roleName);
          if (role) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = userRepository.create({
              email: userData.email,
              password: hashedPassword,
              firstName: userData.firstName,
              lastName: userData.lastName,
              isActive: true,
              role: role,
            });

            await userRepository.save(user);
            console.log(`✅ Created sample user: ${userData.email} (${userData.roleName})`);
          }
        }
      }
    }

    console.log('\n🎉 RBAC seeding completed successfully!');
    console.log('\n📋 Default Roles Created:');
    createdRoles.forEach(role => {
      console.log(`  - ${role.displayName} (${role.name}): ${role.permissions.length} permissions`);
    });

    console.log('\n🔐 Login Credentials:');
    console.log(`  Super Admin: ${superAdminEmail} / ${superAdminPassword}`);

    if (process.env.NODE_ENV === 'development') {
      console.log('  Admin: admin@{{projectName}}.com / Password@123');
      console.log('  Manager: manager@{{projectName}}.com / Password@123');
      console.log('  Editor: editor@{{projectName}}.com / Password@123');
      console.log('  Viewer: viewer@{{projectName}}.com / Password@123');
    }

  } catch (error) {
    console.error('❌ Error during RBAC seeding:', error);
    throw error;
  }
}