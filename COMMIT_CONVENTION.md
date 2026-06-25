# Git 提交规范（Commit Convention）

本项目遵循 [Conventional Commits 1.0](https://www.conventionalcommits.org)——它是 [Angular commit guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit) 的通用化标准版本。

> 采用「轻量约定」：提供模板与文档引导，**不强制校验**（不上 husky/commitlint）。
> 原因：本项目由自动化 harness 驱动，强制校验会卡死 harness 的自动 checkpoint 提交。

## 格式

```
<type>(<scope>): <subject>

<body>          # 可选

<footer>        # 可选
```

- **标题行 ≤ 50 字**，`subject` 用祈使句、句尾不加句号（`add` 而非 `added`）。
- Body 与标题空一行，每行 ≤ 72 字，解释 **what & why**。

## type（必填）

| type | 用途 |
|---|---|
| `feat` | 新功能 |
| `fix` | 修 bug |
| `docs` | 文档 |
| `style` | 格式（不影响逻辑） |
| `refactor` | 重构（非新功能、非修 bug） |
| `perf` | 性能优化 |
| `test` | 测试 |
| `build` | 构建系统 / 依赖（vite、package.json、uni-app 构建） |
| `ci` | CI 配置 |
| `chore` | 杂务（不改 src 的维护性提交，如 session checkpoint） |
| `revert` | 回滚 |

## scope（可选，本项目常用）

`pet` · `health` · `knowledge` · `ai` · `user` · `platform` · `store` · `ui` · `config`

## 示例

```
feat(health): add vaccine next-date auto-compute
fix(pet): correct soft-delete filter in pet list
refactor(platform): wrap storage behind H5/MP-WEIXIN adapter
docs: add commit convention
chore: session checkpoint
```

破坏性变更：

```
feat(platform): switch data adapter to wx.cloud

BREAKING CHANGE: H5 mock store no longer auto-seeds; call seed() explicitly.
```

## 启用提交模板

仓库已配置 `.gitmessage` 模板。启用后 `git commit`（不带 `-m`）会自动带出模板提示：

```bash
git config commit.template .gitmessage
```

（本项目已执行此配置，clone 后如未生效可手动再跑一次。）
