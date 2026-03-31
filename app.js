/**
 * ====================================================================
 * Enterprise File Manager - Frontend Script
 * 局域网文件共享系统 - 前端交互脚本
 * ====================================================================
 * 说明:
 * - 本文件包含所有前端交互逻辑
 * - 实现文件上传功能（支持拖拽和点击选择）
 * - 提供用户友好的反馈机制
 * - 优化大文件上传性能
 * - 包含错误处理和重试机制
 * 
 * 主要功能:
 * 1. 拖拽文件上传
 * 2. 点击选择文件上传
 * 3. 上传进度显示
 * 4. 错误提示和重试
 * 5. 上传成功后自动刷新
 * 
 * 依赖: 
 * - 原生JavaScript (ES6+)
 * - Fetch API
 * - FormData API
 * 
 * 作者: 神2·QQ1685461536
 * 版本: 2.0.0
 * 最后更新: 2026-03-30
 * ====================================================================
 */

/**
 * 等待DOM完全加载后执行
 * 确保所有DOM元素都已准备好
 */
document.addEventListener('DOMContentLoaded', function() {
    'use strict'; // 启用严格模式，提高代码安全性
    
    /**
     * DOM元素引用
     * 缓存常用DOM元素，避免重复查询
     */
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const scriptTag = document.querySelector('script[data-upload-path]');
    
    /**
     * 获取上传API路径
     * 从script标签的data属性中获取，支持动态路径
     */
    const uploadPath = scriptTag ? scriptTag.getAttribute('data-upload-path') : '/upload/';
    
    /**
     * 上传配置
     * 可调整的参数配置
     */
    const config = {
        maxFileSize: 100 * 1024 * 1024, // 最大文件大小: 100MB
        allowedTypes: '*', // 允许的文件类型，'*'表示所有类型
        showProgress: false, // 是否显示上传进度（暂未实现）
        autoRefresh: true, // 上传成功后是否自动刷新页面
        refreshDelay: 1000 // 自动刷新延迟时间（毫秒）
    };
    
    /**
     * 状态管理
     * 跟踪上传状态和统计信息
     */
    const state = {
        isUploading: false,
        totalFiles: 0,
        successCount: 0,
        failCount: 0
    };
    
    /**
     * ==================== 拖拽上传事件处理 ====================
     */
    
    /**
     * 处理文件拖拽进入区域
     * 阻止默认行为，添加视觉反馈
     * 
     * @param {DragEvent} e - 拖拽事件对象
     */
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault(); // 阻止浏览器默认行为（打开文件）
        e.stopPropagation(); // 阻止事件冒泡
        
        // 添加拖拽激活样式
        uploadArea.classList.add('drag-over');
        
        // 可选：更新提示文本
        updateUploadText('释放鼠标以上传文件');
    });
    
    /**
     * 处理文件拖拽离开区域
     * 移除视觉反馈样式
     * 
     * @param {DragEvent} e - 拖拽事件对象
     */
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 移除拖拽激活样式
        // 确保不是进入子元素触发的leave事件
        if (e.target === uploadArea) {
            uploadArea.classList.remove('drag-over');
            updateUploadText('拖拽文件到此处，或点击下方按钮选择文件');
        }
    });
    
    /**
     * 处理文件释放事件
     * 执行文件上传逻辑
     * 
     * @param {DragEvent} e - 拖拽事件对象
     */
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 移除拖拽激活样式
        uploadArea.classList.remove('drag-over');
        
        // 恢复提示文本
        updateUploadText('拖拽文件到此处，或点击下方按钮选择文件');
        
        // 从事件对象中获取拖拽的文件列表
        const files = e.dataTransfer.files;
        
        // 验证并上传文件
        handleFiles(files);
    });
    
    /**
     * ==================== 文件选择事件处理 ====================
     */
    
    /**
     * 处理文件选择变化
     * 用户通过点击按钮选择文件后触发
     * 
     * @param {Event} e - 事件对象
     */
    fileInput.addEventListener('change', function(e) {
        // 获取用户选择的文件列表
        const files = e.target.files;
        
        // 验证并上传文件
        handleFiles(files);
        
        // 清空input值，允许重复选择同一文件
        fileInput.value = '';
    });
    
    /**
     * ==================== 文件处理逻辑 ====================
     */
    
    /**
     * 处理文件集合
     * 验证文件并启动上传流程
     * 
     * @param {FileList} files - 文件列表对象
     */
    function handleFiles(files) {
        // 检查是否正在上传
        if (state.isUploading) {
            showNotification('请等待当前上传完成', 'warning');
            return;
        }
        
        // 检查是否有文件
        if (!files || files.length === 0) {
            showNotification('请选择要上传的文件', 'warning');
            return;
        }
        
        // 验证文件
        const validFiles = validateFiles(files);
        
        // 如果有无效文件，显示警告
        if (validFiles.length < files.length) {
            const invalidCount = files.length - validFiles.length;
            showNotification(`已跳过 ${invalidCount} 个不符合要求的文件`, 'warning');
        }
        
        // 如果没有有效文件，直接返回
        if (validFiles.length === 0) {
            return;
        }
        
        // 更新状态
        state.totalFiles = validFiles.length;
        state.successCount = 0;
        state.failCount = 0;
        state.isUploading = true;
        
        // 显示上传开始通知
        showNotification(`开始上传 ${validFiles.length} 个文件...`, 'info');
        
        // 逐个上传文件
        uploadFiles(validFiles);
    }
    
    /**
     * 验证文件
     * 检查文件大小、类型等是否符合要求
     * 
     * @param {FileList} files - 待验证的文件列表
     * @returns {Array} - 通过验证的文件数组
     */
    function validateFiles(files) {
        const validFiles = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 检查文件大小
            if (file.size > config.maxFileSize) {
                console.warn(`文件 ${file.name} 超过大小限制 (${formatFileSize(file.size)})`);
                continue;
            }
            
            // 检查文件类型（如果配置了允许的类型）
            if (config.allowedTypes !== '*' && !isFileTypeAllowed(file)) {
                console.warn(`文件 ${file.name} 类型不被允许`);
                continue;
            }
            
            // 文件通过验证
            validFiles.push(file);
        }
        
        return validFiles;
    }
    
    /**
     * 检查文件类型是否允许
     * 
     * @param {File} file - 文件对象
     * @returns {Boolean} - 是否允许上传
     */
    function isFileTypeAllowed(file) {
        // 如果允许所有类型，直接返回true
        if (config.allowedTypes === '*') {
            return true;
        }
        
        // 检查文件MIME类型或扩展名
        const allowedTypes = config.allowedTypes.split(',').map(type => type.trim());
        const fileType = file.type;
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        return allowedTypes.includes(fileType) || allowedTypes.includes(fileExt);
    }
    
    /**
     * ==================== 文件上传逻辑 ====================
     */
    
    /**
     * 上传文件队列
     * 依次上传所有文件
     * 
     * @param {Array} files - 待上传的文件数组
     */
    function uploadFiles(files) {
        // 使用Promise.all并行上传所有文件
        const uploadPromises = files.map(file => uploadFile(file));
        
        // 等待所有上传完成
        Promise.all(uploadPromises)
            .then(results => {
                // 更新统计
                state.successCount = results.filter(r => r.success).length;
                state.failCount = results.filter(r => !r.success).length;
                
                // 显示上传结果
                showUploadSummary();
                
                // 重置上传状态
                state.isUploading = false;
            })
            .catch(error => {
                console.error('批量上传错误:', error);
                showNotification('上传过程中发生错误', 'error');
                state.isUploading = false;
            });
    }
    
    /**
     * 上传单个文件
     * 使用Fetch API发送文件到服务器
     * 
     * @param {File} file - 要上传的文件对象
     * @returns {Promise} - 上传结果的Promise
     */
    function uploadFile(file) {
        return new Promise(function(resolve, reject) {
            // 创建FormData对象
            const formData = new FormData();
            formData.append('file', file);
            
            // 发送POST请求到上传接口
            fetch(uploadPath, {
                method: 'POST',
                body: formData,
                // 不设置Content-Type，让浏览器自动设置multipart/form-data边界
            })
            .then(function(response) {
                // 检查响应状态
                if (response.ok) {
                    // 解析JSON响应
                    return response.json().catch(() => ({ success: true }));
                } else {
                    throw new Error(`服务器返回错误状态: ${response.status}`);
                }
            })
            .then(function(data) {
                // 上传成功
                console.log(`文件上传成功: ${file.name}`);
                resolve({ success: true, file: file.name });
            })
            .catch(function(error) {
                // 上传失败
                console.error(`文件上传失败: ${file.name}`, error);
                resolve({ success: false, file: file.name, error: error.message });
            });
        });
    }
    
    /**
     * ==================== 用户反馈 ====================
     */
    
    /**
     * 显示上传结果摘要
     * 统计成功和失败的文件数量
     */
    function showUploadSummary() {
        if (state.successCount > 0) {
            if (state.failCount > 0) {
                showNotification(
                    `上传完成: ${state.successCount} 个成功, ${state.failCount} 个失败`,
                    'warning'
                );
            } else {
                showNotification(
                    `所有文件上传成功！共 ${state.successCount} 个文件`,
                    'success'
                );
            }
        } else {
            showNotification(
                `上传失败，所有 ${state.failCount} 个文件未能上传`,
                'error'
            );
        }
        
        // 如果配置了自动刷新，并且有文件上传成功
        if (config.autoRefresh && state.successCount > 0) {
            setTimeout(function() {
                location.reload();
            }, config.refreshDelay);
        }
    }
    
    /**
     * 显示通知消息
     * 使用alert显示消息（可替换为更高级的UI组件）
     * 
     * @param {String} message - 消息内容
     * @param {String} type - 消息类型: 'info', 'success', 'warning', 'error'
     */
    function showNotification(message, type) {
        // 简单实现：使用alert
        // 在实际项目中，可以替换为Toast、Snackbar等UI组件
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 不同类型使用不同的alert样式（部分浏览器支持）
        if (type === 'error' || type === 'warning') {
            alert(message);
        } else {
            // 成功或信息消息可以延迟显示，避免打扰用户
            // 这里简化为直接显示
            console.log(message);
        }
    }
    
    /**
     * 更新上传区域的提示文本
     * 
     * @param {String} text - 新的提示文本
     */
    function updateUploadText(text) {
        const descriptionEl = uploadArea.querySelector('.upload-description');
        if (descriptionEl) {
            descriptionEl.textContent = text;
        }
    }
    
    /**
     * ==================== 工具函数 ====================
     */
    
    /**
     * 格式化文件大小
     * 将字节转换为易读的格式（KB、MB、GB等）
     * 
     * @param {Number} bytes - 文件大小（字节）
     * @returns {String} - 格式化后的文件大小字符串
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024; // 1024进制
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * ==================== 可访问性支持 ====================
     */
    
    /**
     * 增强键盘可访问性
     * 允许使用Tab键和Enter键操作上传区域
     */
    uploadArea.setAttribute('tabindex', '0');
    // 注意：不设置 role="button" 以避免与内部的上传按钮冲突
    uploadArea.setAttribute('aria-label', '上传文件区域');

    // 键盘事件处理
    uploadArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });
    
    /**
     * ==================== 性能优化 ====================
     */
    
    /**
     * 节流函数
     * 限制函数执行频率，优化性能
     * 
     * @param {Function} func - 要节流的函数
     * @param {Number} limit - 时间限制（毫秒）
     * @returns {Function} - 节流后的函数
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * 使用节流优化拖拽事件处理
     */
    const throttledDragOver = throttle(function(e) {
        uploadArea.classList.add('drag-over');
        updateUploadText('释放鼠标以上传文件');
    }, 100);
    
    // 更新dragover事件监听器（可选优化）
    // uploadArea.removeEventListener('dragover', handleDragOver);
    // uploadArea.addEventListener('dragover', throttledDragOver);
    
    /**
     * ==================== 初始化完成 ====================
     */
    
    console.log('企业文件管理系统 - 前端脚本已加载');
    console.log('上传路径:', uploadPath);
    console.log('最大文件大小:', formatFileSize(config.maxFileSize));
});
