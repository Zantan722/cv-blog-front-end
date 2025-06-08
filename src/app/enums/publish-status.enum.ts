// src/app/enums/publish-status.enum.ts
export enum PublishStatus {
    /**
     * 草稿
     */
    DRAFT = 'DRAFT',
    /**
     * 發布
     */
    PUBLISHED = 'PUBLISHED'
}

// ✅ 中文顯示映射
export const PublishStatusDisplayMap: Record<PublishStatus, string> = {
    [PublishStatus.DRAFT]: '草稿',
    [PublishStatus.PUBLISHED]: '已發布'
};

// ✅ 工具函數：獲取中文顯示名稱
export function getPublishStatusDisplayName(status: PublishStatus | string | null | undefined): string {
    if (!status) {
        return '未知狀態';
    }
    console.log(status);
    // 如果是字串，嘗試轉換為枚舉
    if (typeof status === 'string') {
        // 檢查是否為有效的 PublishStatus 值
        if (Object.values(PublishStatus).includes(status as PublishStatus)) {
            return PublishStatusDisplayMap[status as PublishStatus];
        }
        return '未知狀態';
    }
    
    return PublishStatusDisplayMap[status] || '未知狀態';
}

// ✅ 工具函數：從字串安全轉換為 PublishStatus
export function parsePublishStatus(statusString: any): PublishStatus | null {
    if (!statusString) {
        return null;
    }
    
    const upperStatus = String(statusString).toUpperCase();
    
    // 檢查是否為有效的 PublishStatus
    if (Object.values(PublishStatus).includes(upperStatus as PublishStatus)) {
        return upperStatus as PublishStatus;
    }
    
    return null;
}

// ✅ 類型守衛
export function isValidPublishStatus(status: any): status is PublishStatus {
    return Object.values(PublishStatus).includes(status);
}