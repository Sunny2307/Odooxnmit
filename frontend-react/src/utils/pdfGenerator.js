import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Chart from 'chart.js/auto';

// Generate PDF with charts for data export
export const generateDataExportPDF = async (data, userInfo) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with word wrap
  const addText = (text, x, y, maxWidth = pageWidth - 40) => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * 7);
  };

  // Helper function to add a new page if needed
  const checkNewPage = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('TeamNest Data Export Report', 20, yPosition);
  yPosition += 10;

  // User Info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(`Generated for: ${userInfo.name} (${userInfo.email})`, 20, yPosition);
  yPosition = addText(`Export Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
  yPosition = addText(`Report Period: All Time`, 20, yPosition);
  yPosition += 15;

  // Summary Statistics
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Summary Statistics', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(`Total Projects: ${data.totalProjects}`, 20, yPosition);
  yPosition = addText(`Total Tasks: ${data.totalTasks}`, 20, yPosition);
  yPosition = addText(`Total Personal Todos: ${data.totalTodos}`, 20, yPosition);
  yPosition = addText(`Total Notifications: ${data.totalNotifications}`, 20, yPosition);
  yPosition += 15;

  // Projects Section
  checkNewPage(30);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Projects Overview', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  // Created Projects
  if (data.projects.created.length > 0) {
    yPosition = addText('Projects Created:', 20, yPosition);
    yPosition += 5;
    data.projects.created.forEach(project => {
      checkNewPage(15);
      yPosition = addText(`• ${project.name} (${project.taskCount} tasks, ${project.memberCount} members)`, 30, yPosition);
    });
    yPosition += 10;
  }

  // Member Projects
  if (data.projects.memberOf.length > 0) {
    yPosition = addText('Projects Member Of:', 20, yPosition);
    yPosition += 5;
    data.projects.memberOf.forEach(project => {
      checkNewPage(15);
      yPosition = addText(`• ${project.projectName} (${project.role}, ${project.taskCount} tasks)`, 30, yPosition);
    });
    yPosition += 15;
  }

  // Tasks Section
  checkNewPage(30);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Tasks Overview', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  // Task Statistics
  const taskStats = {
    todo: data.tasks.filter(task => task.status === 'To-Do').length,
    inProgress: data.tasks.filter(task => task.status === 'In Progress').length,
    completed: data.tasks.filter(task => task.status === 'Done').length,
    overdue: data.tasks.filter(task => {
      if (!task.dueDate || task.status === 'Done') return false;
      return new Date(task.dueDate) < new Date();
    }).length
  };

  yPosition = addText(`To-Do Tasks: ${taskStats.todo}`, 20, yPosition);
  yPosition = addText(`In Progress Tasks: ${taskStats.inProgress}`, 20, yPosition);
  yPosition = addText(`Completed Tasks: ${taskStats.completed}`, 20, yPosition);
  yPosition = addText(`Overdue Tasks: ${taskStats.overdue}`, 20, yPosition);
  yPosition += 15;

  // Recent Tasks
  if (data.tasks.length > 0) {
    yPosition = addText('Recent Tasks:', 20, yPosition);
    yPosition += 5;
    data.tasks.slice(0, 10).forEach(task => {
      checkNewPage(15);
      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
      yPosition = addText(`• ${task.title} (${task.status}) - Due: ${dueDate}`, 30, yPosition);
    });
    yPosition += 15;
  }

  // Personal Todos Section
  checkNewPage(30);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Personal Todos Overview', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const todoStats = {
    pending: data.personalTodos.filter(todo => !todo.completed).length,
    completed: data.personalTodos.filter(todo => todo.completed).length,
    overdue: data.personalTodos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false;
      return new Date(todo.dueDate) < new Date();
    }).length
  };

  yPosition = addText(`Pending Todos: ${todoStats.pending}`, 20, yPosition);
  yPosition = addText(`Completed Todos: ${todoStats.completed}`, 20, yPosition);
  yPosition = addText(`Overdue Todos: ${todoStats.overdue}`, 20, yPosition);
  yPosition += 15;

  // Recent Personal Todos
  if (data.personalTodos.length > 0) {
    yPosition = addText('Recent Personal Todos:', 20, yPosition);
    yPosition += 5;
    data.personalTodos.slice(0, 10).forEach(todo => {
      checkNewPage(15);
      const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';
      const status = todo.completed ? 'Completed' : 'Pending';
      yPosition = addText(`• ${todo.title} (${status}) - Due: ${dueDate}`, 30, yPosition);
    });
    yPosition += 15;
  }

  // Footer
  checkNewPage(20);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  yPosition = addText('Generated by TeamNest - Team Collaboration Platform', 20, pageHeight - 20);

  return pdf;
};

// Generate PDF with charts for productivity reports
export const generateReportPDF = async (reportData, reportType) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper functions (same as above)
  const addText = (text, x, y, maxWidth = pageWidth - 40) => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * 7);
  };

  const checkNewPage = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Productivity Report`, 20, yPosition);
  yPosition += 10;

  // Report Info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(`Generated for: ${reportData.user.name} (${reportData.user.email})`, 20, yPosition);
  yPosition = addText(`Report Period: ${new Date(reportData.statistics.period.start).toLocaleDateString()} - ${new Date(reportData.statistics.period.end).toLocaleDateString()}`, 20, yPosition);
  yPosition = addText(`Generated on: ${new Date(reportData.generatedAt).toLocaleDateString()}`, 20, yPosition);
  yPosition += 15;

  // Executive Summary
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Executive Summary', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(`Completion Rate: ${reportData.statistics.productivity.completionRate}%`, 20, yPosition);
  yPosition = addText(`Average Completion Time: ${reportData.statistics.productivity.averageCompletionTime}`, 20, yPosition);
  yPosition = addText(`Most Productive Day: ${reportData.statistics.productivity.mostProductiveDay}`, 20, yPosition);
  yPosition += 15;

  // Task Statistics
  checkNewPage(30);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Task Statistics', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(`Total Tasks: ${reportData.statistics.tasks.total}`, 20, yPosition);
  yPosition = addText(`Completed Tasks: ${reportData.statistics.tasks.completed}`, 20, yPosition);
  yPosition = addText(`In Progress Tasks: ${reportData.statistics.tasks.inProgress}`, 20, yPosition);
  yPosition = addText(`To-Do Tasks: ${reportData.statistics.tasks.todo}`, 20, yPosition);
  yPosition = addText(`Overdue Tasks: ${reportData.statistics.tasks.overdue}`, 20, yPosition);
  yPosition += 15;

  // Personal Todo Statistics
  checkNewPage(30);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Personal Todo Statistics', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(`Total Personal Todos: ${reportData.statistics.personalTodos.total}`, 20, yPosition);
  yPosition = addText(`Completed Todos: ${reportData.statistics.personalTodos.completed}`, 20, yPosition);
  yPosition = addText(`Pending Todos: ${reportData.statistics.personalTodos.pending}`, 20, yPosition);
  yPosition = addText(`Overdue Todos: ${reportData.statistics.personalTodos.overdue}`, 20, yPosition);
  yPosition += 15;

  // Project Performance
  if (Object.keys(reportData.statistics.productivity.topProject).length > 0) {
    checkNewPage(30);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('Project Performance', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    Object.entries(reportData.statistics.productivity.topProject).forEach(([project, count]) => {
      yPosition = addText(`${project}: ${count} tasks`, 20, yPosition);
    });
    yPosition += 15;
  }

  // Recent Activities
  checkNewPage(30);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Recent Activities', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  // Recent Tasks
  if (reportData.tasks.length > 0) {
    yPosition = addText('Recent Tasks:', 20, yPosition);
    yPosition += 5;
    reportData.tasks.slice(0, 10).forEach(task => {
      checkNewPage(15);
      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
      yPosition = addText(`• ${task.title} (${task.status}) - Project: ${task.project}`, 30, yPosition);
    });
    yPosition += 15;
  }

  // Recent Personal Todos
  if (reportData.personalTodos.length > 0) {
    yPosition = addText('Recent Personal Todos:', 20, yPosition);
    yPosition += 5;
    reportData.personalTodos.slice(0, 10).forEach(todo => {
      checkNewPage(15);
      const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';
      const status = todo.completed ? 'Completed' : 'Pending';
      yPosition = addText(`• ${todo.title} (${status}) - Priority: ${todo.priority}`, 30, yPosition);
    });
    yPosition += 15;
  }

  // Footer
  checkNewPage(20);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  yPosition = addText('Generated by TeamNest - Team Collaboration Platform', 20, pageHeight - 20);

  return pdf;
};

