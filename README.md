# DevKit - Git 分支合并工具

一个强大的 CLI 工具，用于简化 Git 分支合并工作流。DevKit 自动化了将当前开发分支合并到目标集成分支的过程，具备适当的错误处理和用户友好的输出。

## 功能特性

- 🚀 **自动化合并工作流**：通过单个命令无缝合并分支
- 🔍 **预检查**：在操作前验证 Git 仓库状态
- 🎯 **智能分支检测**：自动检测当前分支和目标分支
- 🛡️ **冲突检测**：优雅地处理合并冲突，并提供清晰的指导
- 🎨 **美观输出**：彩色、信息丰富的 CLI 界面，带有进度指示器
- 🔄 **安全操作**：完成后始终返回到原始分支
- 🧪 **试运行模式**：预览操作而不进行实际更改
- ⚡ **强制模式**：跳过确认，适用于自动化工作流

## 安装

### 全局安装（推荐）

```bash
npm install -g devkit
```

### 本地开发

```bash
# 克隆仓库
git clone <repository-url>
cd devkit

# 安装依赖
npm install

# 构建项目
npm run build

# 链接用于本地开发
npm link
```

## 使用方法

### 基本用法

```bash
# 将当前分支合并到 staging
devkit merge staging

# 将当前分支合并到 main
devkit merge main
```

### 高级选项

```bash
# 预览合并操作（试运行）
devkit merge staging --dry-run

# 强制合并，无需确认
devkit merge staging --force

# 显示帮助
devkit --help

# 显示版本
devkit --version
```

## 工作原理

当您运行 `devkit merge <target-branch>` 时，该工具执行以下步骤：

1. **预检查**：
   - 验证您是否在 Git 仓库中
   - 检查工作目录是否干净
   - 从 origin 获取最新更改
   - 验证目标分支是否存在

2. **操作规划**：
   - 向您展示将要执行的具体操作
   - 显示源分支和目标分支
   - 请求确认（除非使用 `--force`）

3. **合并工作流**：
   - 切换到目标分支
   - 拉取目标分支的最新更改
   - 将源分支合并到目标分支
   - 将更新后的目标分支推送到远程
   - 切换回原始分支

4. **错误处理**：
   - 检测合并冲突并提供清晰的指导
   - 在出错时安全地返回到原始分支
   - 提供有用的错误信息和恢复步骤

## 示例

### 成功合并

```bash
$ devkit merge staging

🔍 预检查
──────────────────────────────────────────────────
✓ 检测到 Git 仓库
✓ 工作目录干净
✓ 从 origin 获取了最新更改
✓ 目标分支 "staging" 存在

📋 操作计划
──────────────────────────────────────────────────
→ 1. 从 "feature/new-feature" 切换到 "staging"
→ 2. 拉取 "staging" 的最新更改
→ 3. 将 "feature/new-feature" 合并到 "staging"
→ 4. 将 "staging" 推送到远程
→ 5. 切换回 "feature/new-feature"

ℹ 源分支: "feature/new-feature"
ℹ 目标分支: "staging"

? 您想要继续执行合并操作吗？ 是

🚀 执行合并工作流
──────────────────────────────────────────────────
✓ 切换到 "staging"
✓ 拉取了 "staging" 的最新更改
✓ 将 "feature/new-feature" 合并到 "staging"
✓ 将 "staging" 推送到远程
✓ 切换回 "feature/new-feature"

✓ 🎉 成功将 "feature/new-feature" 合并到 "staging"！
ℹ 更改已推送到远程仓库。
```

### 试运行模式

```bash
$ devkit merge staging --dry-run

🔍 预检查
──────────────────────────────────────────────────
✓ 检测到 Git 仓库
✓ 工作目录干净
✓ 从 origin 获取了最新更改
✓ 目标分支 "staging" 存在

📋 操作计划（试运行）
──────────────────────────────────────────────────
→ 1. 从 "feature/new-feature" 切换到 "staging"
→ 2. 拉取 "staging" 的最新更改
→ 3. 将 "feature/new-feature" 合并到 "staging"
→ 4. 将 "staging" 推送到远程
→ 5. 切换回 "feature/new-feature"

ℹ 源分支: "feature/new-feature"
ℹ 目标分支: "staging"

ℹ 试运行完成。没有进行实际更改。
```

## 错误处理

DevKit 优雅地处理各种错误场景：

### 未提交的更改
```bash
✗ 工作目录不干净
✗ 您有未提交的更改。请在合并前提交或暂存它们。
```

### 合并冲突
```bash
✗ 合并失败：检测到合并冲突
✗ 在以下文件中检测到合并冲突：
✗   - src/components/Button.tsx
✗   - src/utils/helpers.ts
ℹ 请手动解决冲突并运行：
ℹ $ git add .
ℹ $ git commit
ℹ $ git push origin staging
```

### 分支未找到
```bash
✗ 目标分支 "nonexistent" 在本地或远程都不存在
```

## 配置

DevKit 可以在任何 Git 仓库中开箱即用。无需额外配置。

## 系统要求

- Node.js >= 14.0.0
- 已安装并配置 Git
- 访问具有远程 origin 的 Git 仓库

## 开发

### 项目结构

```
devkit/
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── src/
│   ├── index.ts         # CLI 入口点
│   ├── commands/
│   │   └── merge.ts     # 合并命令实现
│   ├── utils/
│   │   ├── git.ts       # Git 操作
│   │   └── logger.ts    # 日志工具
│   └── types/
│       └── index.ts     # TypeScript 类型定义
├── bin/
│   └── devkit.js        # 可执行文件
└── README.md
```

### 构建

```bash
# 安装依赖
npm install

# 将 TypeScript 构建为 JavaScript
npm run build

# 以开发模式运行
npm run dev
```
