# Complete Toast Notification Guide - Detailed Notes

## 1. What is a Toast Notification?

A **toast notification** is a small, temporary message that appears on the screen to inform users about the success, error, or status of an action. It's called "toast" because it "pops up" like a piece of toast from a toaster.

### Characteristics:
- **Temporary**: Disappears automatically after a few seconds
- **Non-intrusive**: Doesn't block the main UI
- **Contextual**: Appears near the action that triggered it
- **Dismissible**: Users can close it manually

## 2. React-Toastify Library

**react-toastify** is the most popular React library for toast notifications.

### Installation:
```bash
npm install react-toastify
```

### Key Features:
- ✅ Easy to use API
- ✅ Highly customizable
- ✅ Accessible (ARIA compliant)
- ✅ TypeScript support
- ✅ Multiple themes
- ✅ Animation support
- ✅ Drag & drop functionality

## 3. Basic Setup

### Step 1: Import Required Components
```javascript
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
```

### Step 2: Add ToastContainer to Your App
```javascript
function App() {
  return (
    <div>
      {/* Your app content */}
      
      <ToastContainer />
    </div>
  );
}
```

### Step 3: Use Toast Functions
```javascript
// Success toast
toast.success('Operation completed successfully!');

// Error toast
toast.error('Something went wrong!');

// Info toast
toast.info('Here is some information');

// Warning toast
toast.warning('Please be careful');

// Default toast
toast('This is a default toast');
```

## 4. ToastContainer Configuration

### Basic Configuration:
```javascript
<ToastContainer
  position="top-right"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
/>
```

### Detailed Property Explanation:

#### **Position Properties:**
```javascript
position="top-right"  // Where toasts appear
// Options: "top-right", "top-left", "top-center", 
//          "bottom-right", "bottom-left", "bottom-center", 
//          "top", "bottom"
```

#### **Timing Properties:**
```javascript
autoClose={5000}      // Auto-close after 5 seconds (in milliseconds)
// Set to false to disable auto-close
// Set to a number for custom timing
```

#### **Visual Properties:**
```javascript
hideProgressBar={false}  // Show/hide the countdown progress bar
newestOnTop={false}      // Stack order (new toasts on top/bottom)
closeOnClick             // Allow clicking to close (boolean)
rtl={false}             // Right-to-left text direction
```

#### **Interaction Properties:**
```javascript
pauseOnFocusLoss        // Pause when browser loses focus
draggable               // Allow dragging toasts around
pauseOnHover            // Pause countdown when hovering
```

#### **Theme Properties:**
```javascript
theme="light"           // "light", "dark", or "colored"
// Or use dynamic theme:
theme={isDarkMode ? "dark" : "light"}
```

## 5. Toast Types and Usage

### Basic Toast Types:
```javascript
// Success (green)
toast.success('Data saved successfully!');

// Error (red)
toast.error('Failed to save data!');

// Warning (orange/yellow)
toast.warning('Please check your input!');

// Info (blue)
toast.info('New update available!');

// Default (gray)
toast('This is a default message');
```

### Advanced Toast Options:
```javascript
// Custom duration
toast.success('Success!', {
  autoClose: 3000  // 3 seconds
});

// Custom position
toast.error('Error!', {
  position: "bottom-center"
});

// Custom styling
toast.success('Custom styled!', {
  style: {
    background: '#4CAF50',
    color: 'white',
    fontSize: '16px'
  }
});

// With custom ID (to prevent duplicates)
toast.success('Only one of this type!', {
  toastId: 'unique-id'
});

// With custom close button
toast.info('Custom close!', {
  closeButton: ({ closeToast }) => (
    <button onClick={closeToast}>Custom Close</button>
  )
});
```

## 6. Advanced Features

### Custom Toast Components:
```javascript
const CustomToast = ({ closeToast }) => (
  <div>
    <h4>Custom Toast!</h4>
    <p>This is a custom toast component</p>
    <button onClick={closeToast}>Close</button>
  </div>
);

toast(<CustomToast />);
```

