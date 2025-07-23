// 用户管理系统 JavaScript
class UserManager {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.currentFilter = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUsers();
    }

    bindEvents() {
        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadUsers();
        });

        // 应用过滤器
        document.getElementById('appFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterUsers();
        });

        // 创建API密钥表单提交
        document.getElementById('createKeyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createApiKey();
        });

        // 删除用户表单提交
        document.getElementById('deleteUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.deleteUser();
        });

        // 点击模态框外部关闭
        document.getElementById('createKeyModal').addEventListener('click', (e) => {
            if (e.target.id === 'createKeyModal') {
                this.closeCreateModal();
            }
        });

        document.getElementById('deleteUserModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteUserModal') {
                this.closeDeleteModal();
            }
        });
    }

    // 显示加载状态
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('usersList').style.opacity = '0.3';
    }

    // 隐藏加载状态
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('usersList').style.opacity = '1';
    }

    // 显示消息
    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-triangle' : 'info-circle';
        
        messageDiv.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(messageDiv);
        
        // 自动移除消息
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // 加载用户数据
    async loadUsers() {
        try {
            this.showLoading();
            const response = await fetch('/api/users');
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            this.users = await response.json();
            this.currentFilter = ''; // 重置过滤器状态
            this.filteredUsers = [...this.users];
            
            this.updateStats();
            this.updateAppFilter();
            this.renderUsers();
            this.showMessage('用户数据加载成功', 'success');
            
        } catch (error) {
            console.error('加载用户数据失败:', error);
            this.showMessage(`加载失败: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // 更新统计数据
    updateStats() {
        const totalUsers = this.users.length;
        const totalKeys = this.users.reduce((sum, user) => sum + user.api_keys.length, 0);
        const activeKeys = this.users.reduce((sum, user) => 
            sum + user.api_keys.filter(key => key.status === 'active').length, 0);

        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalKeys').textContent = totalKeys;
        document.getElementById('activeKeys').textContent = activeKeys;
    }

    // 更新应用过滤器选项
    updateAppFilter() {
        const appIds = [...new Set(this.users.map(user => user.app_id))];
        const filterSelect = document.getElementById('appFilter');
        
        // 清除现有选项（除了"全部应用"）
        filterSelect.innerHTML = '<option value="">全部应用</option>';
        
        // 添加应用ID选项
        appIds.forEach(appId => {
            const option = document.createElement('option');
            option.value = appId;
            option.textContent = appId;
            if (appId === this.currentFilter) {
                option.selected = true;
            }
            filterSelect.appendChild(option);
        });
    }

    // 过滤用户
    filterUsers() {
        if (this.currentFilter === '') {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user => user.app_id === this.currentFilter);
        }
        this.renderUsers();
    }

    // 渲染用户列表
    renderUsers() {
        const container = document.getElementById('usersList');
        
        if (this.filteredUsers.length === 0) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                    <i class="fas fa-database" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <p>没有找到用户数据</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredUsers.map(user => this.renderUserCard(user)).join('');
    }

    // 渲染单个用户卡片
    renderUserCard(user) {
        const userInitial = user.email.charAt(0).toUpperCase();
        const createdDate = new Date(user.created_at).toLocaleDateString('zh-CN');
        const lastLogin = user.last_login ? 
            new Date(user.last_login).toLocaleDateString('zh-CN') : '从未登录';

        return `
            <div class="user-card">
                <div class="user-header" onclick="this.toggleExpand(this)">
                    <div class="user-info">
                        <div class="user-avatar">${userInitial}</div>
                        <div class="user-details">
                            <h3>${user.email}</h3>
                            <div class="user-meta">
                                <span><i class="fas fa-cube"></i> ${user.app_id}</span>
                                <span><i class="fas fa-calendar"></i> ${createdDate}</span>
                                <span><i class="fas fa-sign-in-alt"></i> ${lastLogin}</span>
                                <span class="status ${user.is_active ? 'active' : 'inactive'}">
                                    <i class="fas fa-circle"></i> ${user.is_active ? '活跃' : '未激活'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="expand-btn" onclick="event.stopPropagation(); this.parentElement.parentElement.parentElement.toggleExpand()">
                            <i class="fas fa-chevron-down"></i> 查看密钥
                        </button>
                        <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); userManager.openDeleteModal('${user.email}', '${user.app_id}')">
                            <i class="fas fa-trash-alt"></i> 删除用户
                        </button>
                    </div>
                </div>
                <div class="api-keys" id="keys-${user.id}">
                    <div class="keys-header">
                        <h4><i class="fas fa-key"></i> API密钥 (${user.api_keys.length})</h4>
                        <button class="btn btn-success btn-small" onclick="userManager.openCreateModal('${user.email}', '${user.app_id}')">
                            <i class="fas fa-plus"></i> 新建密钥
                        </button>
                    </div>
                    ${user.api_keys.map(key => this.renderApiKey(key)).join('')}
                </div>
            </div>
        `;
    }

    // 渲染API密钥
    renderApiKey(key) {
        const createdDate = new Date(key.created_at).toLocaleDateString('zh-CN');
        const expiresDate = new Date(key.expires_at).toLocaleDateString('zh-CN');
        const usagePercent = Math.round((key.usage_count / key.usage_limit) * 100);

        return `
            <div class="api-key-item">
                <div class="key-header">
                    <div class="key-id">${key.key}</div>
                    <div class="key-status ${key.status}">${key.status}</div>
                </div>
                <div class="key-details">
                    <div class="key-detail">
                        <div class="key-detail-label">创建时间</div>
                        <div class="key-detail-value">${createdDate}</div>
                    </div>
                    <div class="key-detail">
                        <div class="key-detail-label">到期时间</div>
                        <div class="key-detail-value">${expiresDate}</div>
                    </div>
                    <div class="key-detail">
                        <div class="key-detail-label">使用情况</div>
                        <div class="key-detail-value">${key.usage_count}/${key.usage_limit} (${usagePercent}%)</div>
                    </div>
                    <div class="key-detail">
                        <div class="key-detail-label">计划</div>
                        <div class="key-detail-value">${key.plan}</div>
                    </div>
                    <div class="key-detail">
                        <div class="key-detail-label">操作</div>
                        <div class="key-detail-value">
                            ${key.status === 'active' ? 
                                `<button class="btn btn-danger btn-small" onclick="userManager.revokeKey('${key.key}', '${key.app_id}')">
                                    <i class="fas fa-ban"></i> 吊销
                                </button>` : 
                                '<span style="color: var(--text-muted);">已吊销</span>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 打开创建密钥模态框
    openCreateModal(email, appId) {
        document.getElementById('createEmail').value = email;
        document.getElementById('createAppId').value = appId;
        document.getElementById('createKeyModal').classList.remove('hidden');
    }

    // 关闭创建密钥模态框
    closeCreateModal() {
        document.getElementById('createKeyModal').classList.add('hidden');
        document.getElementById('createKeyForm').reset();
    }

    // 打开删除用户模态框
    openDeleteModal(email, appId) {
        document.getElementById('deleteEmail').value = email;
        document.getElementById('deleteAppId').value = appId;
        document.getElementById('deleteUserModal').classList.remove('hidden');
    }

    // 关闭删除用户模态框
    closeDeleteModal() {
        document.getElementById('deleteUserModal').classList.add('hidden');
        document.getElementById('deleteUserForm').reset();
    }

    // 创建API密钥
    async createApiKey() {
        try {
            const formData = {
                email: document.getElementById('createEmail').value,
                app_id: document.getElementById('createAppId').value,
                plan: document.getElementById('createPlan').value,
                expires_in_days: parseInt(document.getElementById('createExpireDays').value),
                usage_limit: parseInt(document.getElementById('createUsageLimit').value)
            };

            const response = await fetch('/api/create-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.showMessage(`API密钥创建成功: ${result.key}`, 'success');
            this.closeCreateModal();
            this.loadUsers(); // 重新加载用户数据

        } catch (error) {
            console.error('创建API密钥失败:', error);
            this.showMessage(`创建失败: ${error.message}`, 'error');
        }
    }

    // 吊销API密钥
    async revokeKey(apiKey, appId) {
        if (!confirm(`确定要吊销API密钥 ${apiKey} 吗？此操作不可撤销。`)) {
            return;
        }

        try {
            const response = await fetch('/api/revoke-key', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    api_key: apiKey,
                    app_id: appId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.showMessage(result.message || 'API密钥已成功吊销', 'success');
            this.loadUsers(); // 重新加载用户数据

        } catch (error) {
            console.error('吊销API密钥失败:', error);
            this.showMessage(`吊销失败: ${error.message}`, 'error');
        }
    }

    // 删除用户
    async deleteUser() {
        try {
            const email = document.getElementById('deleteEmail').value;
            const appId = document.getElementById('deleteAppId').value;
            const adminEmail = document.getElementById('adminEmail').value;
            const adminAppId = document.getElementById('adminAppId').value;
            const confirmation = document.getElementById('deleteConfirmation').value;

            // 验证确认文本
            if (confirmation !== 'CONFIRM_DELETE') {
                throw new Error('请正确输入确认文本 "CONFIRM_DELETE"');
            }

            const formData = {
                email: email,
                app_id: appId,
                confirmation: confirmation,
                admin_email: adminEmail,
                admin_app_id: adminAppId
            };

            const response = await fetch('/api/delete-user', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.showMessage(`用户 ${email} 已成功删除`, 'success');
            this.closeDeleteModal();
            this.loadUsers(); // 重新加载用户数据

        } catch (error) {
            console.error('删除用户失败:', error);
            this.showMessage(`删除失败: ${error.message}`, 'error');
        }
    }
}

// 扩展用户卡片功能
HTMLElement.prototype.toggleExpand = function() {
    const apiKeysSection = this.querySelector('.api-keys');
    const expandBtn = this.querySelector('.expand-btn i');
    
    if (apiKeysSection.classList.contains('expanded')) {
        apiKeysSection.classList.remove('expanded');
        expandBtn.classList.remove('fa-chevron-up');
        expandBtn.classList.add('fa-chevron-down');
    } else {
        apiKeysSection.classList.add('expanded');
        expandBtn.classList.remove('fa-chevron-down');
        expandBtn.classList.add('fa-chevron-up');
    }
};

// 全局函数
function closeCreateModal() {
    userManager.closeCreateModal();
}

function closeDeleteModal() {
    userManager.closeDeleteModal();
}

// 初始化应用
let userManager;
document.addEventListener('DOMContentLoaded', () => {
    userManager = new UserManager();
}); 