// Generate PDF with charts for activity log
export const generateActivityLogPDF = async (activityData, userInfo) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper functions (same as above)
  const addText = (text, x, y, maxWidth = pageWidth - 40) => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * 7);
  };

  const checkNewPage = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Activity Log Report', 20, yPosition);
  yPosition += 10;

  // Report Info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(`Generated for: ${userInfo.name} (${userInfo.email})`, 20, yPosition);
  yPosition = addText(`Report Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
  yPosition = addText(`Total Activities: ${activityData.length}`, 20, yPosition);
  yPosition += 15;

  // Activity Summary
  const activitySummary = {
    tasks: activityData.filter(activity => activity.type === 'task').length,
    todos: activityData.filter(activity => activity.type === 'todo').length,
    notifications: activityData.filter(activity => activity.type === 'notification').length
  };

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Activity Summary', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  yPosition = addText(`Task Activities: ${activitySummary.tasks}`, 20, yPosition);
  yPosition = addText(`Todo Activities: ${activitySummary.todos}`, 20, yPosition);
  yPosition = addText(`Notification Activities: ${activitySummary.notifications}`, 20, yPosition);
  yPosition += 15;

  // Recent Activities
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  yPosition = addText('Recent Activities', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  activityData.forEach((activity, index) => {
    checkNewPage(20);
    
    // Activity header
    const actionText = activity.action === 'completed' ? 'Completed' :
                      activity.action === 'started' ? 'Started' :
                      activity.action === 'created' ? 'Created' :
                      activity.action === 'received' ? 'Received' : activity.action;
    
    yPosition = addText(`${index + 1}. ${actionText} ${activity.title}`, 20, yPosition);
    
    // Activity details
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    yPosition = addText(`   Type: ${activity.type} | Status: ${activity.status}`, 20, yPosition);
    yPosition = addText(`   Date: ${new Date(activity.timestamp).toLocaleString()}`, 20, yPosition);
    
    if (activity.project) {
      yPosition = addText(`   Project: ${activity.project}`, 20, yPosition);
    }
    
    yPosition += 10;
    pdf.setFontSize(12);
  });

  // Footer
  checkNewPage(20);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  yPosition = addText('Generated by TeamNest - Team Collaboration Platform', 20, pageHeight - 20);

  return pdf;
};

// Helper function to download PDF
export const downloadPDF = (pdf, filename) => {
  pdf.save(filename);
};