### Toast with Actions:
```javascript
const ToastWithAction = ({ closeToast }) => (
  <div>
    <p>File deleted successfully</p>
    <button onClick={() => {
      // Undo action
      closeToast();
    }}>
      Undo
    </button>
  </div>
);

toast(<ToastWithAction />);
```

### Promise-based Toasts:
```javascript
// Loading toast that updates based on promise
const saveData = async () => {
  const promise = fetch('/api/save');
  
  toast.promise(promise, {
    pending: 'Saving data...',
    success: 'Data saved successfully!',
    error: 'Failed to save data!'
  });
};
```

## 7. Styling and Customization

### CSS Custom Properties:
```css
:root {
  --toastify-color-light: #fff;
  --toastify-color-dark: #121212;
  --toastify-color-info: #3498db;
  --toastify-color-success: #07bc0c;
  --toastify-color-warning: #f1c40f;
  --toastify-color-error: #e74c3c;
  --toastify-color-transparent: rgba(255, 255, 255, 0.7);
}
```

### Custom CSS Classes:
```javascript
toast.success('Custom class!', {
  className: 'my-custom-toast'
});
```

```css
.my-custom-toast {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

## 8. Best Practices

### Do's:
- ✅ Use appropriate toast types (success, error, warning, info)
- ✅ Keep messages concise and clear
- ✅ Use consistent positioning
- ✅ Provide meaningful error messages
- ✅ Use auto-close for non-critical messages
- ✅ Test on different screen sizes

### Don'ts:
- ❌ Don't overuse toasts (toast fatigue)
- ❌ Don't use toasts for critical errors that need immediate attention
- ❌ Don't make messages too long
- ❌ Don't use toasts for information that should be persistent
- ❌ Don't forget accessibility considerations

## 9. Common Use Cases

### Form Submissions:
```javascript
const handleSubmit = async (data) => {
  try {
    await submitForm(data);
    toast.success('Form submitted successfully!');
  } catch (error) {
    toast.error('Failed to submit form. Please try again.');
  }
};
```

### API Calls:
```javascript
const fetchData = async () => {
  try {
    const response = await api.getData();
    toast.success('Data loaded successfully!');
    return response.data;
  } catch (error) {
    toast.error('Failed to load data');
    throw error;
  }
};
```

### User Actions:
```javascript
const deleteItem = (id) => {
  if (window.confirm('Are you sure?')) {
    // Delete logic
    toast.success('Item deleted successfully!');
  }
};
```

## 10. Accessibility

### ARIA Support:
- Automatically includes proper ARIA attributes
- Screen reader friendly
- Keyboard navigation support

### Custom Accessibility:
```javascript
toast.success('Success!', {
  'aria-label': 'Operation completed successfully',
  role: 'alert'
});
```

## 11. Performance Tips

### Limit Toast Count:
```javascript
// Limit to 3 toasts maximum
<ToastContainer limit={3} />
```

### Remove Duplicates:
```javascript
toast.success('Message', {
  toastId: 'unique-message-id'  // Prevents duplicates
});
```

### Lazy Loading:
```javascript
// Only import when needed
const { toast } = await import('react-toastify');
```

## 12. Troubleshooting

### Common Issues:

1. **Toasts not appearing:**
   - Check if ToastContainer is rendered
   - Verify CSS import is present
   - Check console for errors

2. **Styling issues:**
   - Ensure CSS import is before other styles
   - Check for CSS conflicts
   - Verify theme configuration

3. **Performance issues:**
   - Limit number of toasts
   - Use toastId to prevent duplicates
   - Consider lazy loading

## 13. Your Project Implementation

### Current Setup in App.jsx:
```javascript
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// In your JSX:
<ToastContainer
  position="top-right"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme={theme}
/>
```

### Usage Examples from Your Project:
```javascript
// From AuthContext.jsx
toast.success('Login successful!');
toast.error('Login failed');

// From ApplyLeave.jsx
toast.success('Leave application submitted successfully!');
toast.error('Failed to submit leave application');

// From Profile.jsx
toast.success('Profile updated successfully');
toast.error('Failed to update profile');
```

---

**This comprehensive guide covers everything you need to know about implementing and using toast notifications in your React application!** 🎉

*Created for: Hospital Leave Management System*
*Date: $(date)*
