# 使用輕量級 nginx 映像
FROM nginx:alpine

# 複製打包好的 Angular 檔案
COPY dist/cv-blog-front-end/browser /usr/share/nginx/html

# 複製自訂 NGINX 設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
