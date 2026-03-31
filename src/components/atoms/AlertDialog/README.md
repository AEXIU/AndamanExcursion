# AlertDialog Component

A reusable alert dialog component built on top of Radix UI's Alert Dialog primitive. This component provides a consistent, accessible way to show confirmation dialogs throughout the application.

## Features

- ✅ Built on Radix UI primitives for accessibility
- ✅ Keyboard navigation support (Escape to close)
- ✅ Focus trap and focus management
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Flexible action/cancel buttons
- ✅ Support for single-action dialogs

## Installation

First, ensure the Radix Alert Dialog package is installed:

```bash
npm install @radix-ui/react-alert-dialog
```

## Usage

### Basic Usage

```tsx
import { AlertDialog } from "@/components/atoms/AlertDialog";

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
      title="Are you sure?"
      description="This action cannot be undone."
      cancelLabel="Cancel"
      actionLabel="Continue"
      onCancel={() => setOpen(false)}
      onAction={() => {
        // Handle action
        setOpen(false);
      }}
    />
  );
}
```

### Informational Dialog (Single Action)

```tsx
<AlertDialog
  open={showInfo}
  onOpenChange={setShowInfo}
  title="Success!"
  description="Your changes have been saved."
  actionLabel="Got it"
  onAction={() => setShowInfo(false)}
  showOnlyAction={true}
/>
```

### Destructive Action

```tsx
<AlertDialog
  open={showDelete}
  onOpenChange={setShowDelete}
  title="Delete item?"
  description="This action cannot be undone. The item will be permanently deleted."
  cancelLabel="Keep Item"
  actionLabel="Delete"
  variant="destructive"
  onCancel={() => setShowDelete(false)}
  onAction={handleDelete}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Whether the dialog is open (required) |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `title` | `string` | `"Are you sure?"` | Dialog title |
| `description` | `string` | - | Dialog description/message |
| `cancelLabel` | `string` | `"Cancel"` | Label for cancel button |
| `actionLabel` | `string` | `"Continue"` | Label for action button |
| `onCancel` | `() => void` | - | Callback when cancel is clicked (required) |
| `onAction` | `() => void` | - | Callback when action is clicked (required) |
| `variant` | `"default" \| "destructive"` | `"default"` | Visual variant of the action button |
| `showOnlyAction` | `boolean` | `false` | Show only action button (for informational dialogs) |

## Migration from BeforeUnloadModal

The `AlertDialog` component replaces the old `BeforeUnloadModal` with a Radix-based implementation:

### Before
```tsx
<BeforeUnloadModal
  isVisible={showModal}
  onStay={handleStay}
  onLeave={handleLeave}
  title="Leave page?"
  message="Your changes will be lost."
  stayButtonLabel="Stay"
  leaveButtonLabel="Leave"
/>
```

### After
```tsx
<AlertDialog
  open={showModal}
  onOpenChange={(open) => !open && handleStay()}
  title="Leave page?"
  description="Your changes will be lost."
  cancelLabel="Stay"
  actionLabel="Leave"
  onCancel={handleStay}
  onAction={handleLeave}
/>
```

## Accessibility

- Uses proper ARIA attributes via Radix primitives
- Focus is trapped within the dialog when open
- Escape key closes the dialog
- Focus returns to trigger element on close
- Screen reader announcements for title and description

## Styling

The component uses CSS modules for styling. To customize:

1. Override CSS variables in your theme
2. Pass custom `className` via Button props
3. Modify `AlertDialog.module.css` directly

## Related Components

- `BeforeUnloadModal` (deprecated - use AlertDialog instead)
- `Button` - Used for action buttons
- Other Radix-based components: `Dialog`, `Select`, `Accordion`
