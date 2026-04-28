# 销售线索邮件通知配置

用户在教练报名弹窗提交信息后，系统会先把信息写入 Supabase `leads` 表，再调用服务端函数发送邮件通知。

默认收件人：

- `lijing@mifujiaoyu.com`
- `zhengjiabao@mifujiaoyu.com`

## 推荐配置

在部署环境里配置下面的环境变量：

```bash
RESEND_API_KEY=你的 Resend API Key
SALES_NOTIFICATION_FROM="米赋AI教育 <no-reply@mifujiaoyu.com>"
SALES_NOTIFICATION_EMAILS="lijing@mifujiaoyu.com,zhengjiabao@mifujiaoyu.com"
```

可选：

```bash
SALES_NOTIFICATION_REPLY_TO="service@mifujiaoyu.com"
```

注意：`SALES_NOTIFICATION_FROM` 使用的域名需要先在 Resend 里完成域名验证，否则邮件服务会拒绝发送。这个不是代码耍脾气，是邮件服务的门卫比较认真。

## 兜底方案

如果没有配置 `RESEND_API_KEY`，代码会尝试沿用原来的 Supabase `enqueue_email` 队列方案：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- 数据库里可用的 `enqueue_email` RPC
- `transactional_emails` 队列

如果 Resend 和 Supabase 邮件队列都没有配置，报名信息仍会保存到 `leads` 表，但页面会提示“邮件通知暂未发送”。
