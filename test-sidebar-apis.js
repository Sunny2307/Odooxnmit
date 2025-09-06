const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSidebarAPIs() {
  try {
    console.log('🔍 Testing Sidebar API Data...\n');

    // Get the test user
    const user = await prisma.user.findFirst({
      where: { username: 'testuser' },
      select: { id: true, name: true, username: true }
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`👤 Testing for user: ${user.name} (@${user.username})`);

    // Test 1: Check user tasks
    console.log('\n📋 Testing User Tasks...');
    const userTasks = await prisma.task.findMany({
      where: { 
        OR: [
          { assignedToId: user.id },
          { createdById: user.id }
        ]
      },
      include: {
        project: {
          select: { name: true }
        },
        assignedTo: {
          select: { name: true, username: true }
        }
      }
    });

    console.log(`   Found ${userTasks.length} tasks:`);
    userTasks.forEach(task => {
      console.log(`   - "${task.title}" (${task.status}) - Project: ${task.project.name}`);
    });

    // Test 2: Check personal todos
    console.log('\n✅ Testing Personal Todos...');
    const personalTodos = await prisma.personalTodo.findMany({
      where: { userId: user.id }
    });

    console.log(`   Found ${personalTodos.length} personal todos:`);
    personalTodos.forEach(todo => {
      console.log(`   - "${todo.title}" (${todo.completed ? 'Completed' : 'Pending'})`);
    });

    // Test 3: Calculate counts like the sidebar does
    console.log('\n📊 Calculating Sidebar Counts...');
    
    const projectTaskCounts = {
      total: userTasks.length,
      todo: userTasks.filter(task => task.status === 'To-Do').length,
      inProgress: userTasks.filter(task => task.status === 'In Progress').length,
      done: userTasks.filter(task => task.status === 'Done').length,
      overdue: userTasks.filter(task => {
        if (!task.dueDate || task.status === 'Done') return false;
        return new Date(task.dueDate) < new Date();
      }).length
    };

    const personalTodoCounts = {
      total: personalTodos.length,
      pending: personalTodos.filter(todo => !todo.completed).length,
      completed: personalTodos.filter(todo => todo.completed).length,
      overdue: personalTodos.filter(todo => {
        if (!todo.dueDate || todo.completed) return false;
        return new Date(todo.dueDate) < new Date();
      }).length
    };

    console.log('   Project Task Counts:', projectTaskCounts);
    console.log('   Personal Todo Counts:', personalTodoCounts);

    // Test 4: Check if user is member of any projects
    console.log('\n🏢 Testing Project Memberships...');
    const projectMemberships = await prisma.projectMember.findMany({
      where: { userId: user.id },
      include: {
        project: {
          select: { name: true }
        }
      }
    });

    console.log(`   User is member of ${projectMemberships.length} projects:`);
    projectMemberships.forEach(membership => {
      console.log(`   - "${membership.project.name}" (${membership.role})`);
    });

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing sidebar APIs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSidebarAPIs();
