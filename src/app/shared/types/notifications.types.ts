export interface INotification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  isRead: boolean;
  action: {
    label: string;
    link: string;
  };
  priority: string;
  category: string;
  tags: string[];
}
