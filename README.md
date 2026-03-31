# 局域网文件共享系统

一个功能强大、易于使用的局域网文件共享解决方案，支持文件上传、下载、浏览和管理。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-24.14.0+-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)

**🔗 开源地址**: [https://github.com/taoheping/LANFileSharingTool.git](https://github.com/taoheping/LANFileSharingTool.git)

## 📋 目录

- [功能特性](#功能特性)
- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [使用指南](#使用指南)
- [API 文档](#api-文档)
- [项目结构](#项目结构)
- [常见问题](#常见问题)
- [版权声明](#版权声明)
- [更新日志](#更新日志)

## ✨ 功能特性

### 核心功能
- 📁 **文件浏览** - 直观的文件目录浏览界面
- 📤 **文件上传** - 支持拖拽上传和点击选择文件
- 📥 **文件下载** - 一键下载文件
- 🔒 **身份验证** - 可选的用户登录功能
- 🎨 **现代化UI** - 响应式设计，美观易用
- 📱 **移动端适配** - 支持手机、平板等移动设备

### 技术特点
- ⚡ **纯Node.js** - 无需额外依赖，轻量高效
- 🎯 **RESTful API** - 标准的HTTP接口设计
- 🔐 **安全认证** - 支持基于会话的身份验证
- 🌐 **跨平台** - Windows、Linux、macOS全平台支持
- 📊 **实时反馈** - 上传进度、状态提示
- 🎭 **动画效果** - 流畅的用户交互体验

## 🛠️ 系统要求

### 必需环境
- **Node.js**: v24.14.0 或更高版本
- **操作系统**: Windows 7+ / Linux / macOS
- **网络**: 局域网环境
- **浏览器**: Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+

### 推荐配置
- **内存**: 512MB 或更高
- **磁盘空间**: 根据共享文件大小决定
- **网络带宽**: 100Mbps 或更高（用于大文件传输）

## 🚀 快速开始

### 1. 安装 Node.js

#### Windows
1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载 LTS 版本安装包
3. 运行安装程序，按提示完成安装

#### Linux
```bash
# 使用包管理器安装（以Ubuntu为例）
sudo apt update
sudo apt install nodejs npm

# 或使用 NVM 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
```

#### macOS
```bash
# 使用 Homebrew 安装
brew install node
```

### 2. 验证安装

```bash
node --version
npm --version
```

### 3. 启动服务器

#### Windows
双击运行 `启动共享.bat` 文件

或在命令行中运行：
```bash
node server.js
```

#### Linux/macOS
```bash
chmod +x 启动共享.sh  # 如需赋予执行权限
./启动共享.sh
```

或直接运行：
```bash
node server.js
```

### 4. 访问系统

服务器启动后，在浏览器中访问：

- **本机访问**: http://localhost:8080
- **局域网访问**: http://[你的IP地址]:8080

首次访问时，使用默认账号登录：
- **用户名**: admin
- **密码**: admin123

### 5. 开始使用

- 点击"文件列表"浏览文件
- 点击"文件上传"上传文件
- 拖拽文件到上传区域即可上传

## ⚙️ 配置说明

### 服务器配置

编辑 `server.js` 文件中的配置对象：

```javascript
const config = {
    port: 8080,                    // 服务器端口
    sharedDir: path.join(__dirname, 'shared'),  // 共享目录路径
    enableAuth: true,              // 是否启用身份验证
    username: 'admin',             // 登录用户名
    password: 'admin123'           // 登录密码
};
```

### 配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `port` | Number | 8080 | 服务器监听端口号 |
| `sharedDir` | String | `./shared` | 文件共享目录的绝对路径 |
| `enableAuth` | Boolean | true | 是否启用用户登录验证 |
| `username` | String | admin | 登录用户名（当enableAuth=true时生效） |
| `password` | String | admin123 | 登录密码（当enableAuth=true时生效） |

### 安全建议

1. **修改默认密码**: 首次使用后请立即修改默认密码
2. **使用强密码**: 建议使用包含字母、数字和特殊字符的复杂密码
3. **限制访问范围**: 如需只在局域网内使用，可配置防火墙规则
4. **定期备份**: 定期备份共享目录中的文件
5. **监控日志**: 关注服务器日志，及时发现异常访问

## 📖 使用指南

### 登录系统

1. 打开浏览器，访问系统地址
2. 输入用户名和密码
3. 点击"登录"按钮
4. 登录成功后进入文件管理界面

### 上传文件

#### 方式一：拖拽上传
1. 进入"文件上传"页面
2. 将文件拖拽到上传区域
3. 等待上传完成
4. 查看上传结果提示

#### 方式二：点击选择
1. 进入"文件上传"页面
2. 点击"选择文件"按钮
3. 在文件选择对话框中选择文件
4. 确认后开始上传

### 浏览文件

1. 进入"文件列表"页面
2. 查看当前目录下的文件和文件夹
3. 点击文件夹进入子目录
4. 点击文件名下载文件
5. 点击"返回上级目录"返回上一级

### 退出登录

点击页面右上角的"退出登录"按钮即可安全退出系统。

### 页面导航

系统包含三个主要页面：

1. **登录页面** (`/login`)
   - 用户身份验证入口
   - 安全的登录表单

2. **上传页面** (`/upload`)
   - 专门的文件上传界面
   - 支持拖拽和点击上传
   - 实时上传进度显示

3. **文件列表页面** (`/files`)
   - 文件和目录浏览
   - 文件下载功能
   - 目录导航

## 🔌 API 文档

### 上传文件

**接口**: `POST /upload/`

**请求参数**:
- Content-Type: `multipart/form-data`
- Body: 包含文件的FormData对象

**请求示例**:
```javascript
const formData = new FormData();
formData.append('file', fileObject);

fetch('/upload/', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**响应示例**:
```json
{
    "success": true,
    "message": "文件上传成功",
    "filename": "example.txt"
}
```

### 下载文件

**接口**: `GET /files/{relative_path}`

**请求示例**:
```
GET /files/documents/report.pdf
```

**响应**: 文件内容（以二进制流形式返回）

### 获取文件列表

**接口**: `GET /files/{relative_path}`

**请求示例**:
```
GET /files/documents
```

**响应**: HTML格式的文件列表页面

### 用户登录

**接口**: `POST /login`

**请求参数**:
- Content-Type: `application/json`
- Body: `{"username": "admin", "password": "admin123"}`

**响应示例**:
```json
{
    "success": true,
    "message": "登录成功"
}
```

## 📁 项目结构

```
网站代码/
├── server.js                 # 主服务器文件
├── app.js                    # 前端交互脚本
├── index.html                # 主页面（文件管理）
├── login.html                # 登录页面
├── upload.html               # 文件上传页面
├── files.html                # 文件列表页面
├── css/                      # 样式文件目录
│   ├── main.css             # 主要样式表
│   ├── animate.css          # 动画效果
│   └── bootstrap.min.css    # Bootstrap框架
├── js/                       # JavaScript文件目录
│   ├── jquery.min.js        # jQuery库
│   ├── bootstrap.min.js     # Bootstrap JS
│   ├── bootstrap-notify.min.js  # 通知组件
│   ├── lightyear.js         # UI组件
│   └── find-buttons.js      # 辅助工具
├── shared/                   # 共享文件目录（默认）
├── 启动共享.bat             # Windows启动脚本
├── 清理.bat                 # 清理脚本
├── 重启服务器.bat           # 重启服务器脚本
└── 重新加载.bat             # 重新加载脚本
```

## ❓ 常见问题

### Q1: 无法访问服务器？

**可能原因**:
- 端口8080被占用
- 防火墙阻止了连接
- 服务器未正常启动

**解决方案**:
1. 检查端口占用：`netstat -ano | findstr :8080` (Windows) 或 `lsof -i :8080` (Linux/Mac)
2. 修改server.js中的端口号
3. 检查防火墙设置
4. 查看服务器错误日志

### Q2: 上传失败？

**可能原因**:
- 文件大小超过限制
- 磁盘空间不足
- 文件名包含特殊字符
- 网络连接中断

**解决方案**:
1. 检查浏览器控制台错误信息
2. 确认磁盘空间充足
3. 使用简单的文件名（避免特殊字符）
4. 检查网络连接稳定性

### Q3: 无法登录？

**可能原因**:
- 用户名或密码错误
- 浏览器Cookie被禁用
- 会话过期

**解决方案**:
1. 检查用户名和密码是否正确（区分大小写）
2. 确保浏览器启用了Cookie
3. 清除浏览器缓存后重试
4. 查看服务器日志获取详细错误信息

### Q4: 文件下载失败？

**可能原因**:
- 文件不存在
- 文件路径错误
- 权限不足

**解决方案**:
1. 确认文件存在于shared目录
2. 检查文件路径是否正确
3. 检查文件系统权限

### Q5: 如何修改共享目录？

**解决方案**:
1. 编辑 `server.js` 文件
2. 修改 `config.sharedDir` 的值
3. 确保新目录存在且有读写权限
4. 重启服务器

### Q6: 如何禁用身份验证？

**解决方案**:
1. 编辑 `server.js` 文件
2. 将 `config.enableAuth` 设置为 `false`
3. 重启服务器

## 🔄 更新日志

### v2.0.0 (2026-03-31)

#### 新增功能
- ✨ 页面分离：上传和文件列表功能分为独立页面
- ✨ 独立登录页面：登录功能与主页面完全分离
- 🎨 优化UI设计：现代化、简洁的用户界面
- 📱 响应式布局：更好的移动端适配
- 🔐 增强安全性：改进的身份验证机制

#### 改进
- ⚡ 性能优化：提升文件上传和下载速度
- 🐛 Bug修复：修复已知的各种问题
- 📝 文档完善：详细的使用说明和API文档

### v1.0.0 (2026-03-30)

#### 初始版本
- 🎉 首次发布
- ✅ 基础文件上传和下载功能
- ✅ 文件浏览功能
- ✅ 身份验证功能
- ✅ 拖拽上传支持

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 👥 贡献

欢迎贡献代码、报告问题或提出改进建议！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 技术支持

如有问题或需要帮助，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 查看项目文档

## 🙏 致谢

感谢以下开源项目：

- [Bootstrap](https://getbootstrap.com/) - UI框架
- [jQuery](https://jquery.com/) - JavaScript库
- [Node.js](https://nodejs.org/) - 运行时环境

## ©️ 版权声明

**版权所有 &copy; 2026 局域网文件共享系统 | 版权所有 by QQ1685461536需要服务器加**

本软件采用 MIT 许可证发布。您可以在遵守许可证条款的前提下自由使用、修改和分发本软件。

### 🌟 开源地址
- **GitHub**: [https://github.com/taoheping/LANFileSharingTool.git](https://github.com/taoheping/LANFileSharingTool.git)

### 许可证详情
- 允许商业使用
- 允许修改
- 允许分发
- 允许私人使用
- 需要包含许可证和版权声明
- 需要说明对原始代码的修改
- 不提供责任担保

### 联系方式
- **QQ**: 1685461536
- **GitHub**: [taoheping/LANFileSharingTool](https://github.com/taoheping/LANFileSharingTool)
- **版本**: 2.0.0
- **最后更新**: 2026-03-31

---

**开发者**: 神2·QQ1685461536需要服务器加
**版权所有**: QQ1685461536
**开源地址**: https://github.com/taoheping/LANFileSharingTool.git
**最后更新**: 2026-03-31
**版本**: 2.0.0

---
