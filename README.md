# CvBlogFrontEnd

使用版本為 angular version 19.2.14.

## 事前準備
請先到Node.js的官網 `https://nodejs.org/en/` 下載LTS版本的檔案，並進行安裝(當下為 v22.16.0)
並且確認npm指令可以執行

若要執行方法二則先需安裝docker，可到docker的官網`https://www.docker.com/`下載docker
並確認docker指令可以運行

## 部署程式

### 方法一 (不使用docker)
建置服務，將Repository抓下後，到該repo的根目錄執行
```bash
npm install
```
跑完之後即可使用以下指令
```bash
npm start
```

之後即可到瀏覽器開啟`http://localhost:4200/`看到前端畫面

### 方法二 (使用docker)
建置服務，將Repository抓下後，到該repo的根目錄執行下面指令產生dist目錄
```bash
npm run build
```
產生dist目錄後執行以下指令產生cv-blog-nginx的image檔案
```bash
docker build -t cv-blog-nginx:latest .
```
之後請到`https://github.com/Zantan722/cv-user-service`的development參考方法二進行後續步驟


### 方法三
請直接到`https://cv-front-end-683332902245.asia-east1.run.app`進行使用


## 測試帳號
帳號：admin@gmail.com

密碼：Aaa123123123


## 補充內容

### 設計理念
主要分為USER(一班使用者)與ADMIN(管理者)兩種角色

USER：
1.可以查詢已發佈的文章
2.登入後可以對自己的文章進行新增／修改／刪除
3.並且有個人文章的管理／搜尋畫面

ADMIN:
1.比USER權限更高，可以隨意修改／刪除非個人的文章
2.可以在管理者頁面查詢到已被刪除的文章

查詢頁面主要分為一般的"Blog 查詢系統"、"用戶管理Blog介面"、"管理者管理Blog介面"
```
Blog 查詢系統:在不用登入的情況下也可以進行基本查詢，只可查詢到已發部的文章
```
```
用戶管理Blog介面:只可在登入的情況下進行查詢目前用戶的所有文章，包含草稿狀態的文章，並且可以對自己的文章修改／刪除
```
```
管理者管理Blog介面:可以看到所有文章，包含未發布與已刪除的文章，並且可以進行修改／刪除
```

### 困難點
1.因為是第一次碰angular，所以前面花了比較多時間在學習他的基本程式語法與如和開始專案，所以目前很多函數庫與框架的建立不是很清楚，也不確定目前的分類方式是否是angular的常規框架

2.一開始不知道要去inject Plateform,導致功能寫完，卻有時無法正常執行的問題，因為頁面尚未載入但程式已經執行，導致有些情況會報錯
