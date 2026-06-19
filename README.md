# 美股收盘日报网站

这是一个轻量静态网站，用来每天展示中文《美股收盘日报》，并保留历史归档。

建议 Vercel 项目名：

```text
claire9-us-market-daily
```

部署后默认网址通常会是：

```text
https://claire9-us-market-daily.vercel.app
```

## 本地预览

直接打开 `index.html` 即可。如果浏览器限制本地读取 JSON，可以启动一个本地静态服务：

```bash
python3 -m http.server 4173
```

然后访问：

```text
http://localhost:4173
```

## 内容更新

日报数据保存在：

```text
data/reports.json
```

每天生成新日报后，把最新日报对象追加到 `reports` 数组即可。网站会自动按日期倒序展示最新一篇。

日报写作标准模板保存在：

```text
report-template.md
```

后续如果想调整日报结构、重点股票池或风险框架，优先更新这个模板，并同步更新自动任务提示词。

## 后续自动化建议

正式部署时建议使用：

- Vercel 或 GitHub Pages 托管网站
- GitHub Actions / Vercel Cron 每天北京时间 8:00 运行日报生成任务
- 报告以 JSON + Markdown 双格式保存，便于网页展示和历史复盘
- 所有关键事实保留来源链接、发布时间和数据口径
