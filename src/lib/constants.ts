export const URGENCY_CONFIG = {
  low: { label: '低', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  medium: { label: '中', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  high: { label: '高', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  urgent: { label: '紧急', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
} as const;

export const STATUS_CONFIG = {
  open: { label: '待帮助', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  in_progress: { label: '进行中', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  resolved: { label: '已解决', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  closed: { label: '已关闭', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
} as const;

export const DEFAULT_CATEGORIES = [
  { id: 1, name: '生活帮助', icon: '🏠', description: '日常生活中的各种帮助' },
  { id: 2, name: '学习辅导', icon: '📚', description: '学业、技能学习方面的帮助' },
  { id: 3, name: '技术支持', icon: '💻', description: '电脑、手机等技术问题' },
  { id: 4, name: '医疗健康', icon: '🏥', description: '健康咨询、陪同就医等' },
  { id: 5, name: '法律咨询', icon: '⚖️', description: '法律问题咨询与帮助' },
  { id: 6, name: '心理支持', icon: '💬', description: '心理咨询、情感支持' },
  { id: 7, name: '技能交换', icon: '🤝', description: '技能互助与交换' },
  { id: 8, name: '其他帮助', icon: '❤️', description: '其他类型的帮助需求' },
] as const;
