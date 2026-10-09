# 知间 · Sang720 的学习导航

项目、文档与学习资源的个人导航站。

网站：https://sang720.github.io/learning-hub/

## 功能

- 搜索名称、简介、标签和分类
- 按分类筛选、收藏、最近访问
- 网格和列表视图，名称与时间排序
- 添加、编辑、删除资料；填写新的分类名称即可创建分类
- 导入、导出 JSON 资料备份
- 适配电脑和手机

## 数据保存

默认公开资料在 `data.js` 中。网页内新增、编辑、删除、收藏和访问记录保存到当前浏览器的 localStorage，不会自动提交到 GitHub，也不会同步给其他访客或设备。可导出 JSON 备份并在另一台设备导入；导入按链接去重并保留现有内容。

要让全部访客看到新的默认资料，请修改 `data.js` 并提交到 main 分支。已有本地资料的浏览器继续使用自己的资料库。发布新资源时，请使用可以公开的内容。

## 文件结构

```text
index.html   页面结构
style.css    外观与移动端布局
app.js       搜索、筛选与资料管理
data.js      默认公开资料
assets/      头像和 Lucide 图标库
```

## 本地与发布

直接打开 `index.html` 即可使用，不需要安装依赖。

GitHub Pages 设置：Settings → Pages → Deploy from a branch → main → /(root)。提交后 GitHub 会自动发布。

## GitHub 基础

- 仓库：一个独立项目的文件及修改记录。
- Commit：保存一组修改并记录说明。
- Fork：在自己的账号下创建他人仓库的分支副本；可以使用 Sync fork 获取上游更新。
- Clone：将仓库及 Git 历史下载到电脑。
- Use this template：使用模板建立独立项目。
- Star / Lists：收藏项目并分类。
- Topics：给自己的仓库添加主题标签。

个人仓库列表没有文件夹层级，建议一个项目一个仓库；代码文件夹用于项目内部组织。使用开源项目时请遵守其 LICENSE。

官方指南：https://docs.github.com/zh

## 资源

图标使用 Lucide（ISC 许可证），许可证见 `assets/lucide-LICENSE`。
头像来自 Sang720 的公开 GitHub 头像。默认资源链接指向各项目的官方站点。
