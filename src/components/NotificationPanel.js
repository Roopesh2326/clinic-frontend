import React from 'react';
import { 
  Badge, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Box, 
  Divider,
  Button,
  Chip
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

const NotificationPanel = ({ notifications, clearNotifications, isConnected }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return 'shopping_cart';
      case 'order_status_update':
        return 'update';
      case 'connected':
        return 'wifi';
      default:
        return 'info';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_order':
        return 'info';
      case 'order_status_update':
        return 'success';
      case 'connected':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 1 }}
      >
        <Badge 
          badgeContent={notifications.length} 
          color="error"
          invisible={notifications.length === 0}
        >
          {isConnected ? (
            <NotificationsIcon />
          ) : (
            <NotificationsOffIcon />
          )}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 350,
            marginTop: '8px'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              size="small" 
              label={isConnected ? "Connected" : "Disconnected"}
              color={isConnected ? "success" : "error"}
            />
            {notifications.length > 0 && (
              <Button 
                size="small" 
                onClick={clearNotifications}
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>
        
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification, index) => (
            <MenuItem 
              key={index} 
              onClick={handleClose}
              sx={{ 
                py: 1.5,
                px: 2,
                borderBottom: index < notifications.length - 1 ? '1px solid #eee' : 'none'
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {notification.message}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={getNotificationIcon(notification.type)}
                    color={getNotificationColor(notification.type)}
                    variant="outlined"
                  />
                </Box>
                
                {notification.data && (
                  <Box sx={{ mt: 1 }}>
                    {notification.data.orderId && (
                      <Typography variant="caption" color="text.secondary">
                        Order ID: #{notification.data.orderId?.toString().slice(-8).toUpperCase()}
                      </Typography>
                    )}
                    {notification.data.newStatus && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Status: {notification.data.newStatus}
                      </Typography>
                    )}
                    {notification.data.total && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Amount: ${notification.data.total}
                      </Typography>
                    )}
                  </Box>
                )}
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {formatTimestamp(notification.timestamp)}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationPanel;
