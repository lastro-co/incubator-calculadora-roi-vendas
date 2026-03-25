# Analytics System - Usage Examples

## 📊 **Implemented Events**

```typescript
// Page view
track('page_view', {
  page: 'chat',
  section: 'main',
  chatCount: 15,
});

// Chat selection
track('chat_select', {
  page: 'chats',
  action: 'access_chat',
  chatId: 'chat123',
  previousChatId: 'chat456',
});

// Message sent
track('message_sent', {
  page: 'chat',
  action: 'send_message',
  composerState: 'intervening',
  messageLength: 45,
});

// Lais actions
track('button_clicked', {
  buttonId: 'lais_action',
  page: 'chat',
  action: 'pause',
  composerState: 'intervening',
  elementType: 'button',
});
```

## 🔧 **How to use the analytics hook**

```typescript
import { useAnalytics } from '@/lib/analytics';

function MyComponent() {
  const { track } = useAnalytics();

  const handleClick = () => {
    track('button_clicked', {
      page: 'dashboard',
      action: 'open_settings',
      elementType: 'button',
    });
  };

  return <button onClick={handleClick}>Settings</button>;
}
```