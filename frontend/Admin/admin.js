// ========================================
// MIXLAB ADMIN PANEL - COMPLETE JAVASCRIPT
// ========================================

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentMonth = new Date();
        this.selectedAppointmentId = null;
        this.charts = {};
        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.initializeCharts();
        this.loadUsers();
        this.loadAppointments();
        this.loadModules();
        this.loadAnnouncements();
        this.loadActivityLogs();
        this.generateCalendar();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Toggle sidebar on mobile
        const toggleBtn = document.querySelector('.toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        }

        // Date filter
        const applyFilterBtn = document.getElementById('applyDateFilter');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => this.applyDateFilter());
        }

        // User management
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.openUserForm());
        }

        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => this.handleUserFormSubmit(e));
        }

        // Appointments
        document.querySelectorAll('.appointment-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchAppointmentTab(btn.dataset.tab));
        });

        document.getElementById('prevMonth').addEventListener('click', () => this.prevMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());

        // Content management
        document.querySelectorAll('.content-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchContentTab(btn.dataset.tab));
        });

        const addModuleBtn = document.getElementById('addModuleBtn');
        if (addModuleBtn) {
            addModuleBtn.addEventListener('click', () => this.openModuleForm());
        }

        const moduleForm = document.getElementById('moduleForm');
        if (moduleForm) {
            moduleForm.addEventListener('submit', (e) => this.handleModuleFormSubmit(e));
        }

        // Analytics
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }

        document.getElementById('exportPdfBtn').addEventListener('click', () => this.exportReportPDF());
        document.getElementById('exportExcelBtn').addEventListener('click', () => this.exportReportExcel());
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportReportCSV());

        // Announcements
        const createAnnouncementBtn = document.getElementById('createNewAnnouncementBtn');
        if (createAnnouncementBtn) {
            createAnnouncementBtn.addEventListener('click', () => this.openAnnouncementForm());
        }

        const announcementForm = document.getElementById('announcementForm');
        if (announcementForm) {
            announcementForm.addEventListener('submit', (e) => this.handleAnnouncementFormSubmit(e));
        }

        const scheduleCheckbox = document.getElementById('scheduleAnnouncement');
        if (scheduleCheckbox) {
            scheduleCheckbox.addEventListener('change', () => {
                document.getElementById('scheduleDateGroup').style.display = 
                    scheduleCheckbox.checked ? 'block' : 'none';
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Quick actions
        document.getElementById('createAnnouncementBtn')?.addEventListener('click', () => {
            this.switchSection('announcements');
            this.openAnnouncementForm();
        });

        document.getElementById('viewBookingsBtn')?.addEventListener('click', () => {
            this.switchSection('appointments');
            document.querySelector('[data-tab="table"]').click();
        });
    }

    // ========================================
    // SECTION MANAGEMENT
    // ========================================
    switchSection(section) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => {
            s.classList.remove('active');
        });

        // Show selected section
        const selectedSection = document.getElementById(section);
        if (selectedSection) {
            selectedSection.classList.add('active');
            document.getElementById('pageTitle').textContent = this.getSectionTitle(section);
        }

        this.currentSection = section;

        // Trigger section-specific data loading
        if (section === 'appointments') {
            this.generateCalendar();
        } else if (section === 'analytics') {
            this.loadAnalyticsData();
        }
    }

    getSectionTitle(section) {
        const titles = {
            dashboard: 'Dashboard',
            users: 'User Management',
            appointments: 'Appointments',
            content: 'Learning Content',
            analytics: 'Analytics & Reports',
            announcements: 'Announcements',
            logs: 'Activity Logs'
        };
        return titles[section] || 'Dashboard';
    }

    // ========================================
    // DASHBOARD
    // ========================================
    loadDashboardData() {
        // Sample data - replace with API calls
        const dashboardData = {
            totalRevenue: 24500,
            totalStudents: 342,
            totalAppointments: 156,
            activeUsers: 298,
            pendingAppointments: 23,
            completionRate: 87
        };

        document.getElementById('totalRevenue').textContent = dashboardData.totalRevenue.toLocaleString();
        document.getElementById('totalStudents').textContent = dashboardData.totalStudents;
        document.getElementById('totalAppointments').textContent = dashboardData.totalAppointments;
        document.getElementById('activeUsers').textContent = dashboardData.activeUsers;
        document.getElementById('pendingAppointments').textContent = dashboardData.pendingAppointments;
        document.getElementById('completionRate').textContent = dashboardData.completionRate;
    }

    initializeCharts() {
        this.createRevenueChart();
        this.createServiceChart();
        this.createEngagementChart();
        this.createPerformanceChart();
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [5000, 7200, 6800, 9100, 10500, 12300],
                    borderColor: '#5b5bff',
                    backgroundColor: 'rgba(91, 91, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#5b5bff',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: { font: { size: 12 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createServiceChart() {
        const ctx = document.getElementById('serviceChart');
        if (!ctx) return;

        this.charts.service = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Piano Lessons', 'Guitar Lessons', 'Drum Lessons'],
                datasets: [{
                    data: [45, 35, 20],
                    backgroundColor: ['#5b5bff', '#10b981', '#f59e0b'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createEngagementChart() {
        const ctx = document.getElementById('engagementChart');
        if (!ctx) return;

        this.charts.engagement = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Active Users',
                    data: [120, 150, 130, 180, 160, 140, 100],
                    backgroundColor: '#5b5bff',
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'x',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        this.charts.performance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Completion', 'Engagement', 'Performance', 'Attendance', 'Feedback'],
                datasets: [{
                    label: 'Metrics',
                    data: [85, 75, 80, 90, 78],
                    borderColor: '#5b5bff',
                    backgroundColor: 'rgba(91, 91, 255, 0.1)',
                    pointBackgroundColor: '#5b5bff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    applyDateFilter() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        console.log('Filter applied:', startDate, 'to', endDate);
        // Implement date-based filtering logic here
    }

    // ========================================
    // USER MANAGEMENT
    // ========================================
    loadUsers() {
        const users = [
            { id: 1, username: 'john_musician', email: 'john@example.com', role: 'student', date: '2024-01-15', status: 'active' },
            { id: 2, username: 'sarah_piano', email: 'sarah@example.com', role: 'instructor', date: '2024-01-20', status: 'active' },
            { id: 3, username: 'mike_guitar', email: 'mike@example.com', role: 'student', date: '2024-02-01', status: 'inactive' },
            { id: 4, username: 'emma_admin', email: 'emma@example.com', role: 'admin', date: '2023-12-10', status: 'active' },
            { id: 5, username: 'alex_drums', email: 'alex@example.com', role: 'instructor', date: '2024-01-25', status: 'active' }
        ];

        this.renderUsersTable(users);
        this.setupUserFilters(users);
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.username}</strong></td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.date}</td>
                <td>
                    <span class="status-badge status-${user.status}">
                        ${user.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary" onclick="admin.viewUserDetails(${user.id})">View</button>
                    <button class="btn btn-secondary" onclick="admin.editUser(${user.id})">Edit</button>
                    <button class="btn btn-danger" onclick="admin.deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    setupUserFilters(users) {
        const searchInput = document.getElementById('userSearchInput');
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');

        const filterUsers = () => {
            const search = searchInput.value.toLowerCase();
            const role = roleFilter.value;
            const status = statusFilter.value;

            const filtered = users.filter(user =>
                (user.username.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)) &&
                (!role || user.role === role) &&
                (!status || user.status === status)
            );

            this.renderUsersTable(filtered);
        };

        searchInput?.addEventListener('input', filterUsers);
        roleFilter?.addEventListener('change', filterUsers);
        statusFilter?.addEventListener('change', filterUsers);
    }

    openUserForm(userId = null) {
        const modal = document.getElementById('userFormModal');
        const title = document.getElementById('userFormTitle');

        if (userId) {
            title.textContent = 'Edit User';
            // Load user data
        } else {
            title.textContent = 'Add New User';
            document.getElementById('userForm').reset();
        }

        modal.classList.add('active');
    }

    handleUserFormSubmit(e) {
        e.preventDefault();
        const username = document.getElementById('userUsername').value;
        const email = document.getElementById('userEmail').value;
        const role = document.getElementById('userRole').value;
        const status = document.getElementById('userStatus').value;

        console.log('User form submitted:', { username, email, role, status });
        alert('User saved successfully!');
        document.getElementById('userFormModal').classList.remove('active');
        this.loadUsers(); // Reload users
    }

    viewUserDetails(userId) {
        const modal = document.getElementById('userDetailsModal');
        const content = document.getElementById('userDetailsContent');

        content.innerHTML = `
            <div class="user-details-card">
                <h3>Profile Information</h3>
                <p><strong>User ID:</strong> ${userId}</p>
                <p><strong>Username:</strong> john_musician</p>
                <p><strong>Email:</strong> john@example.com</p>
                <p><strong>Role:</strong> Student</p>
                <p><strong>Joined:</strong> January 15, 2024</p>
                <p><strong>XP Points:</strong> 2,500</p>
                <p><strong>Level:</strong> 12</p>

                <h3 style="margin-top: 20px;">Appointment History</h3>
                <ul>
                    <li>Piano Lesson - Jan 10, 2024 - Completed</li>
                    <li>Guitar Session - Jan 15, 2024 - Completed</li>
                    <li>Theory Class - Jan 20, 2024 - Pending</li>
                </ul>

                <h3 style="margin-top: 20px;">Learning Progress</h3>
                <p>Modules Completed: 8/15</p>
                <p>Overall Progress: 53%</p>
            </div>
        `;

        modal.classList.add('active');
    }

    editUser(userId) {
        this.openUserForm(userId);
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            console.log('User deleted:', userId);
            alert('User deleted successfully!');
            this.loadUsers();
        }
    }

    // ========================================
    // APPOINTMENTS
    // ========================================
    loadAppointments() {
        const appointments = [
            { id: 1, date: '2024-01-25', time: '10:00 AM', student: 'John Music', instructor: 'Sarah Piano', service: 'Piano', status: 'confirmed' },
            { id: 2, date: '2024-01-26', time: '2:00 PM', student: 'Mike Guitar', instructor: 'Alex Drums', service: 'Guitar', status: 'pending' },
            { id: 3, date: '2024-01-27', time: '11:00 AM', student: 'Emma Music', instructor: 'Sarah Piano', service: 'Piano', status: 'completed' },
        ];

        this.renderAppointmentsTable(appointments);
    }

    renderAppointmentsTable(appointments) {
        const tbody = document.getElementById('appointmentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = appointments.map(apt => `
            <tr>
                <td>${apt.date}</td>
                <td>${apt.time}</td>
                <td>${apt.student}</td>
                <td>${apt.instructor}</td>
                <td>${apt.service}</td>
                <td><span class="status-badge status-${apt.status}">${apt.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="admin.editAppointment(${apt.id})">Edit</button>
                    <button class="btn btn-danger" onclick="admin.deleteAppointment(${apt.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    editAppointment(appointmentId) {
        this.selectedAppointmentId = appointmentId;
        const modal = document.getElementById('appointmentFormModal');
        modal.classList.add('active');
    }

    deleteAppointment(appointmentId) {
        if (confirm('Delete this appointment?')) {
            console.log('Appointment deleted:', appointmentId);
            this.loadAppointments();
        }
    }

    // ========================================
    // CALENDAR
    // ========================================
    generateCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        document.getElementById('currentMonth').textContent = 
            this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let html = '';

        // Days of week headers
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            html += `<div class="calendar-day header">${day}</div>`;
        });

        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += `<div class="calendar-day other-month"></div>`;
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const hasEvents = day % 3 === 0; // Sample: every 3rd day has events

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}">
                    ${day}
                </div>
            `;
        }

        document.getElementById('calendar').innerHTML = html;
    }

    prevMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.generateCalendar();
    }

    nextMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.generateCalendar();
    }

    switchAppointmentTab(tab) {
        document.querySelectorAll('.appointment-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.appointment-tabs').forEach(t => {
            document.querySelector(`[data-tab="${t.dataset.tab}"]`)?.classList.remove('active');
        });

        event.target.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
    }

    // ========================================
    // CONTENT MANAGEMENT
    // ========================================
    loadModules() {
        const modules = [
            { id: 1, name: 'Beginner Piano', level: 1, service: 'Piano', status: 'active', enrolled: 45 },
            { id: 2, name: 'Intermediate Guitar', level: 5, service: 'Guitar', status: 'active', enrolled: 32 },
            { id: 3, name: 'Advanced Music Theory', level: 10, service: 'Piano', status: 'inactive', enrolled: 12 }
        ];

        const tbody = document.getElementById('modulesTableBody');
        if (!tbody) return;

        tbody.innerHTML = modules.map(m => `
            <tr>
                <td>${m.name}</td>
                <td>Level ${m.level}</td>
                <td>${m.service}</td>
                <td><span class="status-badge status-${m.status}">${m.status}</span></td>
                <td>${m.enrolled}</td>
                <td>
                    <button class="btn btn-secondary" onclick="admin.editModule(${m.id})">Edit</button>
                    <button class="btn btn-danger" onclick="admin.deleteModule(${m.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    openModuleForm(moduleId = null) {
        const modal = document.getElementById('moduleFormModal');
        document.getElementById('moduleFormTitle').textContent = moduleId ? 'Edit Module' : 'Add New Module';
        modal.classList.add('active');
    }

    handleModuleFormSubmit(e) {
        e.preventDefault();
        alert('Module saved successfully!');
        document.getElementById('moduleFormModal').classList.remove('active');
        this.loadModules();
    }

    editModule(moduleId) {
        this.openModuleForm(moduleId);
    }

    deleteModule(moduleId) {
        if (confirm('Delete this module?')) {
            alert('Module deleted successfully!');
            this.loadModules();
        }
    }

    switchContentTab(tab) {
        document.querySelectorAll('.content-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        event.target.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
    }

    // ========================================
    // ANALYTICS & REPORTS
    // ========================================
    generateReport() {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        const reportType = document.getElementById('reportTypeSelect').value;

        const reportHTML = `
            <div style="margin-top: 20px;">
                <h3>Report Generated</h3>
                <p><strong>Type:</strong> ${reportType}</p>
                <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
                <div style="margin-top: 20px; padding: 20px; background: #f3f4f6; border-radius: 12px;">
                    <canvas id="generatedChart"></canvas>
                </div>
            </div>
        `;

        document.getElementById('reportVisualization').innerHTML = reportHTML;
        setTimeout(() => this.createGeneratedChart(reportType), 100);
    }

    createGeneratedChart(type) {
        const ctx = document.getElementById('generatedChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: type === 'revenue' ? 'line' : 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Data',
                    data: [100, 150, 120, 200],
                    backgroundColor: '#5b5bff',
                    borderColor: '#5b5bff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

    exportReportPDF() {
        alert('Exporting to PDF...');
        // Implement PDF export
    }

    exportReportExcel() {
        alert('Exporting to Excel...');
        // Implement Excel export
    }

    exportReportCSV() {
        alert('Exporting to CSV...');
        // Implement CSV export
    }

    loadAnalyticsData() {
        // Load analytics-specific data
        console.log('Loading analytics data');
    }

    // ========================================
    // ANNOUNCEMENTS
    // ========================================
    loadAnnouncements() {
        const announcements = [
            { id: 1, title: 'New Guitar Course', content: 'We have launched a new beginner guitar course', date: '2024-01-25', audience: 'all' },
            { id: 2, title: 'System Maintenance', content: 'Scheduled maintenance on Feb 1st', date: '2024-01-20', audience: 'all' },
            { id: 3, title: 'Scholarship Program', content: 'Apply now for our scholarship program', date: '2024-01-18', audience: 'students' }
        ];

        const list = document.getElementById('announcementsList');
        if (!list) return;

        list.innerHTML = announcements.map(ann => `
            <div class="announcement-card">
                <h4>${ann.title}</h4>
                <p>${ann.content}</p>
                <div class="announcement-meta">
                    <span>${ann.date}</span>
                    <span>${ann.audience}</span>
                    <div>
                        <button class="btn btn-secondary" onclick="admin.editAnnouncement(${ann.id})">Edit</button>
                        <button class="btn btn-danger" onclick="admin.deleteAnnouncement(${ann.id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openAnnouncementForm() {
        const modal = document.getElementById('announcementFormModal');
        document.getElementById('announcementForm').reset();
        modal.classList.add('active');
    }

    handleAnnouncementFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('announcementTitle').value;
        const content = document.getElementById('announcementContent').value;
        const audience = document.getElementById('announcementAudience').value;

        console.log('Announcement created:', { title, content, audience });
        alert('Announcement posted successfully!');
        document.getElementById('announcementFormModal').classList.remove('active');
        this.loadAnnouncements();
    }

    editAnnouncement(announcementId) {
        this.openAnnouncementForm();
    }

    deleteAnnouncement(announcementId) {
        if (confirm('Delete this announcement?')) {
            alert('Announcement deleted successfully!');
            this.loadAnnouncements();
        }
    }

    // ========================================
    // ACTIVITY LOGS
    // ========================================
    loadActivityLogs() {
        const logs = [
            { id: 1, timestamp: '2024-01-25 14:30:00', user: 'john_musician', type: 'login', details: 'User logged in', status: 'success' },
            { id: 2, timestamp: '2024-01-25 14:35:00', user: 'john_musician', type: 'appointment', details: 'Booked piano lesson', status: 'success' },
            { id: 3, timestamp: '2024-01-25 14:40:00', user: 'sarah_piano', type: 'user_activity', details: 'Updated profile', status: 'success' },
            { id: 4, timestamp: '2024-01-25 14:45:00', user: 'system', type: 'system_event', details: 'Database backup completed', status: 'success' }
        ];

        const tbody = document.getElementById('logsTableBody');
        if (!tbody) return;

        tbody.innerHTML = logs.map(log => `
            <tr>
                <td>${log.timestamp}</td>
                <td>${log.user}</td>
                <td>${log.type}</td>
                <td>${log.details}</td>
                <td><span class="status-badge status-${log.status}">${log.status}</span></td>
            </tr>
        `).join('');
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    showNotification(message, type = 'info') {
        console.log(`[${type}] ${message}`);
        // Implement notification system
    }
}

// Initialize admin panel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AdminPanel();
});
