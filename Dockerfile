# 使用輕量級 nginx 映像
FROM nginx:alpine

# 先完全清空 nginx 預設檔案
RUN rm -rf /usr/share/nginx/html/*

# 複製建構好的 Angular 檔案到 nginx 目錄
COPY dist/cv-blog-front-end/browser /usr/share/nginx/html

# 處理 Angular 19 的檔案命名
RUN if [ -f /usr/share/nginx/html/index.csr.html ]; then \
        mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi

# 複製自定義 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露 80 連接埠
EXPOSE 80