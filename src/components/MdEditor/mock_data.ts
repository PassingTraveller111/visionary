export const mockData = `
# 项目部署记录

## 登录控制台

https://orcaterm.cloud.tencent.com/terminal?type=cvm&instanceId=ins-pzhzr2rz&region=ap-beijing&from=cvm_console_login_btn

在 Ubuntu 系统上部署 Next.js 项目，可按以下步骤进行：

### 1. 准备工作

#### 1.1 连接到服务器

使用 SSH 工具（如 \`ssh\` 命令）连接到你的 Ubuntu 服务器，命令格式如下：

\`\`\`bash
ssh username@server_ip_address
\`\`\`

其中 \`username\` 是你的服务器用户名，\`server_ip_address\` 是服务器的 IP 地址。

#### 1.2 更新系统

登录服务器后，先更新系统的软件包列表和已安装的软件包：

\`\`\`bash
sudo apt update
sudo apt upgrade -y
\`\`\`

### 2. 安装必要的软件

#### 2.1 安装 Node.js 和 npm

Next.js 是基于 Node.js 的，所以需要先安装 Node.js 和 npm（Node 包管理器）。可以使用 NodeSource 提供的脚本进行安装：

\`\`\`bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# 安装 Node.js 和 npm
sudo apt install -y nodejs
\`\`\`

安装完成后，可使用以下命令验证安装是否成功：

\`\`\`bash
node -v
npm -v
\`\`\`

#### 2.2 安装 Git

Git 用于从代码仓库拉取项目代码，使用以下命令进行安装：

\`\`\`bash
sudo apt install -y git
\`\`\`

### 3. 获取项目代码

假设你的 Next.js 项目代码托管在 GitHub 上，使用 \`git clone\` 命令将代码克隆到服务器上：

\`\`\`bash
git clone <repository_url>
cd <project_directory>
\`\`\`

其中 \`<repository_url>\` 是你的项目仓库的 URL，\`<project_directory>\` 是克隆下来的项目目录名。

### 4. 安装项目依赖

进入项目目录后，使用 \`npm\` 安装项目所需的依赖：

\`\`\`bash
npm install
\`\`\`

### 5. 构建项目

安装完依赖后，使用以下命令构建 Next.js 项目：

\`\`\`bash
npm run build
\`\`\`

此命令会将项目代码进行编译和打包，生成可用于生产环境的静态文件。

### 6. 配置反向代理（可选但推荐）

为了更好地管理和访问 Next.js 应用，可使用 Nginx 作为反向代理服务器。

#### 6.1 安装 Nginx

\`\`\`bash
sudo apt install -y nginx
\`\`\`

#### 6.2 配置 Nginx

创建一个新的 Nginx 配置文件：

\`\`\`bash
sudo nano /etc/nginx/sites-available/nextjs-app
\`\`\`

在文件中添加以下内容：

\`\`\`nginx
server {
    listen 80;
    server_name 101.43.168.254;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

将 \`your_domain_or_ip\` 替换为你的域名或服务器 IP 地址。

保存并退出文件后，创建一个软链接到 \`sites-enabled\` 目录：

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/nextjs-app /etc/nginx/sites-enabled/
\`\`\`

检查 Nginx 配置文件是否有语法错误：

\`\`\`bash
sudo nginx -t
\`\`\`

如果没有错误，重启 Nginx 服务：

\`\`\`bash
sudo systemctl restart nginx
\`\`\`

### 7. 启动项目

使用 \`pm2\` 来管理 Node.js 应用的进程，确保应用在服务器重启后仍能自动运行。

#### 7.1 安装 pm2

\`\`\`bash
sudo npm install -g pm2
\`\`\`

#### 7.2 启动 Next.js 应用

进入项目所在文件夹

\`\`\`
cd ./visionary
\`\`\`

用pm2启动项目

\`\`\`bash
pm2 start npm --name "nextjs-app" -- start
\`\`\`

此命令会以 \`nextjs-app\` 为名称启动 Next.js 应用。

#### 7.3 设置 pm2 开机自启

\`\`\`bash
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your_username --hp /home/your_username
pm2 save
\`\`\`

将 \`your_username\` 替换为你的服务器用户名。



## 环境变量的配置



## Pm2用法

\`\`\`bash
pm2 start npm --name "nextjs-app" -- start
\`\`\`

此命令会以 \`nextjs-app\` 为名称启动 Next.js 应用。

删除

\`\`\`bash
pm2 delete nextjs-app
\`\`\`

暂停

\`\`\`bash
pm2 stop nextjs-app
\`\`\`

查看日志

\`\`\`bash
# 通过应用名称查看日志
pm2 logs my-app

# 通过应用 ID 查看日志，假设应用 ID 为 0
pm2 logs 0
\`\`\`

`